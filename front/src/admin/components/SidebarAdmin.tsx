import { useState } from "react";
import { Link } from "react-router-dom";


export default function SidebarAdmin() {
    const [openImoveis, setOpenImoveis] = useState(false);
    const [openUsuarios, setOpenUsuarios] = useState(false);

    return (
        <div className="sidebar">
            <h2>Admin</h2>

            <Link to="/admin/dashboard">Dashboard</Link>

            {/* MENU IMÓVEIS */}
            <div className="menu-item">
                <div className="menu-title" onClick={() => setOpenImoveis(!openImoveis)}>
                    Imóveis ▾
                </div>
                {openImoveis && (
                    <div className="submenu">
                        <Link to="/admin/imoveis">Listar Imóveis</Link>
                        <Link to="/admin/imoveis/cadastrar">Cadastrar Imóvel</Link>
                    </div>
                )}
                <div  >
                    <div className="menu-title" onClick={() => setOpenUsuarios(!openUsuarios)}>
                        Usuarios ▾
                    </div>
                    {openUsuarios && (
                        <div className="submenu">
                            <Link to="/admin/usuarios">Listar Usuarios</Link>
                            <Link to="/admin/usuarios/cadastrar">Cadastrar Usuario</Link>
                        </div>
                    )}
                </div>
                <div className="menu-title">
                    Configurações
                </div>
                <div className="menu-title">
                    Suporte
                </div>


            </div>
        </div>
    );
}