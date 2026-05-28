import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { api } from "../services/api";
import "./styles/listUsers.css";
import { Link, useNavigate } from "react-router-dom";
import { KeyRound } from "lucide-react";
import {
    canChangeUser as canChangeUserPermission,
    canDeleteUser as canDeleteUserPermission,
    canManageUsers as canManageUsersPermission,
    canResetUserPassword as canResetUserPasswordPermission,
} from "./utils/permissions";

type ApiError = {
    response?: {
        status?: number;
        data?: {
            message?: string;
            error?: string;
        };
    };
};

type UserRole = "dev" | "admin" | "editor";

type User = {
    id: number;
    nome: string;
    username?: string;
    email: string;
    telefone: string;
    role: UserRole;
    status: "active" | "inactive" | "banned";
    phone?: string;
    created_at: string;
    deleted_at?: string | null;
};

export default function ListUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [deleteNotice, setDeleteNotice] = useState("");

    const navigate = useNavigate();

    const currentUser = JSON.parse(localStorage.getItem("user") || "null");
    const canManageUsers = canManageUsersPermission(currentUser);

    function formatDate(date: string) {
        return new Date(date).toLocaleDateString("pt-BR");
    }


    async function getUsers() {
        try {
            setLoading(true);
            const { data } = await api.get<User[]>("/usuarios");
            setUsers((data || []).filter((user) => !isDeletedUser(user)));
        } catch (error) {
            console.error("Erro ao buscar usuários:", error);
        } finally {
            setLoading(false);
        }
    }

    function isDeletedUser(user: User) {
        return Boolean(
            user.deleted_at ||
            user.email?.startsWith("deleted_") ||
            user.username?.startsWith("deleted_")
        );
    }

    async function softDeleteWithLegacyApi(user: User) {
        const deletedStamp = `${user.id}_${Date.now()}`;

        await api.put(`/usuario/update/${user.id}`, {
            nome: user.nome,
            email: `deleted_${deletedStamp}@deleted.local`,
            username: `deleted_${deletedStamp}`,
            role: user.role,
            status: "inactive",
            phone: user.phone || user.telefone || null,
        });
    }

    // 🗑 deletar
    async function deleteUser(user: User) {
        try {
            setDeletingId(user.id);
            await api.delete(`/usuarios/${user.id}`);
            setUsers((prev) => prev.filter((u) => u.id !== user.id));
        } catch (error) {
            console.error("Erro ao deletar usuário:", error);
            const apiError = error as ApiError;

            if (apiError.response?.status === 404) {
                try {
                    await softDeleteWithLegacyApi(user);
                    setUsers((prev) => prev.filter((u) => u.id !== user.id));
                    return;
                } catch (fallbackError) {
                    console.error("Erro ao deletar usuário pela rota legada:", fallbackError);
                    const fallbackApiError = fallbackError as ApiError;
                    alert(
                        fallbackApiError.response?.data?.message ||
                        fallbackApiError.response?.data?.error ||
                        "Não foi possível excluir usuário pela API publicada."
                    );
                    return;
                }
            }

            const message =
                apiError.response?.data?.message ||
                apiError.response?.data?.error ||
                "Erro ao deletar usuário";

            alert(message);
        } finally {
            setDeletingId(null);
        }
    }

    function handleDelete(user: User) {
        if (!canDeleteUserPermission(currentUser, user)) {
            setDeleteNotice("Somente um dev pode excluir usuários. Entre em contato com um dev para realizar essa exclusão.");
            return;
        }

        setDeleteNotice("");
        if (!window.confirm("Tem certeza que deseja deletar este usuário?")) return;
        deleteUser(user);
    }

    function handleSearch(e: ChangeEvent<HTMLInputElement>) {
        setSearch(e.target.value);
    }

    useEffect(() => {
        getUsers();
    }, []);

    // 🔍 filtro inteligente
    const filteredUsers = useMemo(() => {
        const term = search.toLowerCase();

        return users.filter((u) =>
            u.nome.toLowerCase().includes(term) ||
            u.email.toLowerCase().includes(term) ||
            (u.username || "").toLowerCase().includes(term)
        );
    }, [users, search]);

    return (
        <div className="container">

            <div className="title-list">
                <h2>Usuários</h2>

                {canManageUsers && (
                    <button className="btn-primary" onClick={() => navigate("/admin/usuarios/cadastrar")}>
                        + Cadastrar
                    </button>
                )}
            </div>

            <div className="d">
                <input
                    type="text"
                    placeholder="Buscar usuários..."
                    value={search}
                    onChange={handleSearch}
                />
            </div>

            {deleteNotice && <div className="list-notice">{deleteNotice}</div>}

            {loading ? (
                <p className="loading">Carregando...</p>
            ) : (
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Email</th>
                                <th>Telefone</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Criado</th>
                                <th className="center">Ações</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredUsers.length > 0 ? (
                                filteredUsers.map((user) => {
                                    const canChange = canChangeUserPermission(currentUser, user);
                                    const canResetPassword = canResetUserPasswordPermission(currentUser, user);
                                    const canDelete = canDeleteUserPermission(currentUser, user);
                                    const canRequestDelete = canManageUsers && Number(currentUser?.id) !== Number(user.id);
                                    const hasActions = canChange || canResetPassword || canRequestDelete;

                                    return (
                                        <tr key={user.id}>
                                            <td>
                                                <strong>{user.nome}</strong>
                                                <br />
                                                <span className="sub">
                                                    {user.username || "-"}
                                                </span>
                                            </td>

                                            <td>{user.email}</td>

                                            <td>{user.phone || "-"}</td>
                                            <td>
                                                <span className={`role ${user.role}`}>
                                                    {user.role}
                                                </span>
                                            </td>

                                            <td>
                                                <span className={`status ${user.status}`}>
                                                    {user.status}
                                                </span>
                                            </td>

                                            <td>{formatDate(user.created_at)}</td>

                                            <td className="actions">
                                                {hasActions ? (
                                                    <>
                                                        {canChange && (
                                                            <Link to={`/admin/usuarios/editar/${user.id}`} style={{ textDecoration: "none" }}>
                                                                <button className="btn-edit">Editar</button>
                                                            </Link>
                                                        )}

                                                        {canResetPassword && (
                                                            <Link to={`/admin/usuarios/redefinir-senha/${user.id}`} style={{ textDecoration: "none" }}>
                                                                <button className="btn-password" type="button">
                                                                    <KeyRound size={14} />
                                                                    Alterar senha
                                                                </button>
                                                            </Link>
                                                        )}

                                                        {canRequestDelete && (
                                                            <button
                                                                className="btn-delete"
                                                                disabled={canDelete && deletingId === user.id}
                                                                onClick={() => handleDelete(user)}
                                                            >
                                                                {canDelete && deletingId === user.id ? "..." : "Excluir"}
                                                            </button>
                                                        )}
                                                    </>
                                                ) : (
                                                    <span className="sub">Protegido</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={7} className="empty">
                                        Nenhum usuário encontrado
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
