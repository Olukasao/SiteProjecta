import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api";
import { canChangeUser, isDev } from "./utils/permissions";
import "./styles/cadUser.css";

type UserRole = "dev" | "admin" | "editor";

type UserForm = {
    nome: string;
    email: string;
    username: string;
    role: UserRole;
    status: "active" | "inactive" | "banned";
};

type Errors = {
    nome?: string;
    email?: string;
    username?: string;
};

type UserDetails = UserForm & {
    role: UserRole;
};

export default function EditUser() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const currentUser = JSON.parse(localStorage.getItem("user") || "null");
    const currentUserIsDev = isDev(currentUser);

    const [form, setForm] = useState<UserForm>({
        nome: "",
        email: "",
        username: "",
        role: "editor",
        status: "active",
    });

    const [errors, setErrors] = useState<Errors>({});
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [protectedAdmin, setProtectedAdmin] = useState(false);

    // 🔍 buscar usuário
    async function getUser() {
        if (!id) return;

        try {
            setLoading(true);

            const { data } = await api.get<UserDetails>(`/usuario/${id}`);

            if (!canChangeUser(currentUser, data)) {
                setProtectedAdmin(true);
                return;
            }

            setProtectedAdmin(false);

            setForm({
                nome: data.nome || "",
                email: data.email || "",
                username: data.username || "",
                role: data.role || "editor",
                status: data.status || "active",
            });

        } catch {
            setError("Erro ao carregar usuário");
        } finally {
            setLoading(false);
        }
    }

    function handleChange(
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));

        setErrors((prev) => ({
            ...prev,
            [name]: "",
        }));
    }

    function validate() {
        const newErrors: Errors = {};

        if (!form.nome) newErrors.nome = "Nome é obrigatório";
        if (!form.email) newErrors.email = "Email é obrigatório";
        if (!form.username) newErrors.username = "Username é obrigatório";

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    }

    // 💾 atualizar
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        setError(null);
        setSuccess(null);

        if (!validate()) return;

        try {
            setSaving(true);

            await api.put(`/usuario/update/${id}`, form);

            setSuccess("Usuário atualizado com sucesso!");

            // opcional: redirecionar depois
            setTimeout(() => {
                navigate("/admin/usuarios");
            }, 1000);

        } catch (err: any) {
            setError(
                err?.response?.data?.message ||
                "Erro ao atualizar usuário"
            );
        } finally {
            setSaving(false);
        }
    }

    useEffect(() => {
        getUser();
    }, [id]);

    if (loading) return <p>Carregando...</p>;

    return (
        <div className="cad-container">
            <h2>Editar Usuário</h2>

            {error && <div className="cad-error">{error}</div>}
            {success && <div className="cad-success">{success}</div>}

            {protectedAdmin ? (
                <>
                    <div className="cad-error">Somente dev pode alterar contas de administradores ou devs.</div>
                    <button type="button" className="btn-secondary" onClick={() => navigate("/admin/usuarios")}>
                        Voltar
                    </button>
                </>
            ) : (
                <form onSubmit={handleSubmit} className="cad-form">

                    {/* LINHA 1 */}
                    <div className="cad-row">
                        <div className="cad-field">
                            <label>Nome</label>
                            <input
                                name="nome"
                                value={form.nome}
                                onChange={handleChange}
                            />
                            {errors.nome && <span>{errors.nome}</span>}
                        </div>

                        <div className="cad-field">
                            <label>Username</label>
                            <input
                                name="username"
                                value={form.username}
                                onChange={handleChange}
                            />
                            {errors.username && <span>{errors.username}</span>}
                        </div>
                    </div>

                    {/* EMAIL */}
                    <div className="cad-field">
                        <label>Email</label>
                        <input
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                        />
                        {errors.email && <span>{errors.email}</span>}
                    </div>

                    {/* LINHA 2 */}
                    <div className="cad-row">
                        <div className="cad-field">
                            <label>Role</label>
                            <select name="role" value={form.role} onChange={handleChange} disabled={!currentUserIsDev}>
                                {currentUserIsDev && <option value="dev">Dev</option>}
                                {currentUserIsDev && <option value="admin">Admin</option>}
                                <option value="editor">Editor</option>
                            </select>
                        </div>

                        <div className="cad-field">
                            <label>Status</label>
                            <select
                                name="status"
                                value={form.status}
                                onChange={handleChange}
                            >
                                <option value="active">Ativo</option>
                                <option value="inactive">Inativo</option>
                                <option value="banned">Bloqueado</option>
                            </select>
                        </div>
                    </div>

                    <button type="submit" disabled={saving}>
                        {saving ? "Salvando..." : "Salvar alterações"}
                    </button>
                </form>
            )}
        </div>
    );
}
