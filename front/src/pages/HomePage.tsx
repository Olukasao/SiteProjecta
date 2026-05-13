import { useEffect, useState, useMemo, useRef, memo, useCallback, type MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import sem_imagem from "../assets/sem-imagem.webp"
import homeHeader from "../assets/home-header.jpg";
import homeHeader2 from "../assets/home-header2.jpg";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { api } from "../services/api";

import { BedDouble, Bath, Car, MapPin } from "lucide-react";
import { FaHome } from "react-icons/fa";

import "../styles/HomePage.css";

interface Imovel {
  id: number;
  titulo: string;
  preco: number;
  bairro: string;
  cidade: string;
  endereco?: string | Record<string, unknown>;
  localizacao?: string;
  tipo?: string;
  quartos?: number;
  banheiros?: number;
  suite?:number;
  vagas?: number;
  imagens?: string[];
}

const HERO_BANNERS = [homeHeader, homeHeader2];

function pluralizar(valor: number | undefined, singular: string, plural: string) {
  const numero = valor || 0;
  return `${numero} ${numero === 1 ? singular : plural}`;
}

function formatarTipo(tipo?: string) {
  if (!tipo) return "Imóvel";
  return tipo.charAt(0).toUpperCase() + tipo.slice(1);
}

function normalizarTexto(valor: unknown = "") {
  const texto =
    valor && typeof valor === "object"
      ? Object.values(valor as Record<string, unknown>).join(" ")
      : String(valor || "");

  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

// ============================
// 🔹 SKELETON CARD
// ============================
function SkeletonCard() {
  return <div className="property-card skeleton" />;
}

// ============================
// 🔹 PROPERTY CARD
// ============================
const PropertyCard = memo(function PropertyCard({ imovel }: { imovel: Imovel }) {
  const navigate = useNavigate();

  const imagem = imovel.imagens?.[0] || sem_imagem;

  const formatarPreco = (valor?: number | string) => {
  const numero = Number(valor) || 0;

  return numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  });
};

  const handleClick = useCallback(() => {
    navigate(`/imovel/${imovel.id}`);
  }, [navigate, imovel.id]);

  const handleCtaClick = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    handleClick();
  }, [handleClick]);

  return (
    <article className="property-card" onClick={handleClick}>
      <div className="property-image">
        <img
          src={imagem}
          alt={imovel.titulo}
          decoding="async"
          onError={(e) => {
            e.currentTarget.src = "/sem-imagem.png";
          }}
        />
        <span className="property-badge">{formatarTipo(imovel.tipo)}</span>
      </div>

      <div className="property-info">
        <h3>{imovel.titulo}</h3>
        <p className="price">{formatarPreco(imovel.preco)}</p>

        <div className="property-details">
          <div className="detail-item">
            <BedDouble size={16} />
            <span>{pluralizar(imovel.quartos, "quarto", "quartos")}</span>
          </div>

          <div className="detail-item">
            <Bath size={16} />
            <span>{pluralizar(imovel.banheiros, "banheiro", "banheiros")}</span>
          </div>

          <div className="detail-item">
            <Bath size={16} />
            <span>{pluralizar(imovel.suite, "suíte", "suítes")}</span>
          </div>

          <div className="detail-item">
            <Car size={16} />
            <span>{pluralizar(imovel.vagas, "vaga", "vagas")}</span>
          </div>
        </div>

        <p className="location">
          <MapPin size={15} />
          {imovel.bairro}, {imovel.cidade}
        </p>

        <button type="button" className="property-cta" onClick={handleCtaClick}>
          <span>Ver detalhes</span>
          <FaHome />
        </button>
      </div>
    </article>
  );
});

// ============================
// 🔹 HOME PAGE
// ============================
export default function HomePage() {
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [buscaDebounced, setBuscaDebounced] = useState("");
  const [tipo, setTipo] = useState("");
  const [preco, setPreco] = useState("");
  const [quartos, setQuartos] = useState(0);
  const [bannerAtual, setBannerAtual] = useState(0);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const buscaRef = useRef("");
  const imoveisSectionRef = useRef<HTMLElement | null>(null);

  const handleBusca = (valor: string) => {
    buscaRef.current = valor;
    setBusca(valor);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setBuscaDebounced(valor);
    }, 400);
  };

  const aplicarBusca = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setBuscaDebounced(buscaRef.current);

    requestAnimationFrame(() => {
      imoveisSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  useEffect(() => {
    document.title = "Projecta Empreendimentos";

    api.get("/imoveis")
      .then(({ data }) => setImoveis(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setBannerAtual((atual) => (atual + 1) % HERO_BANNERS.length);
    }, 8000);

    return () => window.clearInterval(interval);
  }, []);

  const imoveisFiltrados = useMemo(() => {
    const termo = normalizarTexto(buscaDebounced);

    return imoveis.filter((imovel) => {
      if (termo) {
        const camposBusca = [
          imovel.titulo,
          imovel.cidade,
          imovel.bairro,
          imovel.endereco,
          imovel.localizacao,
          imovel.tipo,
        ];

        const match = camposBusca.some((campo) =>
          normalizarTexto(campo).includes(termo)
        );

        if (!match) return false;
      }

      if (tipo && imovel.tipo !== tipo) return false;
      if (quartos && (imovel.quartos || 0) < quartos) return false;

      if (preco) {
        if (preco === "200k" && imovel.preco > 200000) return false;
        if (preco === "500k" && imovel.preco > 500000) return false;
        if (preco === "500k+" && imovel.preco <= 500000) return false;
      }

      return true;
    });
  }, [imoveis, buscaDebounced, tipo, preco, quartos]);

  const temFiltroAtivo = Boolean(normalizarTexto(busca) || tipo || preco || quartos > 0);

  const limparFiltros = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    buscaRef.current = "";
    setBusca("");
    setBuscaDebounced("");
    setTipo("");
    setPreco("");
    setQuartos(0);
  };

  return (
    <div className="home">
      <Header />

      {/* HERO */}
      <section className="hero">
        <div className="hero-slider" aria-hidden="true">
          {HERO_BANNERS.map((banner, index) => (
            <div
              key={banner}
              className={`hero-slide ${index === bannerAtual ? "active" : ""}`}
            >
              <img src={banner} alt="" />
            </div>
          ))}
        </div>

        <div className="hero-box">
          <h1>Encontre o imóvel ideal para você</h1>
          <p>Imóveis selecionados para comprar ou alugar com segurança e confiança.</p>

          <div className="search">
            <input
              type="text"
              placeholder="Buscar por cidade, bairro ou título..."
              value={busca}
              onChange={(e) => handleBusca(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  aplicarBusca();
                }
              }}
            />
            <button type="button" onClick={aplicarBusca}>Buscar</button>
          </div>

          <p className="hero-trust">
            Compra segura • Imóveis selecionados • Atendimento especializado
          </p>
        </div>
      </section>

      {/* FILTROS */}
      <section className="section filters-section">
        <div className="container">
          <div className="filters-panel">
            <div className="filters-header">
              <div className="filters-title">
                <h2>Filtros</h2>
                <p>Refine sua busca para encontrar o imóvel ideal.</p>
              </div>

              {temFiltroAtivo && (
                <button className="btn-limpar" onClick={limparFiltros}>
                  Limpar filtros
                </button>
              )}
            </div>

            <div className="filters">
              <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
                <option value="">Tipo</option>
                <option value="casa">Casa</option>
                <option value="apartamento">Apartamento</option>
                <option value="terreno">Terreno</option>
                <option value="comercial">Comercial</option>
              </select>

              <select value={preco} onChange={(e) => setPreco(e.target.value)}>
                <option value="">Preço</option>
                <option value="200k">Até R$ 200k</option>
                <option value="500k">Até R$ 500k</option>
                <option value="500k+">Acima de R$ 500k</option>
              </select>

              <select
                value={quartos}
                onChange={(e) => setQuartos(Number(e.target.value))}
              >
                <option value={0}>Quartos</option>
                <option value={1}>1+</option>
                <option value={2}>2+</option>
                <option value={3}>3+</option>
                <option value={4}>4+</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* LISTA */}
      <section className="section listings-section imoveis-section" ref={imoveisSectionRef}>
        <div className="container">
          <div className="results-header">
            <h2>Imóveis</h2>
            {!loading && (
              <span className="results-count">
                {imoveisFiltrados.length} imóvel(is) encontrado(s)
              </span>
            )}
          </div>

          {loading ? (
            <div className="properties-grid">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <SkeletonCard key={n} />
              ))}
            </div>
          ) : imoveisFiltrados.length === 0 ? (
            <div className="empty-state">
              <p>Nenhum imóvel encontrado.</p>
              {temFiltroAtivo && (
                <button onClick={limparFiltros}>Limpar filtros</button>
              )}
            </div>
          ) : (
            <div className="properties-grid">
              {imoveisFiltrados.map((imovel) => (
                <PropertyCard
                  key={imovel.id}
                  imovel={imovel}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
