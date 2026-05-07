import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "./SidebarAdmin";
import HeaderAdmin from "./HeaderAdmin";
import "../styles/AdminLayout.css";

export default function AdminLayout() {
  const token = localStorage.getItem("token");

  // 🔐 proteção de rota
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="admin-container">
      <Sidebar />

      <div className="admin-main">
        <HeaderAdmin />

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}