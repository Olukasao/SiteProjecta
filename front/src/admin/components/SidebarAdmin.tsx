import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
    Archive,
    Building2,
    ChevronDown,
    ClipboardList,
    Gauge,
    History,
    KeyRound,
    LifeBuoy,
    PlusCircle,
    UserPlus,
    UsersRound,
} from "lucide-react";
import { isAdminLike } from "../utils/permissions";

type SidebarAdminProps = {
    user?: {
        role?: string;
    } | null;
};

function linkClass({ isActive }: { isActive: boolean }) {
    return isActive ? "sidebar-link active" : "sidebar-link";
}

export default function SidebarAdmin({ user }: SidebarAdminProps) {
    const location = useLocation();
    const propertyIsActive = location.pathname.startsWith("/admin/imoveis");
    const [openImoveis, setOpenImoveis] = useState(propertyIsActive);
    const canManageAdmin = isAdminLike(user);

    useEffect(() => {
        if (propertyIsActive) {
            setOpenImoveis(true);
        }
    }, [propertyIsActive]);

    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <span>PA</span>
                <div>
                    <strong>Projecta</strong>
                    <small>Admin</small>
                </div>
            </div>

            <nav className="sidebar-nav">
                <div className="menu-section">
                    <span className="menu-section-label">Principal</span>
                    <NavLink to="/admin/dashboard" end className={linkClass}>
                        <Gauge size={18} />
                        Dashboard
                    </NavLink>
                </div>

                <div className="menu-section">
                    <span className="menu-section-label">Imóveis</span>
                    <button
                        className={propertyIsActive ? "sidebar-menu-button active" : "sidebar-menu-button"}
                        type="button"
                        onClick={() => setOpenImoveis((prev) => !prev)}
                    >
                        <Building2 size={18} />
                        <span>Imóveis</span>
                        <ChevronDown size={16} className={openImoveis ? "chevron open" : "chevron"} />
                    </button>

                    {openImoveis && (
                        <div className="submenu">
                            <NavLink to="/admin/imoveis" end className={linkClass}>
                                <ClipboardList size={16} />
                                Listar imóveis
                            </NavLink>
                            <NavLink to="/admin/imoveis/cadastrar" className={linkClass}>
                                <PlusCircle size={16} />
                                Cadastrar imóvel
                            </NavLink>
                            {canManageAdmin && (
                                <NavLink to="/admin/imoveis/lixeira" className={linkClass}>
                                    <Archive size={16} />
                                    Lixeira
                                </NavLink>
                            )}
                        </div>
                    )}
                </div>

                {canManageAdmin && (
                    <div className="menu-section">
                        <span className="menu-section-label">Administração</span>
                        <NavLink to="/admin/usuarios" end className={linkClass}>
                            <UsersRound size={18} />
                            Usuários
                        </NavLink>
                        <NavLink to="/admin/usuarios/cadastrar" className={linkClass}>
                            <UserPlus size={18} />
                            Novo usuário
                        </NavLink>
                        <NavLink to="/admin/auditoria" className={linkClass}>
                            <History size={18} />
                            Auditoria
                        </NavLink>
                    </div>
                )}

                <div className="menu-section">
                    <span className="menu-section-label">Conta</span>
                    <NavLink to="/admin/minha-senha" className={linkClass}>
                        <KeyRound size={18} />
                        Minha senha
                    </NavLink>
                    <span className="sidebar-link muted">
                        <LifeBuoy size={18} />
                        Suporte
                    </span>
                </div>
            </nav>
        </aside>
    );
}
