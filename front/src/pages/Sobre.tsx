import Footer from "../components/Footer";
import Header from "../components/Header";
import "../styles/Sobre.css";

import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";

import { Target, Eye, Gem } from "lucide-react";

export default function Sobre() {
    useEffect(() => {
        AOS.init({
            duration: 800,
            once: true
        });
        document.title = "Sobre Nós | Projecta Empreendimentos";
    }, []);

    return (
        <>
            <Header />

            <div className="about">

                {/* HERO PREMIUM */}
                <section className="about-hero">
                    <div className="about-hero-content">
                        <h1>Construindo mais do que imóveis</h1>
                        <p>Transformamos projetos em lares com qualidade, confiança e inovação</p>
                    </div>
                </section>

                {/* HISTÓRIA */}
                <section className="about-section">
                    <div className="container">
                        <h2 data-aos="fade-up">Nossa História</h2>

                        <p data-aos="fade-up" data-aos-delay="100">
                            A Projecta Empreendimentos nasceu com o propósito de transformar sonhos em realidade.
                            Ao longo dos anos, consolidamos nossa presença no mercado imobiliário através de
                            empreendimentos modernos, seguros e pensados para proporcionar qualidade de vida.
                        </p>

                        <p data-aos="fade-up" data-aos-delay="200">
                            Nosso compromisso vai além da construção: buscamos entregar experiências,
                            valorizando cada detalhe e garantindo a satisfação de nossos clientes.
                        </p>
                    </div>
                </section>

                {/* MISSÃO VISÃO VALORES */}
                <section className="about-section alt">
                    <div className="container">

                        <div className="mvv-header" data-aos="fade-up">
                            <h2>Nossos Pilares</h2>
                            <p>Os valores que sustentam cada projeto que entregamos</p>
                        </div>

                        <div className="mvv-grid">

                            <div className="mvv-card" data-aos="fade-up">
                                <div className="mvv-icon">
                                    <Target size={32} />
                                </div>
                                <h3>Missão</h3>
                                <p>
                                    Desenvolver empreendimentos que realizem sonhos,
                                    com qualidade, segurança e excelência em cada detalhe.
                                </p>
                            </div>

                            <div className="mvv-card" data-aos="fade-up" data-aos-delay="100">
                                <div className="mvv-icon">
                                    <Eye size={32} />
                                </div>
                                <h3>Visão</h3>
                                <p>
                                    Ser referência no mercado imobiliário,
                                    reconhecida pela inovação e confiança dos clientes.
                                </p>
                            </div>

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

                {/* NÚMEROS PREMIUM */}
                <section className="about-section">
                    <div className="container stats">

                        <div data-aos="fade-up">
                            <h2>+500</h2>
                            <span>Imóveis entregues</span>
                        </div>

                        <div data-aos="fade-up" data-aos-delay="100">
                            <h2>+10 anos</h2>
                            <span>de experiência</span>
                        </div>

                        <div data-aos="fade-up" data-aos-delay="200">
                            <h2>+1000</h2>
                            <span>clientes satisfeitos</span>
                        </div>

                    </div>
                </section>


                {/* CTA PREMIUM */}
                <section className="about-cta">
                    <div className="cta-content">
                        <h2>Encontre o imóvel ideal para você</h2>
                        <p>Fale com nossa equipe e descubra as melhores oportunidades</p>

                        <div className="cta-buttons">
                            <button className="btn-primary">Ver imóveis</button>
                            <button className="btn-secondary">Falar no WhatsApp</button>
                        </div>
                    </div>
                </section>

            </div>

            <Footer />
        </>
    );
}