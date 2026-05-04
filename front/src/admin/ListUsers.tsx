import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { api } from "../services/api";
import "./styles/listUsers.css";
import { Link, useNavigate } from "react-router-dom";

type User = {
    id: number;
    nome: string;
    username?: string;
    email: string;
    telefone: string;
    role: "admin" | "editor";
    status: "active" | "inactive" | "banned";
    phone?: string;
    created_at: string;
};

export default function ListUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const navigate = useNavigate();

    const currentUser = JSON.parse(localStorage.getItem("user") || "null");
    const canDelete = currentUser?.role === "admin";


    function formatDate(date: string) {
        return new Date(date).toLocaleDateString("pt-BR");
    }


    async function getUsers() {
        try {
            setLoading(true);
            const { data } = await api.get<User[]>("/usuarios");
            setUsers(data);
        } catch (error) {
            console.error("Erro ao buscar usuários:", error);
        } finally {
            setLoading(false);
        }
    }

    // 🗑 deletar
    async function deleteUser(id: number) {
        try {
            setDeletingId(id);
            await api.delete(`/usuarios/${id}`);
            setUsers((prev) => prev.filter((u) => u.id !== id));
        } catch (error) {
            console.error("Erro ao deletar usuário:", error);
        } finally {
            setDeletingId(null);
        }
    }

    function handleDelete(id: number) {
        if (!window.confirm("Tem certeza que deseja deletar este usuário?")) return;
        deleteUser(id);
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

                <button className="btn-primary" onClick={() => navigate("/admin/usuarios/cadastrar")}>
                    + Cadastrar
                </button>
            </div>

            <div className="d">
                <input
                    type="text"
                    placeholder="Buscar usuários..."
                    value={search}
                    onChange={handleSearch}
                />
            </div>

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
                                filteredUsers.map((user) => (
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
                                            <Link to={`/admin/usuarios/editar/${user.id}`} style={{textDecoration:"none"}}>
                                                <button className="btn-edit">Editar</button>
                                            </Link>

                                            {canDelete && (
                                                <button
                                                    className="btn-delete"
                                                    disabled={deletingId === user.id}
                                                    onClick={() => handleDelete(user.id)}
                                                >
                                                    {deletingId === user.id ? "..." : "Excluir"}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
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