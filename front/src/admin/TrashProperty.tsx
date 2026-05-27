import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Bath, Bed, Car, MapPin, RotateCcw, Ruler } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import "./styles/ListProperty.css";

type DeletedProperty = {
  id: number;
  titulo: string;
  preco?: number | string;
  bairro?: string;
  cidade?: string;
  quartos?: number;
  banheiros?: number;
  vagas?: number;
  area?: number | string;
  imagens?: string[];
  deleted_at?: string;
};

export default function TrashProperty() {
  const [busca, setBusca] = useState("");
  const [imoveis, setImoveis] = useState<DeletedProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoringId, setRestoringId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function carregarLixeira() {
    try {
      setLoading(true);
      setError("");
      const { data } = await api.get<DeletedProperty[]>("/imoveis/lixeira");
      setImoveis(data || []);
    } catch {
      setError("Nao foi possivel carregar a lixeira.");
    } finally {
      setLoading(false);
    }
  }

  async function restaurarImovel(id: number) {
    try {
      setRestoringId(id);
      await api.put(`/imoveis/${id}/restaurar`);
      setImoveis((prev) => prev.filter((imovel) => imovel.id !== id));
    } catch {
      alert("Nao foi possivel restaurar o imovel.");
    } finally {
      setRestoringId(null);
    }
  }

  useEffect(() => {
    carregarLixeira();
  }, []);

  const imoveisFiltrados = useMemo(() => {
    const term = busca.toLowerCase();

    return imoveis.filter((imovel) =>
      (imovel.titulo || "").toLowerCase().includes(term) ||
      (imovel.cidade || "").toLowerCase().includes(term) ||
      (imovel.bairro || "").toLowerCase().includes(term)
    );
  }, [busca, imoveis]);

  const formatarPreco = (valor: DeletedProperty["preco"]) =>
    Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  return (
    <div className="container-list">
      <div className="list-header">
        <div>
          <h1>Lixeira de imóveis</h1>
          <p>Imóveis removidos ficam aqui sem prazo de expiração, até uma ação manual.</p>
        </div>

        <button className="toolbar-button" type="button" onClick={() => navigate("/admin/imoveis")}>
          <ArrowLeft size={16} />
          Voltar
        </button>
      </div>

      <div className="filtros">
        <input
          placeholder="Buscar imóvel na lixeira..."
          value={busca}
          onChange={(event) => setBusca(event.target.value)}
        />
      </div>

      {error && <div className="list-error">{error}</div>}

      {loading ? (
        <p>Carregando...</p>
      ) : imoveisFiltrados.length === 0 ? (
        <div className="trash-empty">Nenhum imóvel na lixeira.</div>
      ) : (
        <div className="properties-grid">
          {imoveisFiltrados.map((imovel) => (
            <div key={imovel.id} className="property-card">
              <div className="card-image">
                {imovel.imagens?.[0] ? (
                  <img src={imovel.imagens[0]} alt={imovel.titulo} />
                ) : (
                  <div className="image-placeholder">Sem imagem</div>
                )}
              </div>

              <div className="property-info">
                <h3>{imovel.titulo}</h3>

                <p className="price">{formatarPreco(imovel.preco)}</p>

                <p className="location">
                  <MapPin size={14} />
                  {imovel.bairro || "-"}, {imovel.cidade || "-"}
                </p>

                <div className="features">
                  <span><Bed size={14} /> {imovel.quartos || 0}</span>
                  <span><Bath size={14} /> {imovel.banheiros || 0}</span>
                  <span><Car size={14} /> {imovel.vagas || 0}</span>
                  <span><Ruler size={14} /> {imovel.area || 0} m²</span>
                </div>

                <div className="actions">
                  <button
                    className="restore"
                    disabled={restoringId === imovel.id}
                    onClick={() => restaurarImovel(imovel.id)}
                  >
                    <RotateCcw size={14} />
                    {restoringId === imovel.id ? "Restaurando..." : "Retornar ao site"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
