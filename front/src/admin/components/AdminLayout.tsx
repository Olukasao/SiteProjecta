import { useEffect, useState } from "react";
import { Outlet, Navigate, useNavigate } from "react-router-dom";
import Sidebar from "./SidebarAdmin";
import HeaderAdmin from "./HeaderAdmin";
import "../styles/AdminLayout.css";
import { api } from "../../services/api";
import { isAdminLike } from "../utils/permissions";

type AdminUser = {
  id?: number;
  nome?: string;
  username?: string;
  email?: string;
  role?: string;
};

function readStoredUser(): AdminUser | null {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

export default function AdminLayout() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [user, setUser] = useState<AdminUser | null>(() => readStoredUser());

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    function updateUser(nextUser: AdminUser) {
      localStorage.setItem("user", JSON.stringify(nextUser));
      if (!cancelled) setUser(nextUser);
    }

    api.get("/me")
      .then(({ data }) => {
        updateUser(data);
      })
      .catch(async (err: { response?: { status?: number } }) => {
        const status = err.response?.status;

        if (status === 401 || status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/admin/login", { replace: true });
          return;
        }

        if (status === 404) {
          try {
            const storedUser = readStoredUser() || {};
            const { data } = await api.get<AdminUser[]>("/usuarios");
            const currentUser = Array.isArray(data)
              ? data.find((candidate) => (
                  (storedUser.id && candidate.id === storedUser.id) ||
                  (storedUser.email && candidate.email === storedUser.email) ||
                  (storedUser.username && candidate.username === storedUser.username)
                ))
              : null;

            if (isAdminLike(currentUser)) {
              updateUser({ ...storedUser, ...currentUser });
            }
          } catch {
            // Sem /me publicado e sem acesso aos usuarios: mantém o usuário local como está.
          }
        }
      });

    return () => {
      cancelled = true;
    };
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
