import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Header from "../components/Header";
import Footer from "../components/Footer";

import { api } from "../services/api";

import "../styles/HomePage.css";


interface Imovel {
  id: number;
  titulo: string;
  preco: number;
  bairro: string;
  cidade: string;
  quartos?: number;
  banheiros?: number;
  vagas?: number;
  imagens?: string[];
}

export default function HomePage() {
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // 🔄 Buscar imóveis
  useEffect(() => {
    const fetchImoveis = async () => {
      try {
        const { data } = await api.get("/imoveis");
        setImoveis(data);
      } catch (error) {
        console.error("Erro ao carregar imóveis:", error);
      } finally {
        setLoading(false);
      }
    };
    document.title = "Projecta Empreendimento";

    fetchImoveis();
  }, []);

  // 💰 Formatar preço
  const formatarPreco = (valor: number) => {
    return valor.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
    });
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
            <input placeholder="Buscar por cidade, bairro..." />
            <button>Buscar</button>
          </div>
        </div>
      </section>

      {/* FILTROS */}
      <section className="section">
        <div className="container">
          <h2>Filtros</h2>

          <div className="filters">
            <input placeholder="Cidade ou bairro" />

            <select>
              <option>Tipo</option>
              <option>Casa</option>
              <option>Apartamento</option>
            </select>

            <select>
              <option>Preço</option>
              <option>Até R$ 200k</option>
              <option>Até R$ 500k</option>
              <option>Acima de R$ 500k</option>
            </select>

            <select>
              <option>Quartos</option>
              <option>1+</option>
              <option>2+</option>
              <option>3+</option>
            </select>

            <button>Filtrar</button>
          </div>
        </div>
      </section>

      {/* LISTA DE IMÓVEIS */}
      <section className="section">
        <div className="container">
          <h2>Imóveis</h2>

          {loading ? (
            <p>Carregando imóveis...</p>
          ) : imoveis.length === 0 ? (
            <p>Nenhum imóvel encontrado</p>
          ) : (
            <div className="properties-grid">
              {imoveis.map((imovel) => (
                <PropertyCard
                  key={imovel.id}
                  imovel={imovel}
                  onClick={() => navigate(`/imovel/${imovel.id}`)}
                  formatarPreco={formatarPreco}
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

/* 🔹 COMPONENTE SEPARADO */
function PropertyCard({
  imovel,
  onClick,
  formatarPreco,
}: {
  imovel: Imovel;
  onClick: () => void;
  formatarPreco: (valor: number) => string;
}) {
  const imagem =
    imovel.imagens?.[0] || "https://via.placeholder.com/300x200";

  return (
    <div className="property-card" onClick={onClick}>
      <img
        src={imagem}
        alt={imovel.titulo}
        onError={(e) => {
          e.currentTarget.src = "https://via.placeholder.com/300x200";
        }}
      />

      <div className="property-info">
        <h3>{imovel.titulo}</h3>

        <p className="price">
          R$ {formatarPreco(imovel.preco)}
        </p>

        <span>
          {imovel.quartos || 0} quartos •{" "}
          {imovel.banheiros || 0} banheiros •{" "}
          {imovel.vagas || 0} vagas
        </span>

        <p className="location">
          📍 {imovel.bairro}, {imovel.cidade}
        </p>
      </div>
    </div>
  );
}