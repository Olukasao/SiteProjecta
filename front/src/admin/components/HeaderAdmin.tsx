import { useNavigate } from "react-router-dom";
import { KeyRound, LogOut } from "lucide-react";

function getInitials(name?: string) {
  if (!name) return "AD";

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function getRoleLabel(role?: string) {
  if (role === "editor") return "Editor";
  return "Administrador";
}

export default function HeaderAdmin() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/admin/login");
  };

  return (
    <header className="admin-header">
      <div className="header-left">
        <span>Painel Administrativo</span>
        <h3>Gestão imobiliária</h3>
      </div>

      <div className="header-right">
        <div className="admin-user-card">
          <span className="admin-avatar">{getInitials(user?.nome)}</span>
          <div>
            <strong>{user?.nome || "Admin"}</strong>
            <small>{getRoleLabel(user?.role)}</small>
          </div>
        </div>

        <button className="password-btn" type="button" onClick={() => navigate("/admin/minha-senha")}>
          <KeyRound size={15} />
          Minha senha
        </button>
        <button className="logout-btn" type="button" onClick={handleLogout}>
          <LogOut size={15} />
          Sair
        </button>
      </div>
    </header>
  );
}
