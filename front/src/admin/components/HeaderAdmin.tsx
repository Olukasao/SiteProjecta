
import { useNavigate } from "react-router-dom";

export default function HeaderAdmin() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();


  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/admin/login"); // redireciona para login
  };

  return (
    <div className="admin-header">
      <div className="header-left">
        <h3>Painel Administrativo</h3>
      </div>

      <div className="header-right">
        <span className="admin-user">{user?.nome}</span>
        <button className="logout-btn" onClick={handleLogout}>Sair</button>
      </div>
    </div>
  );
}