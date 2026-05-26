import "../styles/Header.css";
import { useEffect, useState } from "react";
import logo from "../assets/logo-projecta.png"

import { Link } from "react-router-dom";


export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  // efeito ao scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // trava scroll quando menu abre
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto";
  }, [open]);

  return (
    <>
      <header className={`header ${scrolled ? "scrolled" : ""}`}>
        <div className="header-wrapper">

          {/* LOGO */}
          <div className="logo-header">
            <Link to="/">
              <img src={logo} alt="Logo" />
            </Link>
          </div>

          {/* MENU DESKTOP */}
          <nav className="menu">
            <Link to="/">Home</Link>
            <Link to="/sobre">Sobre</Link>
            <Link to="/imoveis">Imóveis</Link>
            <Link to="/financiamento">Financiamento</Link>
            <Link to="/area-cliente/login">Área do Cliente</Link>


          </nav>

          {/* AÇÕES DESKTOP */}
          <div className="header-actions">
            <Link to="/admin/login" className="admin-login-link">
              Login
            </Link>

            <button
              type="button"
              className="btn-primary-header"
              onClick={() => window.open("https://wa.me/5511993878619", "_blank")}
            >
              Fale Conosco
            </button>
          </div>

          {/* HAMBURGUER */}
          <div
            className={`hamburger ${open ? "active" : ""}`}
            onClick={() => setOpen(!open)}
          >
            <span></span>
            <span></span>
            <span></span>
          </div>

        </div>
      </header>

      {/* OVERLAY */}
      <div
        className={`overlay ${open ? "show" : ""}`}
        onClick={() => setOpen(false)}
      />

      {/* MENU MOBILE */}
      <div className={`mobile-menu ${open ? "open" : ""}`}>
        <button type="button" className="close-btn" onClick={() => setOpen(false)}>
          ✕
        </button>

        <Link to="/" onClick={() => setOpen(false)} >Home</Link>
        <Link to="/sobre" onClick={() => setOpen(false)} >Sobre</Link>
        <Link to="/imoveis" onClick={() => setOpen(false)} >Imóveis</Link>
        <Link to="/financiamento" onClick={() => setOpen(false)} >Financiamento</Link>
        <Link to="/area-cliente/login" onClick={() => setOpen(false)} className="area" >Área do Cliente</Link>
        <Link to="/admin/login" onClick={() => setOpen(false)} className="admin-mobile-link">Área Admin</Link>


        <button
          type="button"
          className="btn-primary"
          onClick={() => window.open("https://wa.me/5511993878619", "_blank")}
        >
          Fale Conosco
        </button>
      </div>
    </>
  );
}
