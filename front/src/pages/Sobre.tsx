import Footer from "../components/Footer";
import Header from "../components/Header";
import "../styles/Sobre.css";

import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";
import Mapa from "../components/Mapa";
import { Target, Eye, Gem } from "lucide-react";


export default function Sobre() {
    useEffect(() => {
        AOS.init({
            duration: 800,
            once: true
        });
        document.title = "Sobre Nós | Projecta Empreendimento";
    }, []);
    return (
        <>
            <Header />
            <div className="about">

                {/* HERO */}
                <section className="about-hero">
                    <div className="about-hero-content">
                        <h1>Sobre a Projecta</h1>
                        <p>Construindo sonhos e entregando qualidade há anos</p>
                    </div>
                </section>

                {/* HISTÓRIA */}
                <section className="about-section">
                    <div className="container">
                        <h2>Nossa História</h2>
                        <p>
                            A Projecta nasceu com o propósito de transformar projetos em realidade,
                            oferecendo imóveis de qualidade com segurança, transparência e inovação.
                            Ao longo dos anos, consolidamos nossa presença no mercado imobiliário,
                            entregando empreendimentos que fazem a diferença na vida das pessoas.
                        </p>
                    </div>
                </section>

                {/* MISSÃO VISÃO VALORES */}
                <section className="about-section alt">
                    <div className="container">

                        <div className="mvv-header" data-aos="fade-up">
                            <h2>Nossos Pilares</h2>
                            <p>Os princípios que guiam cada projeto da Projecta</p>
                        </div>

                        <div className="mvv-grid">

                            {/* MISSÃO */}
                            <div className="mvv-card" data-aos="fade-up">
                                <div className="mvv-icon">
                                    <Target size={32} />
                                </div>
                                <h3>Missão</h3>
                                <p>
                                    Desenvolver empreendimentos que realizem sonhos, com qualidade,
                                    segurança e excelência em cada detalhe.
                                </p>
                            </div>

                            {/* VISÃO */}
                            <div className="mvv-card" data-aos="fade-up" data-aos-delay="100">
                                <div className="mvv-icon">
                                    <Eye size={32} />
                                </div>
                                <h3>Visão</h3>
                                <p>
                                    Ser referência no mercado imobiliário, reconhecida pela inovação
                                    e pela confiança dos nossos clientes.
                                </p>
                            </div>

                            {/* VALORES */}
                            <div className="mvv-card" data-aos="fade-up" data-aos-delay="200">
                                <div className="mvv-icon">
                                    <Gem size={32} />
                                </div>
                                <h3>Valores</h3>
                                <ul>
                                    <li>Ética e transparência</li>
                                    <li>Compromisso com o cliente</li>
                                    <li>Qualidade e inovação</li>
                                    <li>Responsabilidade</li>
                                </ul>
                            </div>

                        </div>

                    </div>
                </section>

                {/* NÚMEROS */}
                <section className="about-section">
                    <div className="container stats">

                        <div>
                            <h2>+500</h2>
                            <span>Imóveis entregues</span>
                        </div>

                        <div>
                            <h2>+10 anos</h2>
                            <span>de mercado</span>
                        </div>

                        <div>
                            <h2>+1000</h2>
                            <span>clientes satisfeitos</span>
                        </div>

                    </div>
                </section>

                {/* EQUIPE */}


                <section className="about-section">
                    <div className="container">

                        <h2 data-aos="fade-up">Onde estamos</h2>

                        <div data-aos="fade-up" data-aos-delay="200">
                            <Mapa />
                        </div>

                    </div>
                </section>
                <section className="about-cta">
                    <h2>Quer encontrar seu imóvel ideal?</h2>
                    <button>Ver Imóveis</button>
                </section>
            </div>
            <Footer />
        </>
    );
}