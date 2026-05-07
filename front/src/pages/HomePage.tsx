import { useEffect, useState, useMemo, useRef, memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import sem_imagem from "../assets/sem-imagem.webp"
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
  tipo?: string;
  quartos?: number;
  banheiros?: number;
  suite?:number;
  vagas?: number;
  imagens?: string[];
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
  }, [imovel.id]);

  return (
    <div className="property-card" onClick={handleClick}>
      <img
        src={imagem}
        alt={imovel.titulo}
        decoding="async"
        onError={(e) => {
          e.currentTarget.src = "/sem-imagem.png";
        }}
      />
      <div className="property-info">
        <h3>{imovel.titulo}</h3>
        <p className="price">{formatarPreco(imovel.preco)}</p>
        <div className="property-details">
          <div className="detail-item">
            <BedDouble size={16} />
            <span>{imovel.quartos || 0} quartos</span>
          </div>

          <div className="detail-item">
            <Bath size={16} />
            <span>{imovel.banheiros || 0} banheiros</span>
          </div>
           <div className="detail-item">
            <Bath size={16} />
            <span>{imovel.suite || 0} Suite</span>
          </div>

          <div className="detail-item">
            <Car size={16} />
            <span>{imovel.vagas || 0} vagas</span>
          </div>
        </div>

        <p className="location">
          <MapPin size={15} />
          {imovel.bairro}, {imovel.cidade}
        </p>

        <div className="property-type">
          <FaHome />
          <span>{imovel.tipo || "Imóvel"}</span>
        </div>
      </div>
    </div>
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

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleBusca = (valor: string) => {
    setBusca(valor);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setBuscaDebounced(valor);
    }, 400);
  };

  useEffect(() => {
    document.title = "Projecta Empreendimentos";

    api.get("/imoveis")
      .then(({ data }) => setImoveis(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const imoveisFiltrados = useMemo(() => {
    return imoveis.filter((imovel) => {
      if (buscaDebounced) {
        const termo = buscaDebounced.toLowerCase();
        const match =
          imovel.cidade?.toLowerCase().includes(termo) ||
          imovel.bairro?.toLowerCase().includes(termo) ||
          imovel.titulo?.toLowerCase().includes(termo);
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

  const temFiltroAtivo = busca || tipo || preco || quartos > 0;

  const limparFiltros = () => {
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
        <div className="hero-box">
          <h1>Encontre seu novo lar</h1>
          <p>Milhares de imóveis para comprar ou alugar</p>

          <div className="search">
            <input
              placeholder="Buscar por cidade, bairro ou título..."
              value={busca}
              onChange={(e) => handleBusca(e.target.value)}
            />
            <button>Buscar</button>
          </div>
        </div>
      </section>

      {/* FILTROS */}
      <section className="section">
        <div className="container">
          <div className="filters-header">
            <h2>Filtros</h2>
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
      </section>

      {/* LISTA */}
      <section className="section">
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
              <p>Nenhum imóvel encontrado</p>
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