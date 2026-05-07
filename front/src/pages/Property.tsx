import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/Property.css";

export default function Property() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("info");

  const property = {
    id: id,
    title: "Apartamento Garden - Condomínio Vila Verde",
    price: "R$ 850.000",
    status: "Disponível",
    type: "Apartamento",
    area: "125m²",
    bedrooms: 3,
    bathrooms: 2,
    garage: 2,
    address: "Rua das Flores, 123 - Vila Verde, São Paulo - SP",
    description: "Apartamento Garden moderno com 3 dormitórios, sendo 1 suíte. Cozinha americana completa, área de serviço, sacada gourmet com churrasqueira. Condomínio com piscina, academia, salão de festas e portaria 24h.",
    features: [
      "Piscina", "Academia", "Churrasqueira", "Elevador", 
      "Portaria 24h", "Área de Lazer", "Crianças", "Pets"
    ],
    images: [
      "/property1.jpg", "/property2.jpg", "/property3.jpg", 
      "/property4.jpg", "/property5.jpg"
    ]
  };

  const tabs = [
    { id: "info", label: "Informações" },
    { id: "galeria", label: "Galeria" },
    { id: "caracteristicas", label: "Características" },
    { id: "localizacao", label: "Localização" }
  ];

  const handleEdit = () => {
    navigate(`/admin/properties/${id}/edit`);
  };

  const handleDelete = () => {
    if (window.confirm("Deseja realmente excluir esta propriedade?")) {
      // Lógica de delete
      navigate("/admin/dashboard");
    }
  };

  return (
    <div className="property-page">
      {/* HEADER */}
      <header className="property-header">
        <div className="header-content">
          <button className="back-btn" onClick={() => navigate("/admin/dashboard")}>
            ← Voltar
          </button>
          <div className="property-actions">
            <button className="edit-btn" onClick={handleEdit}>
              ✏️ Editar
            </button>
            <button className="delete-btn" onClick={handleDelete}>
              🗑️ Excluir
            </button>
          </div>
        </div>
      </header>

      <div className="property-content">
        {/* GALERIA PRINCIPAL */}
        <div className="gallery-section">
          <div className="main-image">
            <img src={property.images[0]} alt={property.title} />
            <div className="status-badge">{property.status}</div>
          </div>
          <div className="thumbnails">
            {property.images.map((img, index) => (
              <img 
                key={index}
                src={img} 
                alt={`Foto ${index + 1}`}
                className={index === 0 ? 'active' : ''}
              />
            ))}
          </div>
        </div>

        {/* INFO PRINCIPAL */}
        <div className="property-info">
          <div className="price-section">
            <h1>{property.title}</h1>
            <div className="price">{property.price}</div>
          </div>

          <div className="property-specs">
            <div className="spec-item">
              <span className="spec-icon">📏</span>
              <span>{property.area}</span>
            </div>
            <div className="spec-item">
              <span className="spec-icon">🛏️</span>
              <span>{property.bedrooms} quartos</span>
            </div>
            <div className="spec-item">
              <span className="spec-icon">🚿</span>
              <span>{property.bathrooms} banheiros</span>
            </div>
            <div className="spec-item">
              <span className="spec-icon">🚗</span>
              <span>{property.garage} vagas</span>
            </div>
          </div>

          <div className="property-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TABS CONTENT */}
      <div className="property-tabs-content">
        {activeTab === "info" && (
          <div className="tab-content">
            <h2>Descrição</h2>
            <p>{property.description}</p>
          </div>
        )}

        {activeTab === "galeria" && (
          <div className="tab-content gallery-full">
            <div className="image-grid">
              {property.images.map((img, index) => (
                <img key={index} src={img} alt={`Galeria ${index + 1}`} />
              ))}
            </div>
          </div>
        )}

        {activeTab === "caracteristicas" && (
          <div className="tab-content">
            <h2>Características</h2>
            <div className="features-grid">
              {property.features.map((feature, index) => (
                <div key={index} className="feature-item">
                  <span className="feature-check">✅</span>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "localizacao" && (
          <div className="tab-content">
            <h2>Localização</h2>
            <div className="location-info">
              <div className="address">{property.address}</div>
              <div className="map-placeholder">
                <div className="map-icon">🗺️</div>
                <p>Mapa interativo em desenvolvimento</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}