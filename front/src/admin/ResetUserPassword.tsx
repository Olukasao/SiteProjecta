import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api";
import { getPasswordError } from "./utils/password";
import { canChangeUser, isAdminLike } from "./utils/permissions";
import "./styles/cadUser.css";

type UserRole = "dev" | "admin" | "editor";

type UserDetails = {
    nome: string;
    email: string;
    username?: string;
    role: UserRole;
};

type Errors = {
    senha?: string;
    confirmSenha?: string;
};

export default function ResetUserPassword() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const currentUser = JSON.parse(localStorage.getItem("user") || "null");

    const [user, setUser] = useState<UserDetails | null>(null);
    const [senha, setSenha] = useState("");
    const [confirmSenha, setConfirmSenha] = useState("");
    const [errors, setErrors] = useState<Errors>({});
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    async function getUser() {
        if (!id) return;

        try {
            setLoading(true);
            const { data } = await api.get<UserDetails>(`/usuario/${id}`);
            setUser(data);
        } catch {
            setError("Erro ao carregar usuário");
        } finally {
            setLoading(false);
        }
    }

    function validate() {
        const newErrors: Errors = {};

        if (!senha) {
            newErrors.senha = "Senha é obrigatória";
        } else {
            const passwordError = getPasswordError(senha);
            if (passwordError) newErrors.senha = passwordError;
        }

        if (!confirmSenha) {
            newErrors.confirmSenha = "Confirmação de senha é obrigatória";
        } else if (senha !== confirmSenha) {
            newErrors.confirmSenha = "Senhas não conferem";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        setError(null);
        setSuccess(null);

        if (!validate()) return;

        try {
            setSaving(true);
            await api.put(`/usuario/reset-password/${id}`, { senha });
            setSenha("");
            setConfirmSenha("");
            setSuccess("Senha redefinida com sucesso!");

            setTimeout(() => {
                navigate("/admin/usuarios");
            }, 1000);
        } catch (err: any) {
            setError(err?.response?.data?.message || "Erro ao redefinir senha");
        } finally {
            setSaving(false);
        }
    }

    useEffect(() => {
        getUser();
    }, [id]);

    if (!isAdminLike(currentUser)) {
        return (
            <div className="cad-container">
                <div className="cad-error">Acesso restrito a administradores.</div>
                <button type="button" className="btn-secondary" onClick={() => navigate("/admin/dashboard")}>
                    Voltar
                </button>
            </div>
        );
    }

    if (loading) return <p>Carregando...</p>;

    if (user && !canChangeUser(currentUser, user)) {
        return (
            <div className="cad-container">
                <div className="cad-error">Somente dev pode alterar contas de administradores ou devs.</div>
                <button type="button" className="btn-secondary" onClick={() => navigate("/admin/usuarios")}>
                    Voltar
                </button>
            </div>
        );
    }

    return (
        <div className="cad-container">
            <h2>Redefinir Senha</h2>

            {user && (
                <div className="cad-summary">
                    <strong>{user.nome}</strong>
                    <span>{user.username || user.email}</span>
                </div>
            )}

            {error && <div className="cad-error">{error}</div>}
            {success && <div className="cad-success">{success}</div>}

            <form onSubmit={handleSubmit} className="cad-form">
                <div className="cad-row">
                    <div className="cad-field">
                        <label>Nova senha</label>
                        <input
                            type="password"
                            value={senha}
                            onChange={(e) => {
                                setSenha(e.target.value);
                                setErrors((prev) => ({ ...prev, senha: "" }));
                            }}
                        />
                        {errors.senha && <span>{errors.senha}</span>}
                    </div>

                    <div className="cad-field">
                        <label>Confirmar nova senha</label>
                        <input
                            type="password"
                            value={confirmSenha}
                            onChange={(e) => {
                                setConfirmSenha(e.target.value);
                                setErrors((prev) => ({ ...prev, confirmSenha: "" }));
                            }}
                        />
                        {errors.confirmSenha && <span>{errors.confirmSenha}</span>}
                    </div>
                </div>

                <div className="cad-actions">
                    <button type="button" className="btn-secondary" onClick={() => navigate("/admin/usuarios")}>
                        Voltar
                    </button>

                    <button type="submit" disabled={saving}>
                        {saving ? "Salvando..." : "Redefinir senha"}
                    </button>
                </div>
            </form>
        </div>
    );
}
