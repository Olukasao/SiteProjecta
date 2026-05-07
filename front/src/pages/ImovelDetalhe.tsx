import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import * as L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerShadowPng from "leaflet/dist/images/marker-shadow.png";
import {
  Bed, Bath, Car, Ruler, MapPin,
  Heart, Share2, ChevronLeft, ChevronRight,
  X, Eye, CheckCircle, Phone,
} from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { api } from "../services/api";
import "../styles/ImovelDetalhe.css";

// ── Leaflet icon fix ──────────────────────────────────────────────────────────
const defaultIcon = new L.Icon({
  iconUrl: markerIconPng,
  shadowUrl: markerShadowPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// ── CEP → coords ──────────────────────────────────────────────────────────────
async function getCoordsByCep(cep: string) {
  try {
    const clean = cep.replace(/\D/g, "");
    const res = await axios.get(
      `https://nominatim.openstreetmap.org/search?postalcode=${clean}&country=Brazil&format=json`
    );
    if (res.data?.length > 0) {
      return {
        lat: parseFloat(res.data[0].lat),
        lng: parseFloat(res.data[0].lon),
      };
    }
    return null;
  } catch {
    return null;
  }
}

// ── Favorites helpers ─────────────────────────────────────────────────────────
const FAVORITES_KEY = "imoveis_favoritos";

function getFavorites(): string[] {
  try { return JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]"); }
  catch { return []; }
}

function toggleFavorite(id: string): boolean {
  const favs = getFavorites();
  const idx = favs.indexOf(id);
  if (idx === -1) { favs.push(id); }
  else { favs.splice(idx, 1); }
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
  return idx === -1;
}

// ── Formatters ────────────────────────────────────────────────────────────────
function formatBRL(value: number | string) {
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  });
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function ImovelDetalhe() {
  const { id } = useParams<{ id: string }>();

  const [imovel, setImovel] = useState<any>(null);
  const [selectedImg, setSelectedImg] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);

  const [isFavorite, setIsFavorite] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const [views] = useState(() => Math.floor(Math.random() * 300) + 50);

  // ── Load ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/imovel/${id}`);
        const data = res.data;

        document.title = `${data.titulo} | Imobiliário`;

        const imagens: string[] = Array.isArray(data.imagens) ? data.imagens : [];
        setSelectedImg(imagens[0] || "");
        setSelectedIdx(0);

        const cep = data?.cep || data?.endereco?.cep || "";

        let lat = Number(data.lat);
        let lng = Number(data.lng);
        let coordsValid = !isNaN(lat) && !isNaN(lng) && (lat !== 0 || lng !== 0);

        if (!coordsValid && cep) {
          const coords = await getCoordsByCep(cep);
          if (coords) { lat = coords.lat; lng = coords.lng; coordsValid = true; }
        }

        if (!coordsValid) { lat = -23.3218; lng = -46.7296; }

        setImovel({ ...data, imagens, lat, lng, hasCoords: coordsValid });
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, [id]);

  // ── Favorite init ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (id) setIsFavorite(getFavorites().includes(id));
  }, [id]);

  // ── Keyboard nav ────────────────────────────────────────────────────────────
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (!lightboxOpen || !imovel?.imagens?.length) return;
      const len = imovel.imagens.length;
      if (e.key === "ArrowRight") setLightboxIdx(i => (i + 1) % len);
      if (e.key === "ArrowLeft")  setLightboxIdx(i => (i - 1 + len) % len);
      if (e.key === "Escape")     setLightboxOpen(false);
    },
    [lightboxOpen, imovel]
  );
  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  function selectImage(img: string, idx: number) {
    setSelectedImg(img);
    setSelectedIdx(idx);
  }

  function openLightbox(idx: number) {
    setLightboxIdx(idx);
    setLightboxOpen(true);
  }

  function handleFavorite() {
    if (!id) return;
    setIsFavorite(toggleFavorite(id));
  }

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: imovel?.titulo, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
    }
  }

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (!imovel) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Carregando imóvel...</p>
      </div>
    );
  }

  const images: string[] = imovel.imagens || [];
  const features: string[] = Array.isArray(imovel.diferenciais) ? imovel.diferenciais : [];
  const whatsappMsg = encodeURIComponent(`Olá! Tenho interesse no imóvel: ${imovel.titulo}`);

  return (
    <div>
      <Header />

      {/* ── LIGHTBOX ──────────────────────────────────────────────────────── */}
      {lightboxOpen && (
        <div className="lightbox-overlay" onClick={() => setLightboxOpen(false)}>
          <button className="lightbox-close" onClick={() => setLightboxOpen(false)}>
            <X size={22} />
          </button>

          <button
            className="lightbox-arrow left"
            onClick={e => { e.stopPropagation(); setLightboxIdx(i => (i - 1 + images.length) % images.length); }}
          >
            <ChevronLeft size={28} />
          </button>

          <img
            className="lightbox-img"
            src={images[lightboxIdx]}
            alt={`Foto ${lightboxIdx + 1}`}
            onClick={e => e.stopPropagation()}
          />

          <button
            className="lightbox-arrow right"
            onClick={e => { e.stopPropagation(); setLightboxIdx(i => (i + 1) % images.length); }}
          >
            <ChevronRight size={28} />
          </button>

          <div className="lightbox-counter">{lightboxIdx + 1} / {images.length}</div>
        </div>
      )}

      {/* ── MAIN LAYOUT ───────────────────────────────────────────────────── */}
      <div className="detalhe-container">

        {/* ── LEFT ── */}
        <div className="left">

          {/* Main Image */}
          <div className="main-image" onClick={() => openLightbox(selectedIdx)}>
            <img src={selectedImg} alt={imovel.titulo} />
            <div className="img-overlay-hint">🔍 Clique para ampliar</div>
            {imovel.tipo && <span className="badge-tipo">{imovel.tipo}</span>}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="thumbs">
              {images.map((img: string, i: number) => (
                <img
                  key={i}
                  src={img}
                  className={selectedImg === img ? "active" : ""}
                  onClick={() => selectImage(img, i)}
                  alt={`Miniatura ${i + 1}`}
                />
              ))}
            </div>
          )}

          {/* Map */}
          <div className="map-box">
            <div className="map-header">
              <span className="map-title">
                <MapPin size={16} /> Localização
              </span>
              <span className="map-subtitle">
                {[imovel.bairro, imovel.cidade].filter(Boolean).join(", ")}
              </span>
            </div>

            {imovel.hasCoords ? (
              <div className="map-wrapper">
                <MapContainer
                  center={[imovel.lat, imovel.lng]}
                  zoom={16}
                  scrollWheelZoom={false}
                  style={{ height: "260px", width: "100%" }}
                >
                  <TileLayer
                    attribution="&copy; OpenStreetMap"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[imovel.lat, imovel.lng]} icon={defaultIcon}>
                    <Popup>
                      <strong>{imovel.titulo}</strong>
                      <br />
                      📍 {imovel.endereco}
                      <br />
                      {imovel.bairro} — {imovel.cidade}
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            ) : (
              <div className="map-placeholder">
                <MapPin size={26} />
                <span>Mapa não disponível</span>
              </div>
            )}
          </div>

        </div>

        {/* ── RIGHT ── */}
        <div className="right">
          <h1>{imovel.titulo}</h1>

          <div className="sticky-panel">

            {/* Top bar */}
            <div className="top-bar">
              <span className="views-count">
                <Eye size={13} /> {views} visualizações
              </span>
              <div className="action-btns">
                <button
                  className={`btn-icon ${isFavorite ? "active" : ""}`}
                  onClick={handleFavorite}
                  title={isFavorite ? "Remover dos favoritos" : "Favoritar"}
                >
                  <Heart size={17} fill={isFavorite ? "currentColor" : "none"} />
                </button>
                <button className="btn-icon" onClick={handleShare} title="Compartilhar">
                  {shareCopied
                    ? <CheckCircle size={17} />
                    : <Share2 size={17} />
                  }
                </button>
              </div>
            </div>

            {shareCopied && (
              <div className="share-toast">✅ Link copiado para a área de transferência</div>
            )}

            {/* Price */}
            <div className="price-box">
              <div className="price-row destaque">
                <span>Valor</span>
                <strong>{formatBRL(imovel.preco)}</strong>
              </div>

              {Number(imovel.precoCondominio) > 0 && (
                <div className="price-row">
                  <span>Condomínio</span>
                  <strong>{formatBRL(imovel.precoCondominio)}/mês</strong>
                </div>
              )}

              {Number(imovel.precoIptu) > 0 && (
                <div className="price-row">
                  <span>IPTU</span>
                  <strong>{formatBRL(imovel.precoIptu)}/ano</strong>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="details">
              {imovel.quartos && (
                <span><Bed size={15} /> {imovel.quartos} quartos</span>
              )}
              {Number(imovel.suites) > 0 && (
                <span><Bath size={15} /> {imovel.suites} suítes</span>
              )}
              {imovel.banheiros && (
                <span><Bath size={15} /> {imovel.banheiros} banheiros</span>
              )}
              {imovel.vagas && (
                <span><Car size={15} /> {imovel.vagas} vagas</span>
              )}
              {imovel.area && (
                <span><Ruler size={15} /> {imovel.area} m²</span>
              )}
            </div>

            {/* Location */}
            <div className="location">
              <MapPin size={15} />
              <span>
                {[imovel.endereco, imovel.bairro, imovel.cidade]
                  .filter(Boolean)
                  .join(", ")}
              </span>
            </div>

            {/* Features */}
            {features.length > 0 && (
              <div className="features-box">
                <p className="section-label">Diferenciais</p>
                <div className="features-grid">
                  {features.map(f => (
                    <span key={f} className="feature-tag">✔ {f}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {imovel.descricao && (
              <div className="description-box">
                <p className="section-label">Descrição</p>
                <p className="description">
                  {imovel.descricao.split("\n").map((line: string, i: number) => (
                    <span key={i}>{line}<br /></span>
                  ))}
                </p>
              </div>
            )}

            {/* CTA */}
            <div className="cta-group">
              <a
                className="contact-btn whatsapp"
                href={`https://api.whatsapp.com/send?phone=5511993878619&text=${whatsappMsg}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                💬 Falar com corretor
              </a>
              <a
                className="contact-btn phone"
                href="tel:+5511993878619"
              >
                <Phone size={15} /> Ligar agora
              </a>
            </div>

            <p className="cta-note">Resposta em até 1h em horário comercial</p>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}