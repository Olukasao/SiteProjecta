
import "./styles/dashboard.css"



export default function Dashboard() {

    return (
        <div className="admin-container">

            <div className="admin-content">
                <h1>Dashboard</h1>

                {/* CARDS */}
                <div className="cards">
                    <div className="card">
                        <h3>Total de Imóveis</h3>
                       
                    </div>

                    <div className="card">
                        <h3>Clientes</h3>
                       
                    </div>

                    <div className="card">
                        <h3>Vendas</h3>
                      
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