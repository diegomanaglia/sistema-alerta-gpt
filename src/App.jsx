import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';

import CadastroVeiculo from './components/CadastroVeiculo';
import ListagemVeiculos from './components/ListagemVeiculos';
import ListagemProdutos from './components/ListagemProdutos';
import ListagemClientes from './components/ListagemClientes';

export default function App() {
  return (
    <BrowserRouter>
      <header className="bg-gray-800 text-white p-4 flex space-x-4">
        <Link to="/veiculos" className="hover:underline">Veículos</Link>
        <Link to="/veiculos/novo" className="hover:underline">Cadastrar Veículo</Link>
        <Link to="/produtos" className="hover:underline">Produtos</Link>
        <Link to="/clientes" className="hover:underline">Clientes</Link>
      </header>

      <main className="p-6">
        <Routes>
          <Route path="/" element={<Navigate to="/veiculos" replace />} />

          {/* Veículos */}
          <Route path="/veiculos" element={<ListagemVeiculos />} />
          <Route path="/veiculos/novo" element={<CadastroVeiculo source="" />} />

          {/* Produtos */}
          <Route path="/produtos" element={<ListagemProdutos />} />

          {/* Clientes */}
          <Route path="/clientes" element={<ListagemClientes />} />

          {/* Fallback */}
          <Route path="*" element={<p>Página não encontrada</p>} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
