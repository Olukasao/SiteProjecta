import { Route } from "react-router-dom";

import LoginAdmin from "../admin/LoginAdmin";
import Dashboard from "../admin/Dashboard";
import ListProperty from "../admin/ListProperty";

import AdminLayout from "../admin/components/AdminLayout";
import PrivateRoute from "./PrivateRoutes";
import CadProperty from "../admin/CadProperty";
import PreviewProperty from "../admin/PreviewProperty";
import ListUsers from "../admin/ListUsers";
import EditImovel from "../admin/EditImove";
import CadUser from "../admin/CadUser";
import EditUser from "../admin/EditUser";
import ResetUserPassword from "../admin/ResetUserPassword";
import AuditLogs from "../admin/AuditLogs";

export default function AdminRoutes() {
    return (
        <>
            {/* LOGIN */}
            <Route path="/admin/login" element={<LoginAdmin />} />

            {/* PROTEGIDO */}
            <Route
                path="/admin"
                element={
                    <PrivateRoute>
                        <AdminLayout />
                    </PrivateRoute>
                }
            >
                <Route index element={<Dashboard />} />
                <Route path="dashboard" element={<Dashboard />} />

                <Route path="imoveis" element={<ListProperty />} />
                <Route path="imoveis/cadastrar" element={<CadProperty />} />
                <Route path="usuarios" element={<ListUsers />} />
                <Route path="usuarios/cadastrar" element={<CadUser />} />
                <Route path="usuarios/editar/:id" element={<EditUser />} />
                <Route path="usuarios/redefinir-senha/:id" element={<ResetUserPassword />} />
                <Route path="imoveis/editar/:id" element={<EditImovel />} />
                <Route path="auditoria" element={<AuditLogs />} />

                <Route path="preview-imovel" element={<PreviewProperty />} />
            </Route>
        </>
    );
}
