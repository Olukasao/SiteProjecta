import { useEffect, useState, useMemo } from "react";
import "../styles/Imoveis.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";
import { Bed, Bath, Car, Ruler, MapPin } from "lucide-react";
import {
    Waves,
    Flame,
    Dumbbell,
    ShieldCheck,
    Building,
    Dog,
    Sofa,
    PartyPopper
} from "lucide-react";



export default function Imoveis() {
    const [imoveis, setImoveis] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [filtros, setFiltros] = useState({
        busca: "",
        tipo: "",
        status: "",
        precoMin: "",
        precoMax: "",
        quartos: "",
        banheiros: "",
        vagas: "",
        areaMin: "",
        areaMax: "",
        cep: "",
        diferenciais: [] as string[]
    });

    const navigate = useNavigate();

    // =========================
    // LOAD
    // =========================
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

    const handleChange = (e: any) => {
        setFiltros({ ...filtros, [e.target.name]: e.target.value });
    };

    // =========================
    // FILTRO COMPLETO
    // =========================
    const imoveisFiltrados = useMemo(() => {
        return imoveis.filter((i) => {

            const texto = filtros.busca.toLowerCase();

            const matchTexto =
                !texto ||
                i.titulo?.toLowerCase().includes(texto) ||
                i.cidade?.toLowerCase().includes(texto) ||
                i.bairro?.toLowerCase().includes(texto) ||
                i.endereco?.toLowerCase().includes(texto);

            const matchTipo =
                !filtros.tipo || i.tipo === filtros.tipo;

            const matchStatus =
                !filtros.status || i.status === filtros.status;

            const matchPrecoMin =
                !filtros.precoMin || i.preco >= Number(filtros.precoMin);

            const matchPrecoMax =
                !filtros.precoMax || i.preco <= Number(filtros.precoMax);

            const matchQuartos =
                !filtros.quartos || i.quartos >= Number(filtros.quartos);

            const matchBanheiros =
                !filtros.banheiros || i.banheiros >= Number(filtros.banheiros);

            const matchVagas =
                !filtros.vagas || i.vagas >= Number(filtros.vagas);

            const matchAreaMin =
                !filtros.areaMin || i.area >= Number(filtros.areaMin);

            const matchAreaMax =
                !filtros.areaMax || i.area <= Number(filtros.areaMax);

            const matchCep =
                !filtros.cep || i.cep?.includes(filtros.cep);

            const matchDiferenciais =
                filtros.diferenciais.length === 0 ||
                filtros.diferenciais.every((item) =>
                    (i.diferenciais || []).includes(item)
                );

            return (
                matchTexto &&
                matchTipo &&
                matchStatus &&
                matchPrecoMin &&
                matchPrecoMax &&
                matchQuartos &&
                matchBanheiros &&
                matchVagas &&
                matchAreaMin &&
                matchAreaMax &&
                matchCep &&
                matchDiferenciais
            );
        });
    }, [imoveis, filtros]);

    const formatarPreco = (valor: any) => {
        const numero = Number(valor);
        if (isNaN(numero)) return "0,00";

        return numero.toLocaleString("pt-BR", {
            minimumFractionDigits: 2
        });
    };

    return (
        <>
            <Header />

            <section className="page-hero">
                <h1>Encontre seu imóvel ideal</h1>
            </section>

            <section className="imoveis-layout">

                {/* =========================
                    FILTROS
                ========================= */}
                <aside className="filters-sidebar">

                    <h3>Filtrar</h3>

                    <input name="busca" placeholder="Cidade, bairro ou nome" onChange={handleChange} />

                    <select name="tipo" onChange={handleChange}>
                        <option value="">Tipo</option>
                        <option value="casa">Casa</option>
                        <option value="apartamento">Apartamento</option>
                        <option value="terreno">Terreno</option>
                        <option value="comercial">Comercial</option>
                    </select>

                    <select name="status" onChange={handleChange}>
                        <option value="">Negócio</option>
                        <option value="venda">Venda</option>
                        <option value="aluguel">Aluguel</option>
                    </select>

                    <input name="precoMin" type="number" placeholder="Preço mínimo" onChange={handleChange} />
                    <input name="precoMax" type="number" placeholder="Preço máximo" onChange={handleChange} />

                    <select name="quartos" onChange={handleChange}>
                        <option value="">Quartos</option>
                        <option value="1">1+</option>
                        <option value="2">2+</option>
                        <option value="3">3+</option>
                    </select>

                    <select name="banheiros" onChange={handleChange}>
                        <option value="">Banheiros</option>
                        <option value="1">1+</option>
                        <option value="2">2+</option>
                    </select>

                    <select name="vagas" onChange={handleChange}>
                        <option value="">Vagas</option>
                        <option value="1">1+</option>
                        <option value="2">2+</option>
                    </select>

                    <input name="areaMin" type="number" placeholder="Área mínima" onChange={handleChange} />
                    <input name="areaMax" type="number" placeholder="Área máxima" onChange={handleChange} />

                    <input name="cep" placeholder="CEP" onChange={handleChange} />

                    {/* DIFERENCIAIS */}
                    <div className="filtro-grupo">
                        <label className="filtro-titulo">Diferenciais</label>

                        <div className="filtro-diferenciais">

                            {[
                                { nome: "Piscina", icon: <Waves size={16} /> },
                                { nome: "Churrasqueira", icon: <Flame size={16} /> },
                                { nome: "Academia", icon: <Dumbbell size={16} /> },
                                { nome: "Portaria 24h", icon: <ShieldCheck size={16} /> },
                                { nome: "Elevador", icon: <Building size={16} /> },
                                { nome: "Pet friendly", icon: <Dog size={16} /> },
                                { nome: "Mobiliado", icon: <Sofa size={16} /> },
                                { nome: "Salão de festas", icon: <PartyPopper size={16} /> }
                            ].map((item) => (
                                <label key={item.nome} className="check-card">

                                    <input
                                        type="checkbox"
                                        onChange={() => {
                                            setFiltros((prev) => {
                                                const lista = prev.diferenciais.includes(item.nome)
                                                    ? prev.diferenciais.filter(i => i !== item.nome)
                                                    : [...prev.diferenciais, item.nome];

                                                return { ...prev, diferenciais: lista };
                                            });
                                        }}
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

                {/* =========================
                    RESULTADOS
                ========================= */}
                <div className="imoveis-content">

                    <div className="results-info">
                        {loading
                            ? "Carregando..."
                            : `${imoveisFiltrados.length} imóveis encontrados`}
                    </div>

                    <div className="properties-grid">
                        {imoveisFiltrados.map((imovel) => (
                            <div
                                key={imovel.id}
                                className="property-card"
                                onClick={() => navigate(`/imovel/${imovel.id}`)}
                            >
                                <div className="card-image">
                                    <img src={imovel.imagens?.[0]} />
                                </div>

                                <div className="property-info">

                                    <h3>{imovel.titulo}</h3>

                                    <p className="price">
                                        R$ {formatarPreco(imovel.preco)}
                                    </p>

                                    <p className="location">
                                        <MapPin size={14} />
                                        {imovel.bairro}, {imovel.cidade}
                                    </p>

                                    <div className="features">
                                        <span><Bed size={14} /> {imovel.quartos}</span>
                                        <span><Bath size={14} /> {imovel.banheiros}</span>
                                        <span><Car size={14} /> {imovel.vagas}</span>
                                        <span><Ruler size={14} /> {imovel.area} m²</span>
                                    </div>

                                    <p className="desc">
                                        {imovel.descricao?.slice(0, 80)}...
                                    </p>

                                </div>
                            </div>
                        ))}
                    </div>

                </div>

            </section>

            <Footer />
        </>
    );
}