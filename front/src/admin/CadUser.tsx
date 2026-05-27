import { useState } from "react";
import { api } from "../services/api";
import { getPasswordError } from "./utils/password";
import { isDev } from "./utils/permissions";
import "./styles/cadUser.css";

type UserRole = "dev" | "admin" | "editor";

type UserCreate = {
    nome: string;
    email: string;
    telefone: string;
    username: string;
    senha: string;
    confirmSenha: string;
    role: UserRole;
};

type Errors = {
    nome?: string;
    email?: string;
    username?: string;
    telefone?: string;
    senha?: string;
    confirmSenha?: string;
};

export default function CadUser() {
    const currentUser = JSON.parse(localStorage.getItem("user") || "null");
    const currentUserIsDev = isDev(currentUser);
    const [form, setForm] = useState<UserCreate>({
        nome: "",
        email: "",
        telefone: "",
        username: "",
        senha: "",
        confirmSenha: "",
        role: "editor",
    });

    const [errors, setErrors] = useState<Errors>({});
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

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
        if (!form.telefone) newErrors.telefone = "Telefone é obrigatório";
        if (!form.senha) {
            newErrors.senha = "Senha é obrigatória";
        } else {
            const passwordError = getPasswordError(form.senha);
            if (passwordError) newErrors.senha = passwordError;
        }

        if (form.senha !== form.confirmSenha) {
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

        setLoading(true);

        try {
            // 🔥 não enviar confirmSenha pro backend
            const { confirmSenha, ...data } = form;

            await api.post("/usuarios/add", data);

            setSuccess("Usuário cadastrado com sucesso!");

            setForm({
                nome: "",
                email: "",
                telefone: "",
                username: "",
                senha: "",
                confirmSenha: "",
                role: "editor",
            });

        } catch (err: any) {
            setError(err?.response?.data?.message || "Erro ao cadastrar usuário");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="cad-container">
            <h2>Cadastrar Usuário</h2>

            {error && <div className="cad-error">{error}</div>}
            {success && <div className="cad-success">{success}</div>}

            <form onSubmit={handleSubmit} className="cad-form">

                {/* LINHA 1 */}
                <div className="cad-row">
                    <div className="cad-field">
                        <label>Nome</label>
                        <input name="nome" value={form.nome} onChange={handleChange} />
                        {errors.nome && <span>{errors.nome}</span>}
                    </div>

                    <div className="cad-field">
                        <label>Username</label>
                        <input name="username" value={form.username} onChange={handleChange} />
                        {errors.username && <span>{errors.username}</span>}
                    </div>
                </div>

                {/* LINHA 2 */}
                <div className="cad-row">
                    <div className="cad-field">
                        <label>Email</label>
                        <input name="email" value={form.email} onChange={handleChange} />
                        {errors.email && <span>{errors.email}</span>}
                    </div>

                    <div className="cad-field">
                        <label>Telefone</label>
                        <input name="telefone" value={form.telefone} onChange={handleChange} />
                        {errors.telefone && <span>{errors.telefone}</span>}
                    </div>
                </div>

                {currentUserIsDev && (
                    <div className="cad-field">
                        <label>Tipo de usuário</label>
                        <select name="role" value={form.role} onChange={handleChange}>
                            <option value="editor">Editor</option>
                            <option value="admin">Admin</option>
                            <option value="dev">Dev</option>
                        </select>
                    </div>
                )}

                {/* SENHAS */}
                <div className="cad-row">
                    <div className="cad-field">
                        <label>Senha</label>
                        <input
                            type="password"
                            name="senha"
                            value={form.senha}
                            onChange={handleChange}
                        />
                        {errors.senha && <span>{errors.senha}</span>}
                    </div>

                    <div className="cad-field">
                        <label>Confirmar Senha</label>
                        <input
                            type="password"
                            name="confirmSenha"
                            value={form.confirmSenha}
                            onChange={handleChange}
                        />
                        {errors.confirmSenha && <span>{errors.confirmSenha}</span>}
                    </div>
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? "Cadastrando..." : "Cadastrar"}
                </button>
            </form>
        </div>
    );
}
