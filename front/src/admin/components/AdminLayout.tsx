import { Outlet } from "react-router-dom";
import Sidebar from "./SidebarAdmin";
import HeaderAdmin from "./HeaderAdmin";
import "../styles/AdminLayout.css"

export default function AdminLayout() {
  return (
    <div className="admin-container">
      <Sidebar />

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <HeaderAdmin />

        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}