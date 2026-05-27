import { Route } from "react-router-dom";

import LoginAdmin from "../admin/LoginAdmin";
import Dashboard from "../admin/Dashboard";
import ListProperty from "../admin/ListProperty";

import AdminLayout from "../admin/components/AdminLayout";
import PrivateRoute from "./PrivateRoutes";
import RoleRoute from "./RoleRoute";
import CadProperty from "../admin/CadProperty";
import PreviewProperty from "../admin/PreviewProperty";
import ListUsers from "../admin/ListUsers";
import EditImovel from "../admin/EditImove";
import CadUser from "../admin/CadUser";
import EditUser from "../admin/EditUser";
import ResetUserPassword from "../admin/ResetUserPassword";
import AuditLogs from "../admin/AuditLogs";
import TrashProperty from "../admin/TrashProperty";
import ChangeOwnPassword from "../admin/ChangeOwnPassword";

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
                <Route path="minha-senha" element={<ChangeOwnPassword />} />

                <Route path="imoveis" element={<ListProperty />} />
                <Route path="imoveis/cadastrar" element={<CadProperty />} />
                <Route
                    path="imoveis/lixeira"
                    element={
                        <RoleRoute allowedRoles={["admin", "dev"]}>
                            <TrashProperty />
                        </RoleRoute>
                    }
                />
                <Route
                    path="usuarios"
                    element={
                        <RoleRoute allowedRoles={["admin", "dev"]}>
                            <ListUsers />
                        </RoleRoute>
                    }
                />
                <Route
                    path="usuarios/cadastrar"
                    element={
                        <RoleRoute allowedRoles={["admin", "dev"]}>
                            <CadUser />
                        </RoleRoute>
                    }
                />
                <Route
                    path="usuarios/editar/:id"
                    element={
                        <RoleRoute allowedRoles={["admin", "dev"]}>
                            <EditUser />
                        </RoleRoute>
                    }
                />
                <Route
                    path="usuarios/redefinir-senha/:id"
                    element={
                        <RoleRoute allowedRoles={["admin", "dev"]}>
                            <ResetUserPassword />
                        </RoleRoute>
                    }
                />
                <Route path="imoveis/editar/:id" element={<EditImovel />} />
                <Route
                    path="auditoria"
                    element={
                        <RoleRoute allowedRoles={["admin", "dev"]}>
                            <AuditLogs />
                        </RoleRoute>
                    }
                />

                <Route path="preview-imovel" element={<PreviewProperty />} />
            </Route>
        </>
    );
}
