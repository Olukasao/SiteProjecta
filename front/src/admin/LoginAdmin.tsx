import { useEffect, useState } from "react";
import { api } from "../services/api";
import "./styles/loginAdmin.css";
import { useNavigate } from "react-router-dom";

export default function LoginAdmin() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const sessionMessage = localStorage.getItem("sessionMessage");
    if (!sessionMessage) return;

    setErro(sessionMessage);
    localStorage.removeItem("sessionMessage");
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErro("");

    if (!email || !senha) {
      setErro("Preencha todos os campos");
      return;
    }

    try {
      setLoading(true);

      const { data } = await api.post("/login", {
        email: email.trim().toLowerCase(),
        senha,
      });

      // salvar token e user
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // 👉 já seta o token no axios automaticamente
      api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;

      // 👉 navegação sem reload
      navigate("/admin/dashboard");

    } catch (err: any) {
      console.error(err);

      if (err.response?.status === 401) {
        setErro("Email ou senha inválidos");
      } else {
        setErro("Erro ao conectar com o servidor");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">

      {/* LEFT */}
      <div className="login-left">
        <div className="left-content">
          <h1>
            Bem-vindo ao <br />
            <span>Portal do Admin</span>
          </h1>
          <p>Gerencie seu sistema com total controle e segurança</p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="login-right">
        <div className="form-container">

          <div className="form-header">
            <h2>Login Admin</h2>
            <p>Acesse sua área administrativa</p>
          </div>

          {erro && <div className="error-message">{erro}</div>}

          {/* FORM CORRETO */}
          <form className="login-form" onSubmit={handleLogin}>
            
            <div className="input-group">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="input-group">
              <input
                type="password"
                placeholder="Senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>

          </form>

          <div className="form-footer">
            <span>© Projecta Empreendimentos</span>
          </div>

        </div>
      </div>
    </div>
  );
}
