import { useState } from "react";
import { api } from "../services/api";
import "./styles/loginAdmin.css";

export default function LoginAdmin() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setErro("");
    if (!email || !senha) {
      return setErro("Preencha todos os campos");
    }

    try {
      setLoading(true);

      const res = await api.post("/login", { email, senha });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      window.location.href = "/admin/dashboard";
    } catch (err) {
      setErro("Email ou senha inválidos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* LADO ESQUERDO - 50% */}
      <div className="login-left">
        <div className="left-content">
          <h1>
            Bem-vindo ao <br />
            <span>Portal do Admin</span>
          </h1>
          <p>Gerencie seu sistema com total controle e segurança</p>
        </div>
      </div>

      {/* LADO DIREITO - 50% */}
      <div className="login-right">
        <div className="form-container">
          <div className="form-header">
        
            <h2>Login Admin</h2>
            <p>Acesse sua área administrativa</p>
          </div>

          {erro && <div className="error-message">{erro}</div>}

          <form className="login-form" onSubmit={(e) => e.preventDefault()}>
            <div className="input-group">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <input
                type="password"
                placeholder="Senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
            </div>

            <button 
              type="button"
              className="login-button"
              onClick={handleLogin} 
              disabled={loading}
            >
              {loading ? (
                <>
                  <span>Entrando...</span>
                </>
              ) : (
                "Entrar"
              )}
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