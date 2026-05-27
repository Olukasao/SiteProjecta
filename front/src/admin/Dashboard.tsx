import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Activity,
    BadgeDollarSign,
    Building2,
    ClipboardList,
    History,
    Home,
    Inbox,
    PlusCircle,
    UserPlus,
    UsersRound,
} from "lucide-react";
import { api } from "../services/api";
import { isAdminLike } from "./utils/permissions";
import "./styles/dashboard.css";

type Property = {
    id: number;
    titulo?: string;
    cidade?: string;
    bairro?: string;
    status?: string;
    preco?: number | string;
    imagens?: string[];
    created_at?: string;
};

function formatCurrency(value: Property["preco"]) {
    return Number(value || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
    });
}

function isActiveProperty(property: Property) {
    const status = String(property.status || "").toLowerCase();
    return ["ativo", "active", "disponivel", "disponível"].includes(status);
}

export default function Dashboard() {
    const navigate = useNavigate();
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);

    const currentUser = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem("user") || "null");
        } catch {
            return null;
        }
    }, []);

    const canAccessAdminActions = isAdminLike(currentUser);

    useEffect(() => {
        async function loadProperties() {
            try {
                const { data } = await api.get<Property[]>("/imoveis");
                setProperties(Array.isArray(data) ? data : []);
            } catch {
                setProperties([]);
            } finally {
                setLoading(false);
            }
        }

        loadProperties();
    }, []);

    const latestProperties = useMemo(() => {
        return [...properties]
            .sort((a, b) => {
                const dateA = new Date(a.created_at || 0).getTime();
                const dateB = new Date(b.created_at || 0).getTime();
                return dateB - dateA;
            })
            .slice(0, 4);
    }, [properties]);

    const cards = [
        {
            title: "Total de imóveis",
            value: properties.length,
            helper: "Cadastrados no sistema",
            icon: Building2,
        },
        {
            title: "Clientes",
            value: 0,
            helper: "Base de contatos",
            icon: UsersRound,
        },
        {
            title: "Vendas",
            value: 0,
            helper: "Negócios registrados",
            icon: BadgeDollarSign,
        },
        {
            title: "Imóveis ativos",
            value: properties.filter(isActiveProperty).length,
            helper: "Visíveis para atendimento",
            icon: Activity,
        },
    ];

    const quickActions = [
        {
            label: "Cadastrar imóvel",
            icon: PlusCircle,
            path: "/admin/imoveis/cadastrar",
            show: true,
        },
        {
            label: "Novo usuário",
            icon: UserPlus,
            path: "/admin/usuarios/cadastrar",
            show: canAccessAdminActions,
        },
        {
            label: "Ver imóveis",
            icon: ClipboardList,
            path: "/admin/imoveis",
            show: true,
        },
        {
            label: "Auditoria",
            icon: History,
            path: "/admin/auditoria",
            show: canAccessAdminActions,
        },
    ].filter((action) => action.show);

    return (
        <div className="dashboard-page">
            <div className="dashboard-heading">
                <div>
                    <span className="dashboard-kicker">
                        <Home size={16} />
                        Painel imobiliário
                    </span>
                    <h1>Dashboard</h1>
                    <p>Resumo geral do sistema</p>
                </div>
            </div>

            <section className="summary-grid">
                {cards.map((card) => {
                    const Icon = card.icon;

                    return (
                        <article className="summary-card" key={card.title}>
                            <div className="summary-card-top">
                                <span className="summary-icon">
                                    <Icon size={20} />
                                </span>
                            </div>
                            <h3>{card.title}</h3>
                            <strong>{loading ? "0" : card.value}</strong>
                            <p>{card.helper}</p>
                        </article>
                    );
                })}
            </section>

            <section className="quick-actions">
                <div className="section-title">
                    <h2>Ações rápidas</h2>
                    <span>Atalhos para as tarefas mais usadas</span>
                </div>

                <div className="quick-actions-grid">
                    {quickActions.map((action) => {
                        const Icon = action.icon;

                        return (
                            <button
                                className="quick-action-card"
                                key={action.label}
                                type="button"
                                onClick={() => navigate(action.path)}
                            >
                                <Icon size={19} />
                                <span>{action.label}</span>
                            </button>
                        );
                    })}
                </div>
            </section>

            <section className="latest-section">
                <div className="section-title">
                    <h2>Últimos imóveis cadastrados</h2>
                    <span>{latestProperties.length} registros recentes</span>
                </div>

                {loading || latestProperties.length === 0 ? (
                    <div className="premium-empty-state">
                        <span className="empty-icon">
                            <Inbox size={30} />
                        </span>
                        <h3>Nenhum imóvel cadastrado ainda</h3>
                        <p>Cadastre o primeiro imóvel para ele aparecer no painel e no site.</p>
                        <button type="button" onClick={() => navigate("/admin/imoveis/cadastrar")}>
                            <PlusCircle size={17} />
                            Cadastrar imóvel
                        </button>
                    </div>
                ) : (
                    <div className="latest-list">
                        {latestProperties.map((property) => (
                            <button
                                className="latest-property"
                                key={property.id}
                                type="button"
                                onClick={() => navigate(`/admin/imoveis/editar/${property.id}`)}
                            >
                                <div className="latest-thumb">
                                    {property.imagens?.[0] ? (
                                        <img src={property.imagens[0]} alt={property.titulo || "Imóvel"} />
                                    ) : (
                                        <Building2 size={22} />
                                    )}
                                </div>

                                <div>
                                    <strong>{property.titulo || "Imóvel sem título"}</strong>
                                    <span>{property.bairro || "-"}, {property.cidade || "-"}</span>
                                </div>

                                <small>{formatCurrency(property.preco)}</small>
                            </button>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
