import { useEffect, useState } from "react";
import { Outlet, Navigate, useNavigate } from "react-router-dom";
import Sidebar from "./SidebarAdmin";
import HeaderAdmin from "./HeaderAdmin";
import "../styles/AdminLayout.css";
import { api } from "../../services/api";

export default function AdminLayout() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (!token) return;

    api.get("/me")
      .then(({ data }) => {
        localStorage.setItem("user", JSON.stringify(data));
        setUser(data);
      })
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/admin/login", { replace: true });
      });
  }, [navigate, token]);

  // 🔐 proteção de rota
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="admin-container">
      <Sidebar user={user} />

      <div className="admin-main">
        <HeaderAdmin />

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
