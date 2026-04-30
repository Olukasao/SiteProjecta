import { useLocation } from "react-router-dom";

export default function PreviewProperty() {
  const { state } = useLocation();

  if (!state) return <p>Sem dados</p>;

  return (
    <div className="imovel-page">
      <div className="banner">
        <img src={state.preview} alt="" />
      </div>

      <div className="imovel-header">
        <div>
          <h1>{state.nome}</h1>
          <p>{state.bairro} - {state.cidade}</p>

          <div>
            🛏️ {state.quartos} | 🚿 {state.banheiros} | 🚗 {state.vagas}
          </div>
        </div>

        <div className="preco">R$ {state.preco}</div>
      </div>

      <div className="imovel-body">
        <div>
          <h2>Descrição</h2>
          <p>{state.descricao}</p>
        </div>

        <div className="sidebar">
          <button>WhatsApp</button>
          <button>Ligar</button>
        </div>
      </div>
    </div>
  );
}