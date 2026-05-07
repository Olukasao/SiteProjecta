import Header from "../components/Header";
import Footer from "../components/Footer";
import "../styles/financiamento.css";
import caixa from "../assets/caixa.png"
const bancos = [
    {
        nome: "Caixa",
        link: "https://habitacao.caixa.gov.br/siopiweb-web/simulaOperacaoInternet.do?method=inicializarCasoUso&pk_campaign=habitacao&pk_kwd=direct&pk_source=redirect",
        logo: caixa
    },
    {
        nome: "Banco do Brasil",
        link: "https://www.bb.com.br/site/pra-voce/financiamentos/",
        logo: "https://logospng.org/download/banco-do-brasil/logo-banco-do-brasil-256.png",
    },
    {
        nome: "Bradesco",
        link: "https://banco.bradesco/html/exclusive/produtos-servicos/emprestimo-e-financiamento/encontre-seu-credito/simuladores-imoveis.shtm",
        logo: "https://logospng.org/download/bradesco/logo-bradesco-256.png",
    },
    {
        nome: "Itaú",
        link: "https://www.itau.com.br/emprestimos-financiamentos/credito-imobiliario",
        logo: "https://logospng.org/download/itau/logo-itau-256.png",
    },
    {
        nome: "Santander",
        link: "https://www.santander.com.br/banco/credito-financiamento-imobiliario/",
        logo: "https://logospng.org/download/santander/logo-santander-256.png",
    },
];

export default function Financiamento() {
    return (
        <>
            <Header />

            <div className="fin-page">
                <div className="fin-container">

                    {/* HERO */}
                    <section className="fin-hero">
                        <div className="fin-hero-text">
                            <h1>
                                Realize o sonho do seu imóvel com as melhores condições
                            </h1>

                            <p>
                                Trabalhamos com os principais bancos do Brasil para garantir
                                as melhores taxas e segurança.
                            </p>

                            <ul>
                                <li>✔ Subsídios disponíveis</li>
                                <li>✔ Utilize seu FGTS</li>
                                <li>✔ Composição de renda</li>
                            </ul>
                        </div>

                        <div className="fin-hero-img">
                            <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab" />
                        </div>
                    </section>

                    {/* BANCOS */}
                    <section className="fin-bancos">
                        <h2>Instituições financeiras parceiras</h2>

                        <div className="fin-bancos-grid">
                            {bancos.map((banco, index) => (
                                <a
                                    key={index}
                                    href={banco.link}
                                    target="_blank"
                                    className="fin-card"
                                >
                                    <div className="fin-logo">
                                        <img src={banco.logo} alt={banco.nome} />
                                    </div>


                                    <span>Simular financiamento →</span>
                                </a>
                            ))}
                        </div>
                    </section>

                    {/* FAQ */}
                    <section className="fin-faq">
                        <h2>Dúvidas frequentes</h2>

                        <details>
                            <summary>Quem pode financiar?</summary>
                            <p>Pessoas com renda comprovada e sem restrições.</p>
                        </details>

                        <details>
                            <summary>Posso usar FGTS?</summary>
                            <p>Sim, conforme regras vigentes.</p>
                        </details>

                        <details>
                            <summary>Posso compor renda?</summary>
                            <p>Sim, com outra pessoa.</p>
                        </details>
                    </section>

                </div>
            </div>

            <Footer />
        </>
    );
}