// src/components/ListagemClientes.jsx
import React, { useState, useEffect } from 'react';
// import ModalCliente from './ModalCliente';

export default function ListagemClientes() {
  const [clientes, setClientes] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filtroTermo, setFiltroTermo] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [clienteEdit, setClienteEdit] = useState(null);

  useEffect(() => {
    fetchClientes(page);
  }, [page]);

  async function fetchClientes(p = 1) {
    try {
      const url = filtroTermo
        ? `/clientes/pesquisaClientes/${filtroTermo}`
        : `/clientes/getClientes?page=${p}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.clientes) {
        setClientes(data.clientes);
        setPage(data.page);
        setTotalPages(data.totalPages);
      } else {
        setClientes(Array.isArray(data) ? data : [data]);
        setPage(1);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Erro ao buscar clientes:', err);
    }
  }

  function abrirModal(id = null) {
    setClienteEdit(id);
    setModalOpen(true);
  }

  function fecharModal() {
    setModalOpen(false);
    setClienteEdit(null);
    fetchClientes(page);
  }

  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-xl font-bold">Clientes</h4>
        <button
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer"
          onClick={() => abrirModal()}
        >
          Novo Cliente
        </button>
      </div>
      {/* Filtro de pesquisa */}
      <div className="flex items-end space-x-4 mb-4">
        <div>
          <label className="block text-sm">Pesquisar</label>
          <input
            type="text"
            value={filtroTermo}
            onChange={e => setFiltroTermo(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && fetchClientes(1)}
            className="border p-2 rounded w-64"
          />
        </div>
        <button
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          onClick={() => { setFiltroTermo(''); fetchClientes(1); }}
        >Limpar</button>
      </div>
      {/* Tabela de clientes */}
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2 text-left">Nome / Razão</th>
            <th className="border p-2 text-left">Tipo</th>
            <th className="border p-2 text-left">CPF/CNPJ</th>
            <th className="border p-2 text-left">Status</th>
            <th className="border p-2 text-left">Opções</th>
          </tr>
        </thead>
        <tbody>
          {clientes.length ? clientes.map(c => (
            <tr key={c.id_cliente} className="hover:bg-gray-50">
              <td className="border p-2">{c.nome}</td>
              <td className="border p-2">{c.tipo_pessoa}</td>
              <td className="border p-2">{c.cpf || c.cnpj}</td>
              <td className="border p-2">{c.status}</td>
              <td className="border p-2">
                <button
                  className="px-2 py-1 bg-blue-500 text-white rounded cursor-pointer"
                  onClick={() => abrirModal(c.id_cliente)}
                >Detalhes</button>
              </td>
            </tr>
          )) : (
            <tr><td colSpan={5} className="border p-2 text-center">Nenhum cliente encontrado.</td></tr>
          )}
        </tbody>
      </table>
      {/* Paginação */}
      <div className="flex justify-center items-center space-x-4 mt-4">
        <button
          disabled={page === 1}
          onClick={() => fetchClientes(page - 1)}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >Anterior</button>
        <span>{page} / {totalPages}</span>
        <button
          disabled={page === totalPages}
          onClick={() => fetchClientes(page + 1)}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >Próximo</button>
      </div>

      {modalOpen && (
        <ModalCliente
          clienteId={clienteEdit}
          isOpen={modalOpen}
          onClose={fecharModal}
        />
      )}
    </div>
  );
}
