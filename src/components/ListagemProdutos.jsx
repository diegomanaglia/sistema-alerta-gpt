// src/components/ListagemProdutos.jsx
import React, { useState, useEffect } from 'react';
import ModalProduto from './ModalProduto';

export default function ListagemProdutos() {
  const [produtos, setProdutos] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filtroCodigo, setFiltroCodigo] = useState('');

  // Estado para modal
  const [modalOpen, setModalOpen] = useState(false);
  const [produtoEdit, setProdutoEdit] = useState(null);

  useEffect(() => {
    fetchProdutos(page);
  }, [page]);

  async function fetchProdutos(p = 1) {
    const endpoint = filtroCodigo
      ? `/api/produtos/getProdutoByCodigo/${filtroCodigo}`
      : `/api/produtos/getProdutos?page=${p}`;
    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      if (data.produtos) {
        setProdutos(data.produtos);
        setPage(data.page);
        setTotalPages(data.totalPages);
      } else {
        setProdutos(Array.isArray(data) ? data : [data]);
        setPage(1);
        setTotalPages(1);
      }
    } catch (err) {
      console.error(err);
    }
  }

  function abrirModal(id = null) {
    setProdutoEdit(id);
    setModalOpen(true);
  }

  function fecharModal() {
    setModalOpen(false);
    setProdutoEdit(null);
    fetchProdutos(page);
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      {/* Cabeçalho com título e botão de novo produto */}
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-xl font-bold">Listagem de Produtos</h4>
        <button
          onClick={() => abrirModal(null)}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer"
        >
          Novo Produto
        </button>
      </div>

      {/* Filtro e limpar */}
      <div className="flex space-x-4 mb-4 items-end">
        <div>
          <label className="block text-sm">Código / SKU</label>
          <input
            type="text"
            value={filtroCodigo}
            onChange={e => setFiltroCodigo(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchProdutos(1)}
            className="border p-2 rounded"
          />
        </div>
        <button
          onClick={() => { setFiltroCodigo(''); fetchProdutos(1); }}
          className="px-4 py-2 bg-gray-200 rounded cursor-pointer hover:bg-gray-300"
        >
          Limpar
        </button>
      </div>

      {/* Tabela de produtos */}
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-100">
            {['Código', 'Descrição', 'Qtd Disp.', 'Preço', 'Status', 'Opções'].map(th => (
              <th key={th} className="border p-2 text-left">{th}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {produtos.length > 0 ? produtos.map(prod => (
            <tr key={prod.id} className="hover:bg-gray-50">
              <td className="border p-2">{prod.sku}</td>
              <td className="border p-2">{prod.descricao}</td>
              <td className="border p-2">
                {prod.qtd_estoque.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              <td className="border p-2">
                {prod.valor_venda.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              <td className="border p-2">{prod.status}</td>
              <td className="border p-2">
                <button
                  onClick={() => abrirModal(prod.id)}
                  className="px-2 py-1 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600"
                >
                  Detalhes
                </button>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan={6} className="border p-2 text-center">
                Nenhum produto encontrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Paginação */}
      <div className="flex justify-center items-center space-x-4 mt-4">
        <button
          disabled={page === 1}
          onClick={() => fetchProdutos(page - 1)}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 cursor-pointer hover:bg-gray-300"
        >Anterior</button>
        <span>{page} / {totalPages}</span>
        <button
          disabled={page === totalPages}
          onClick={() => fetchProdutos(page + 1)}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 cursor-pointer hover:bg-gray-300"
        >Próximo</button>
      </div>

      {/* Modal para criar / editar produto */}
      {modalOpen && (
        <ModalProduto
          produtoId={produtoEdit}
          isOpen={modalOpen}
          onClose={fecharModal}
          refreshList={() => fetchProdutos(page)}
        />
      )}
    </div>
  );
}
