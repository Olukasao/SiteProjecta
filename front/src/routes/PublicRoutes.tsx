import { Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import ImovelDetalhe from "../pages/ImovelDetalhe";
import Sobre from "../pages/Sobre";
import Imoveis from "../pages/Imoveis";
import LoginCliente from "../pages/LoginCliente";
import Financiamento from "../pages/Financiamento";

export default function PublicRoutes() {
  return (
    <>
      <Route path="/" element={<HomePage />} />
      <Route path="/sobre" element={<Sobre />} />
      <Route path="/imoveis" element={<Imoveis />} />
      <Route path="/area-cliente/login" element={<LoginCliente />} />
      <Route path="/financiamento" element={<Financiamento />} />
      <Route path="/imovel/:id" element={<ImovelDetalhe />} />
    </>
  );
}