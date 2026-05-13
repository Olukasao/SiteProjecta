import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bed, Bath, Car, Ruler, MapPin, SearchX,
  Waves, Flame, Dumbbell, ShieldCheck,
  Building, Dog, Sofa, PartyPopper,
} from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { api } from "../services/api";
import "../styles/Imoveis.css";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Imovel {
  id: number;
  titulo: string;
  preco: number;
  cidade: string;
  bairro: string;
  endereco: string;
  cep: string;
  tipo: string;
  status: string;
  quartos: number;
  banheiros: number;
  vagas: number;
  area: number;
  descricao: string;
  imagens: string[];
  diferenciais: string[];
}

interface Filtros {
  busca: string;
  tipo: string;
  status: string;
  precoMin: string;
  precoMax: string;
  quartos: string;
  banheiros: string;
  vagas: string;
  areaMin: string;
  areaMax: string;
  cep: string;
  diferenciais: string[];
}

// ── Constants ─────────────────────────────────────────────────────────────────
const FILTROS_INICIAIS: Filtros = {
  busca: "", tipo: "", status: "",
  precoMin: "", precoMax: "",
  quartos: "", banheiros: "", vagas: "",
  areaMin: "", areaMax: "",
  cep: "", diferenciais: [],
};

const DIFERENCIAIS = [
  { nome: "Piscina", icon: <Waves size={14} /> },
  { nome: "Churrasqueira", icon: <Flame size={14} /> },
  { nome: "Academia", icon: <Dumbbell size={14} /> },
  { nome: "Portaria 24h", icon: <ShieldCheck size={14} /> },
  { nome: "Elevador", icon: <Building size={14} /> },
  { nome: "Pet friendly", icon: <Dog size={14} /> },
  { nome: "Mobiliado", icon: <Sofa size={14} /> },
  { nome: "Salão de festas", icon: <PartyPopper size={14} /> },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatBRL(valor: number) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  });
}
const formatarPreco = (v: any) =>
  Number(v || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

// ── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonGrid() {
  return (
    <div className="skeleton-grid">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton-img" />
          <div className="skeleton-body">
            <div className="skeleton-line short" />
            <div className="skeleton-line med" />
            <div className="skeleton-line full" />
            <div className="skeleton-line short" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function Imoveis() {
  const navigate = useNavigate();
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_INICIAIS);

  // ── Load ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/imoveis");
        setImoveis(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
    document.title = "Imóveis disponíveis | Meu Imobiliário";
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  }

  function toggleDiferencial(nome: string) {
    setFiltros(prev => {
      const lista = prev.diferenciais.includes(nome)
        ? prev.diferenciais.filter(d => d !== nome)
        : [...prev.diferenciais, nome];
      return { ...prev, diferenciais: lista };
    });
  }

  function clearFiltros() {
    setFiltros(FILTROS_INICIAIS);
  }

  // ── Filter logic ──────────────────────────────────────────────────────────
  const imoveisFiltrados = useMemo(() => {
    const texto = filtros.busca.toLowerCase();

    return imoveis.filter(im => {
      if (texto && ![im.titulo, im.cidade, im.bairro, im.endereco]
        .some(v => v?.toLowerCase().includes(texto))) return false;

      if (filtros.tipo && im.tipo !== filtros.tipo) return false;
      if (filtros.status && im.status !== filtros.status) return false;

      if (filtros.precoMin && im.preco < Number(filtros.precoMin)) return false;
      if (filtros.precoMax && im.preco > Number(filtros.precoMax)) return false;

      if (filtros.quartos && im.quartos < Number(filtros.quartos)) return false;
      if (filtros.banheiros && im.banheiros < Number(filtros.banheiros)) return false;
      if (filtros.vagas && im.vagas < Number(filtros.vagas)) return false;

      if (filtros.areaMin && im.area < Number(filtros.areaMin)) return false;
      if (filtros.areaMax && im.area > Number(filtros.areaMax)) return false;

      if (filtros.cep && !im.cep?.includes(filtros.cep)) return false;

      if (filtros.diferenciais.length > 0) {
        if (!filtros.diferenciais.every(d => (im.diferenciais || []).includes(d))) return false;
      }

      return true;
    });
  }, [imoveis, filtros]);

  const hasActiveFiltros =
    Object.entries(filtros).some(([k, v]) =>
      k !== "diferenciais" ? v !== "" : (v as string[]).length > 0
    );

  return (
    <>
      <Header />

      {/* ── HERO ── */}
      <section className="page-hero">
        <h1>Encontre seu imóvel ideal</h1>
        <p>Filtre por localização, tipo, preço e muito mais</p>
      </section>

      <section className="imoveis-layout">

        {/* ── SIDEBAR ── */}
        <aside className="filters-sidebar">
          <div className="sidebar-header">
            <h3>Filtros</h3>
            {hasActiveFiltros && (
              <button className="btn-clear" onClick={clearFiltros}>
                Limpar tudo
              </button>
            )}
          </div>

          <input
            name="busca"
            placeholder="Cidade, bairro ou nome"
            value={filtros.busca}
            onChange={handleChange}
          />

          <select name="tipo" value={filtros.tipo} onChange={handleChange}>
            <option value="">Tipo de imóvel</option>
            <option value="casa">Casa</option>
            <option value="apartamento">Apartamento</option>
            <option value="terreno">Terreno</option>
            <option value="comercial">Comercial</option>
          </select>

          <select name="status" value={filtros.status} onChange={handleChange}>
            <option value="">Negócio</option>
            <option value="venda">Venda</option>
            <option value="aluguel">Aluguel</option>
          </select>

          {/* Price range */}
          <div className="filtro-grupo">
            <label className="filtro-titulo">Faixa de preço</label>
            <div className="range-row">
              <input
                name="precoMin"
                type="number"
                placeholder="Mínimo"
                value={filtros.precoMin}
                onChange={handleChange}
              />
              <input
                name="precoMax"
                type="number"
                placeholder="Máximo"
                value={filtros.precoMax}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Details */}
          <div className="filtro-grupo">
            <label className="filtro-titulo">Detalhes</label>
            <select name="quartos" value={filtros.quartos} onChange={handleChange}>
              <option value="">Quartos</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
            </select>
            <select name="banheiros" value={filtros.banheiros} onChange={handleChange}>
              <option value="">Banheiros</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
            </select>
            <select name="vagas" value={filtros.vagas} onChange={handleChange}>
              <option value="">Vagas de garagem</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
            </select>
          </div>

          {/* Area range */}
          <div className="filtro-grupo">
            <label className="filtro-titulo">Área (m²)</label>
            <div className="range-row">
              <input
                name="areaMin"
                type="number"
                placeholder="Mínimo"
                value={filtros.areaMin}
                onChange={handleChange}
              />
              <input
                name="areaMax"
                type="number"
                placeholder="Máximo"
                value={filtros.areaMax}
                onChange={handleChange}
              />
            </div>
          </div>

          <input
            name="cep"
            placeholder="CEP"
            value={filtros.cep}
            onChange={handleChange}
          />

          {/* Diferenciais */}
          <div className="filtro-grupo">
            <label className="filtro-titulo">Diferenciais</label>
            <div className="filtro-diferenciais">
              {DIFERENCIAIS.map(item => (
                <label key={item.nome} className="check-card">
                  <input
                    type="checkbox"
                    checked={filtros.diferenciais.includes(item.nome)}
                    onChange={() => toggleDiferencial(item.nome)}
                  />
                  <div className="check-content">
                    {item.icon}
                    <span>{item.nome}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* ── RESULTS ── */}
        <div className="imoveis-content">

          {/* Results bar */}
          <div className="results-bar">
            <span className="results-count">
              {loading
                ? "Carregando..."
                : <><strong>{imoveisFiltrados.length}</strong> imóveis encontrados</>
              }
            </span>
          </div>

          {/* Grid */}
          {loading ? (
            <SkeletonGrid />
          ) : (
            <div className="properties-grid">
              {imoveisFiltrados.length === 0 ? (
                <div className="empty-state">
                  <SearchX size={42} />
                  <strong>Nenhum imóvel encontrado</strong>
                  <span>Tente ajustar os filtros para ver mais resultados.</span>
                </div>
              ) : (
                imoveisFiltrados.map(imovel => (
                  <article
                    key={imovel.id}
                    className="property-card"
                    onClick={() => navigate(`/imovel/${imovel.id}`)}
                  >
                    {/* Image */}
                    <div className="card-image">
                      <img
                        src={imovel.imagens?.[0]}
                        alt={imovel.titulo}
                        loading="lazy"
                      />
                      {imovel.status && (
                        <span className={`card-badge ${imovel.status}`}>
                          {imovel.status}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="property-info">
                      <h3 className="card-title">{imovel.titulo}</h3>

                      <p className="card-price">{formatarPreco(imovel.preco)}</p>

                      <p className="card-location">
                        <MapPin size={12} />
                        {[imovel.bairro, imovel.cidade].filter(Boolean).join(", ")}
                      </p>

                      <div className="card-features">
                        {imovel.quartos > 0 && (
                          <span><Bed size={12} /> {imovel.quartos}</span>
                        )}
                        {imovel.banheiros > 0 && (
                          <span><Bath size={12} /> {imovel.banheiros}</span>
                        )}
                        {imovel.vagas > 0 && (
                          <span><Car size={12} /> {imovel.vagas}</span>
                        )}
                        {imovel.area > 0 && (
                          <span><Ruler size={12} /> {imovel.area} m²</span>
                        )}
                      </div>

                      {imovel.descricao && (
                        <p className="card-desc">
                          {imovel.descricao.slice(0, 90)}
                          {imovel.descricao.length > 90 ? "..." : ""}
                        </p>
                      )}
                    </div>
                  </article>
                ))
              )}
            </div>
          )}
        </div>

      </section>

      <Footer />
    </>
  );
}