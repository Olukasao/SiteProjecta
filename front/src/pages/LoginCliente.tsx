import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { api } from "../services/api";
import "../styles/LoginCliente.css";

interface Cliente {
    id: number;
    nome: string;
    email: string;
}

export default function LoginCliente() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleLogin(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await api.post<Cliente>("/cliente/login", {
                email,
                senha,
            });

            localStorage.setItem("cliente", JSON.stringify(res.data));

            navigate("/cliente/painel");

        } catch (err) {
            console.error(err);
            alert("Email ou senha inválidos");
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
       
        document.title = "Área do cliente | Projecta Empreendimento";
    }, []);

    return (
        <div className="login-page">

            {/* BACK */}
            <button className="back-btn" onClick={() => navigate(-1)}>
                <ArrowLeft size={18} />
                Voltar
            </button>

            {/* CARD */}
            <div className="login-card">

                <div className="login-header">
                    <h1>Área do Cliente</h1>
                    <p>Entre para acessar seus imóveis e consultas</p>
                </div>

                <form onSubmit={handleLogin}>

                    <div className="input-group">
                        <label>E-mail</label>
                        <input
                            type="email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <label>Senha</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                        />
                    </div>

                    <button className="login-btn" disabled={loading}>
                        {loading ? "Entrando..." : "Entrar"}
                    </button>

                </form>

            </div>
        </div>
    );
}