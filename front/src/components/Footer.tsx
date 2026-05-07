import "../styles/Footer.css";
import logo from "../assets/logo-projecta.png";

import logoMV from "../assets/logo-mcmv.png";
import logoPBQP from "../assets/logo-pbqp-h.png";
import logoISO from "../assets/logo-alc-pqpb.png";
import logoCaixa from "../assets/logo-alc.png";

import {
  Phone,
  Mail,
  MapPin,
  Send,

} from "lucide-react";
import { FaInstagram, FaFacebookF } from "react-icons/fa";
import { BsWhatsapp } from "react-icons/bs";
import { Link } from "react-router-dom";



export default function Footer() {
  return (
    <>
      <footer className="footer">

        <div className="footer-wrapper">

          {/* LOGO + SOBRE */}
          <div className="footer-col logo-col">
            <img src={logo} alt="Projecta" />
            <p>
              Transformando projetos em realidade com qualidade, inovação e confiança.
            </p>

            {/* REDES SOCIAIS */}
            <div className="socials">
              <a href="https://www.instagram.com/projectaempreendimentos/"><FaInstagram /></a>
              <a href="https://www.facebook.com/profile.php?id=61578396025104"><FaFacebookF /></a>
              <a href="https://wa.me/5511993878619"><BsWhatsapp /></a>
            </div>
          </div>

          {/* LINKS */}
          <div className="footer-col">
            <h4>Institucional</h4>
            <Link to="/">Home</Link>
            <Link to="/sobre">Sobre</Link>
            <Link to="/imoveis">Imóveis</Link>
            <Link to="/financiamento">Financiamento</Link>
            <Link to="/area-cliente/login">Área do Cliente</Link>
          </div>



          {/* CONTATO */}
          <div className="footer-col">
            <h4>Contato</h4>

            <p className="contact-item">
              <MapPin size={16} /> Franco da Rocha - SP
            </p>

            <p className="contact-item">
              <Phone size={16} /> (11) 5420-1018
            </p>

            <p className="contact-item">
              <Mail size={16} />contato@projectaempreendimentos.com.br
            </p>
          </div>

          {/* NEWSLETTER */}
          <div className="footer-col newsletter">
            <h4>Receba novidades</h4>
            <p>Cadastre-se e receba ofertas exclusivas</p>

            <div className="newsletter-box">
              <input placeholder="Seu email" />
              <button>
                <Send size={16} />
              </button>
            </div>
          </div>

        </div>

        {/* CERTIFICAÇÕES */}
        <div className="footer-certifications">

          <div className="cert-block">
            <h5>PROGRAMAS</h5>
            <div className="cert-logos">
              <img src={logoMV} alt="Minha Casa Minha Vida" />
            </div>
          </div>

          <div className="cert-block">
            <h5>CERTIFICAÇÕES</h5>
            <div className="cert-logos">
              <img src={logoPBQP} alt="PBQP-H" />
              <img src={logoISO} alt="ISO" />
              <img src={logoCaixa} alt="CAIXA" />
            </div>
          </div>

        </div>

        {/* COPYRIGHT */}
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Projecta Empreendimentos</p>
        </div>

      </footer>

      {/* 💬 WHATSAPP FLUTUANTE */}
      <a
        href="https://wa.me/5511993878619"
        target="_blank"
        className="whatsapp-float"
      >
        <BsWhatsapp size={22} />
      </a>
    </>
  );
}