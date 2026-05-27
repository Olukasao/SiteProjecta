import { useEffect, useMemo, useState } from "react";
import { History, Pencil, Plus, RefreshCw, RotateCcw, ShieldCheck, Trash2 } from "lucide-react";
import { api } from "../services/api";
import { isAdminLike } from "./utils/permissions";
import "./styles/AuditLogs.css";

type AuditAction = "" | "create" | "update" | "delete" | "restore";

type AuditChange = {
    campo: string;
    antes: unknown;
    depois: unknown;
};

type AuditLog = {
    id: number;
    actor_nome?: string | null;
    actor_email?: string | null;
    actor_role?: string | null;
    action: "create" | "update" | "delete" | "restore";
    resource_type: string;
    resource_id?: number | null;
    resource_title?: string | null;
    ip_address?: string | null;
    user_agent?: string | null;
    created_at: string;
    details?: {
        changes?: AuditChange[];
        before?: Record<string, unknown> | null;
        after?: Record<string, unknown> | null;
    };
};

const actionMeta = {
    create: {
        label: "Cadastro",
        className: "create",
        icon: Plus,
    },
    update: {
        label: "Edicao",
        className: "update",
        icon: Pencil,
    },
    delete: {
        label: "Exclusao",
        className: "delete",
        icon: Trash2,
    },
    restore: {
        label: "Restauracao",
        className: "restore",
        icon: RotateCcw,
    },
};

function formatDate(value: string) {
    return new Date(value).toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
    });
}

function formatValue(value: unknown) {
    if (value === null || value === undefined || value === "") return "-";
    if (Array.isArray(value)) return value.length ? value.join(", ") : "-";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
}

function getResourceLabel(log: AuditLog) {
    return log.resource_type === "usuario" ? "Usuario" : "Imovel";
}

function getSummary(log: AuditLog) {
    const resource = getResourceLabel(log);

    if (log.action === "create") return `${resource} cadastrado`;
    if (log.action === "delete") return `${resource} removido`;
    if (log.action === "restore") return `${resource} restaurado`;

    const count = log.details?.changes?.length || 0;
    return count === 1 ? "1 campo alterado" : `${count} campos alterados`;
}

export default function AuditLogs() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [action, setAction] = useState<AuditAction>("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const currentUser = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem("user") || "null");
        } catch {
            return null;
        }
    }, []);

    async function loadLogs(selectedAction = action) {
        try {
            setLoading(true);
            setError("");

            const { data } = await api.get<AuditLog[]>("/auditoria", {
                params: {
                    action: selectedAction || undefined,
                    limit: 300,
                },
            });

            setLogs(data || []);
        } catch (err: any) {
            if (err.response?.status === 403) {
                setError("Acesso restrito a administradores.");
            } else {
                setError("Nao foi possivel carregar a auditoria.");
            }
        } finally {
            setLoading(false);
        }
    }

    function handleActionChange(value: AuditAction) {
        setAction(value);
        loadLogs(value);
    }

    useEffect(() => {
        loadLogs("");
    }, []);

    if (currentUser?.role && !isAdminLike(currentUser)) {
        return (
            <div className="audit-page">
                <div className="audit-empty">
                    <ShieldCheck size={28} />
                    <h2>Acesso restrito</h2>
                    <p>Somente usuarios com cargo de admin ou dev podem ver a auditoria.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="audit-page">
            <div className="audit-header">
                <div>
                    <span className="audit-kicker">
                        <History size={16} />
                        Controle de alteracoes
                    </span>
                    <h1>Auditoria do site</h1>
                </div>

                <button type="button" className="audit-refresh" onClick={() => loadLogs()}>
                    <RefreshCw size={16} />
                    Atualizar
                </button>
            </div>

            <div className="audit-toolbar">
                <select value={action} onChange={(e) => handleActionChange(e.target.value as AuditAction)}>
                    <option value="">Todas as acoes</option>
                    <option value="create">Cadastros</option>
                    <option value="update">Edicoes</option>
                    <option value="delete">Exclusoes</option>
                    <option value="restore">Restauracoes</option>
                </select>

                <span>{logs.length} registros</span>
            </div>

            {error && <div className="audit-error">{error}</div>}

            {loading ? (
                <div className="audit-empty">Carregando auditoria...</div>
            ) : logs.length === 0 ? (
                <div className="audit-empty">Nenhum registro encontrado.</div>
            ) : (
                <div className="audit-list">
                    {logs.map((log) => {
                        const meta = actionMeta[log.action];
                        const Icon = meta.icon;
                        const changes = log.details?.changes || [];

                        return (
                            <article className="audit-card" key={log.id}>
                                <div className="audit-card-main">
                                    <div className={`audit-action ${meta.className}`}>
                                        <Icon size={16} />
                                    </div>

                                    <div className="audit-info">
                                        <div className="audit-title-row">
                                            <h3>{log.resource_title || `${getResourceLabel(log)} #${log.resource_id || "-"}`}</h3>
                                            <span className={`audit-badge ${meta.className}`}>{meta.label}</span>
                                        </div>

                                        <p>{getSummary(log)}</p>

                                        {changes.length > 0 && (
                                            <div className="audit-changes">
                                                {changes.slice(0, 6).map((change) => (
                                                    <div className="audit-change" key={change.campo}>
                                                        <strong>{change.campo}</strong>
                                                        <span>{formatValue(change.antes)}</span>
                                                        <span>{formatValue(change.depois)}</span>
                                                    </div>
                                                ))}
                                                {changes.length > 6 && (
                                                    <small>+ {changes.length - 6} outras alteracoes</small>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="audit-meta">
                                    <strong>{log.actor_nome || "Usuario desconhecido"}</strong>
                                    <span>{log.actor_email || "-"}</span>
                                    <span>{formatDate(log.created_at)}</span>
                                    <span>IP: {log.ip_address || "-"}</span>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
