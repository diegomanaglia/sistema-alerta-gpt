// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';

import ListagemVeiculos from './components/ListagemVeiculos';
import ListagemProdutos from './components/ListagemProdutos';
import ListagemClientes from './components/ListagemClientes';
import ListagemOS from './components/ListagemOS';
import OrdemServico from './components/OrdemServico';

export default function App() {
  return (
    <BrowserRouter>
      {/* Barra de navegação superior */}
      <header className="bg-blue-900 text-white p-4 flex space-x-6">
        <Link to="/veiculos" className="hover:underline">Veículos</Link>
        <Link to="/produtos" className="hover:underline">Produtos</Link>
        <Link to="/clientes" className="hover:underline">Clientes</Link>
        <Link to="/os" className="hover:underline">Ordens de Serviço</Link>
        <Link to="/ordem_servico" className="hover:underline">Nova OS</Link>
      </header>

      <main className="p-6">
        <Routes>
          {/* Redirecionamento padrão */}
          <Route path="/" element={<Navigate to="/veiculos" replace />} />

          {/* Veículos */}
          <Route path="/veiculos" element={<ListagemVeiculos />} />

          {/* Produtos */}
          <Route path="/produtos" element={<ListagemProdutos />} />

          {/* Clientes */}
          <Route path="/clientes" element={<ListagemClientes />} />

          {/* Ordens de Serviço */}
          <Route path="/os" element={<ListagemOS />} />
          <Route path="/ordem_servico" element={<OrdemServico />} />
          <Route path="/ordem_servico/:id" element={<OrdemServico />} />

          {/* Fallback */}
          <Route path="*" element={<p>Página não encontrada</p>} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
