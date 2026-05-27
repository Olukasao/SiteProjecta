import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import "./styles/ListProperty.css";
import { canDeleteProperties as canDeletePropertiesPermission } from "./utils/permissions";

import { Bed, Bath, Car, Ruler, MapPin, Pencil, Trash2 } from "lucide-react";

export default function ListProperty() {
  const [busca, setBusca] = useState("");
  const [tipo, setTipo] = useState("");
  const [imoveis, setImoveis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  const canDeleteProperties = canDeletePropertiesPermission(currentUser);

  async function carregarImoveis() {
    try {
      const res = await api.get("/imoveis");
      setImoveis(res.data || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarImoveis();
  }, []);

  async function handleDelete(id: number) {
    const ok = window.confirm("Deseja excluir este imóvel?");
    if (!ok) return;

    await api.delete(`/imoveis/${id}`);
    setImoveis((prev) => prev.filter((i) => i.id !== id));
  }

  const imoveisFiltrados = useMemo(() => {
    const t = busca.toLowerCase();

    return imoveis.filter((i) => {
      const matchTexto =
        (i.titulo || "").toLowerCase().includes(t) ||
        (i.cidade || "").toLowerCase().includes(t) ||
        (i.bairro || "").toLowerCase().includes(t);

      const matchTipo = !tipo || i.tipo === tipo;

      return matchTexto && matchTipo;
    });
  }, [imoveis, busca, tipo]);

  const formatarPreco = (v: any) =>
    Number(v || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  return (
    <div className="container-list">
      <div className="list-header">
        <div>
          <h1>Imóveis</h1>
        </div>

        {canDeleteProperties && (
          <button className="toolbar-button" type="button" onClick={() => navigate("/admin/imoveis/lixeira")}>
            <Trash2 size={16} />
            Lixeira
          </button>
        )}
      </div>

      {/* FILTROS */}
      <div className="filtros">
        <input
          placeholder="Buscar imóvel..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />

        <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option value="">Todos</option>
          <option value="venda">Venda</option>
          <option value="aluguel">Aluguel</option>
        </select>
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <div className="properties-grid">

          {imoveisFiltrados.map((imovel) => (
            <div
              key={imovel.id}
              className="property-card"

            >

              {/* IMAGEM */}
              <div className="card-image">
                <img src={imovel.imagens?.[0]} alt={imovel.titulo} />
              </div>

              {/* INFO */}
              <div className="property-info">

                <h3>{imovel.titulo}</h3>

                <p className="price">
                  {formatarPreco(imovel.preco)}
                </p>

                <p className="location">
                  <MapPin size={14} />
                  {imovel.bairro}, {imovel.cidade}
                </p>

                {/* FEATURES */}
                <div className="features">
                  <span><Bed size={14} /> {imovel.quartos}</span>
                  <span><Bath size={14} /> {imovel.banheiros}</span>
                  <span><Car size={14} /> {imovel.vagas}</span>
                  <span><Ruler size={14} /> {imovel.area} m²</span>
                </div>

                {/* AÇÕES */}
                <div className="actions">

                  <button
                    className="edit"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/admin/imoveis/editar/${imovel.id}`);
                    }}
                  >
                    <Pencil size={14} /> Editar
                  </button>

                  {canDeleteProperties && (
                    <button
                      className="delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(imovel.id);
                      }}
                    >
                      <Trash2 size={14} /> Excluir
                    </button>
                  )}

                </div>

              </div>

            </div>
          ))}

        </div>
      )}
    </div>
  );
}
