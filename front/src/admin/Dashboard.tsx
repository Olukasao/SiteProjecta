import { useEffect, useState } from "react";
import "./styles/dashboard.css"

import { api } from "../services/api";

export default function Dashboard() {
    const [dados, setDados] = useState({
        imoveis: 0,
        clientes: 0,
        vendas: 0,
    });

    useEffect(() => {
        api.get("/dashboard")
            .then((res) => setDados(res.data))
            .catch((err) => console.error("Erro dashboard:", err));
    }, []);

    return (
        <div className="admin-container">

            <div className="admin-content">
                <h1>Dashboard</h1>

                {/* CARDS */}
                <div className="cards">
                    <div className="card">
                        <h3>Total de Imóveis</h3>
                        <p>{dados.imoveis}</p>
                    </div>

                    <div className="card">
                        <h3>Clientes</h3>
                        <p>{dados.clientes}</p>
                    </div>

                    <div className="card">
                        <h3>Vendas</h3>
                        <p>{dados.vendas}</p>
                    </div>
                </div>

                {/* ÁREA FUTURA */}
                <div className="dashboard-section">
                    <h2>Últimos imóveis cadastrados</h2>

                    <div className="empty-state">
                        <p>Nenhum dado disponível</p>
                    </div>
                </div>
            </div>
        </div>
    );
}