import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { api } from "../services/api";
import axios from "axios";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerShadowPng from "leaflet/dist/images/marker-shadow.png";

import {
  Bed,
  Bath,
  Car,
  Ruler,
  MapPin,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  X,
  Eye,
  CheckCircle,
  Phone,
} from "lucide-react";

import "../styles/ImovelDetalhe.css";

// ─── Leaflet icon fix ────────────────────────────────────────────────────────
const defaultIcon = new L.Icon({
  iconUrl: markerIconPng,
  shadowUrl: markerShadowPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// ─── CEP → coords ────────────────────────────────────────────────────────────
async function getCoordsByCep(cep: string) {
  try {
    const cleanCep = cep.replace(/\D/g, "");
    const res = await axios.get(
      `https://nominatim.openstreetmap.org/search?postalcode=${cleanCep}&country=Brazil&format=json`
    );
    if (res.data?.length > 0) {
      return { lat: parseFloat(res.data[0].lat), lng: parseFloat(res.data[0].lon) };
    }
    return null;
  } catch {
    return null;
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const FAVORITES_KEY = "imoveis_favoritos";

function getFavorites(): string[] {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
  } catch {
    return [];
  }
}

function toggleFavorite(id: string): boolean {
  const favs = getFavorites();
  const idx = favs.indexOf(id);
  if (idx === -1) {
    favs.push(id);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
    return true;
  } else {
    favs.splice(idx, 1);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
    return false;
  }
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function ImovelDetalhe() {
  const { id } = useParams<{ id: string }>();

  const [imovel, setImovel] = useState<any>(null);
  const [selectedImg, setSelectedImg] = useState<string>("");
  const [selectedIdx, setSelectedIdx] = useState(0);

  // lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);

  // favorite
  const [isFavorite, setIsFavorite] = useState(false);

  // share feedback
  const [shareCopied, setShareCopied] = useState(false);

  // simulated views
  const [views] = useState(() => Math.floor(Math.random() * 300) + 50);

  // ── Load imovel ────────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/imovel/${id}`);
        const data = res.data;

        document.title = `${data.titulo} | Imobiliário`;

        setSelectedImg(data?.imagens?.[0] || "");
        setSelectedIdx(0);

        const cep = data?.cep || data?.endereco?.cep || data?.enderecoCep || "";

        let lat = Number(data.lat);
        let lng = Number(data.lng);
        let coordsValid = !isNaN(lat) && !isNaN(lng) && (lat !== 0 || lng !== 0);

        if (!coordsValid && cep) {
          const coords = await getCoordsByCep(cep);
          if (coords) { lat = coords.lat; lng = coords.lng; coordsValid = true; }
        }

        if (!coordsValid) { lat = -23.3218; lng = -46.7296; }

        setImovel({ ...data, lat, lng, hasCoords: coordsValid });
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, [id]);

  // ── Favorite init ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (id) setIsFavorite(getFavorites().includes(id));
  }, [id]);

  // ── Keyboard nav for lightbox ──────────────────────────────────────────────
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (!lightboxOpen || !imovel?.imagens) return;
      if (e.key === "ArrowRight") setLightboxIdx(i => (i + 1) % imovel.imagens.length);
      if (e.key === "ArrowLeft") setLightboxIdx(i => (i - 1 + imovel.imagens.length) % imovel.imagens.length);
      if (e.key === "Escape") setLightboxOpen(false);
    },
    [lightboxOpen, imovel]
  );
  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  // ── Handlers ──────────────────────────────────────────────────────────────
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
    const nowFav = toggleFavorite(id);
    setIsFavorite(nowFav);
  }

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: imovel?.titulo, url });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2500);
    }
  }

  // ── Loading state ─────────────────────────────────────────────────────────
  if (!imovel) return (
    <div className="loading-screen">
      <div className="loading-spinner" />
      <p>Carregando imóvel...</p>
    </div>
  );

  const images = imovel.imagens || [];
  const whatsappMsg = encodeURIComponent(`Olá! Tenho interesse no imóvel: ${imovel.titulo}`);

  // Optional feature flags inferred from the data
  const features: string[] = Array.isArray(imovel.diferenciais)
    ? imovel.diferenciais
    : [];

  return (
    <div>
      <Header />

      {/* ── LIGHTBOX ──────────────────────────────────────────────────────── */}
      {lightboxOpen && (
        <div className="lightbox-overlay" onClick={() => setLightboxOpen(false)}>
          <button className="lightbox-close" onClick={() => setLightboxOpen(false)}>
            <X size={24} />
          </button>

          <button
            className="lightbox-arrow left"
            onClick={e => { e.stopPropagation(); setLightboxIdx(i => (i - 1 + images.length) % images.length); }}
          >
            <ChevronLeft size={32} />
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
            <ChevronRight size={32} />
          </button>

          <div className="lightbox-counter">{lightboxIdx + 1} / {images.length}</div>
        </div>
      )}

      {/* ── MAIN ──────────────────────────────────────────────────────────── */}
      <div className="detalhe-container">

        {/* LEFT */}
        <div className="left">

          {/* MAIN IMAGE */}
          <div className="main-image" onClick={() => openLightbox(selectedIdx)}>
            <img src={selectedImg} alt="Imóvel" />
            <div className="img-overlay-hint">🔍 Clique para ampliar</div>
            {imovel.tipo && <span className="badge-tipo">{imovel.tipo}</span>}
          </div>

          {/* THUMBS */}
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

          {/* MAP */}
          <div className="map-box">

            <div className="map-header">
              <span className="map-title">
                <MapPin size={18} /> Localização
              </span>

              <span className="map-subtitle">
                {imovel.bairro}, {imovel.cidade}
              </span>
            </div>

            {imovel.hasCoords ? (
              <div className="map-wrapper">
                <MapContainer
                  center={[imovel.lat, imovel.lng]}
                  zoom={16}
                  scrollWheelZoom={false}
                  style={{
                    height: "280px",
                    width: "100%",
                    borderRadius: "16px",
                  }}
                >
                  <TileLayer
                    attribution="&copy; OpenStreetMap"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <Marker position={[imovel.lat, imovel.lng]} icon={defaultIcon}>
                    <Popup>
                      <div style={{ fontSize: "14px" }}>
                        <strong>{imovel.titulo}</strong>
                        <br />
                        📍 {imovel.endereco}
                        <br />
                        {imovel.bairro} - {imovel.cidade}
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            ) : (
              <div className="map-placeholder">
                <MapPin size={22} />
                <span>Mapa não disponível</span>
              </div>
            )}

          </div>

        </div>

        {/* RIGHT */}
        <div className="right">
          <h1>{imovel.titulo}</h1>

          {/* STICKY PANEL */}
          <div className="sticky-panel">
            {/* Top bar: views + actions */}
            <div className="top-bar">
              <span className="views-count">
                <Eye size={14} /> {views} visualizações
              </span>
              <div className="action-btns">
                <button
                  className={`btn-icon ${isFavorite ? "active" : ""}`}
                  onClick={handleFavorite}
                  title={isFavorite ? "Remover dos favoritos" : "Favoritar"}
                >
                  <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
                </button>
                <button
                  className="btn-icon"
                  onClick={handleShare}
                  title="Compartilhar"
                >
                  {shareCopied ? <CheckCircle size={18} /> : <Share2 size={18} />}
                </button>
              </div>
            </div>

            {shareCopied && (
              <div className="share-toast">✅ Link copiado!</div>
            )}

            {/* Title */}


            {/* Price */}
            {/* PRICE CARD */}
            <div className="price-box">

              <div className="price-row destaque">
                <span>Valor</span>
                <strong>
                  R$ {Number(imovel.preco).toLocaleString("pt-BR")}
                </strong>
              </div>

              <div className="price-details">

                {imovel.precoCondominio > 0 && (
                  <div className="price-row">
                    <span>Condomínio</span>
                    <strong>
                      R$ {Number(imovel.precoCondominio).toLocaleString("pt-BR")}/mês
                    </strong>
                  </div>
                )}

                {imovel.precoIptu > 0 && (
                  <div className="price-row">
                    <span>IPTU</span>
                    <strong>
                      R$ {Number(imovel.precoIptu).toLocaleString("pt-BR")}/ano
                    </strong>
                  </div>
                )}

              </div>
            </div>

            {/* Details grid */}
            <div className="details">
              <span>
                <Bed size={18} />
                <span>{imovel.quartos} quartos</span>
              </span>

              {imovel.suites > 0 && (
                <span>
                  <Bath size={18} />
                  <span>{imovel.suites} suítes</span>
                </span>
              )}

              <span>
                <Bath size={18} />
                <span>{imovel.banheiros} banheiros</span>
              </span>

              <span>
                <Car size={18} />
                <span>{imovel.vagas} vagas</span>
              </span>

              <span>
                <Ruler size={18} />
                <span>{imovel.area} m²</span>
              </span>
            </div>

            {/* Location */}
            <div className="location">
              <MapPin size={16} />
              <span>{imovel.endereco}, {imovel.bairro} — {imovel.cidade}</span>
            </div>

            {/* Features / amenities */}
            {features.length > 0 && (
              <div className="features-box">
                <h3 className="section-label">Diferenciais</h3>
                <div className="features-grid">
                  {features.map(f => (
                    <span key={f} className="feature-tag">✔ {f}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="description-box">
              <h3 className="section-label">Descrição</h3>
              <p className="description">
                {imovel.descricao?.split("\n").map((line: string, i: number) => (
                  <span key={i}>
                    {line}
                    <br />
                  </span>
                ))}
              </p>
            </div>

            {/* CTA buttons */}
            <div className="cta-group">
              <a
                className="contact-btn whatsapp"
                href={`https://api.whatsapp.com/send?phone=5511947282768&text=${whatsappMsg}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                💬 Falar com corretor
              </a>

              <a
                className="contact-btn phone"
                href="tel:+5511947282768"
              >
                <Phone size={16} /> Ligar agora
              </a>
            </div>

            <p className="cta-note">Resposta em até 1 hora em horário comercial</p>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}