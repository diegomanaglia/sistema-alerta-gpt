// src/components/ListagemVeiculos.jsx
import React, { useState, useEffect } from 'react';

export default function ListagemVeiculos() {
  const [veiculos, setVeiculos] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [filtroPlaca, setFiltroPlaca] = useState('');
  const [filtroCliente, setFiltroCliente] = useState('');

  useEffect(() => {
    fetchVeiculos(pagina);
  }, [pagina]);

  async function fetchVeiculos(p = 1) {
    let url = filtroPlaca
      ? `/api/veiculos/getVeiculoUnico/${filtroPlaca}`
      : filtroCliente
        ? `/api/veiculos/getVeiculosByNomeCliente/${filtroCliente}`
        : `/api/veiculos/getVeiculos?page=${p}`;

    const res = await fetch(url);
    const data = await res.json();
    if (Array.isArray(data.veiculos)) {
      setVeiculos(data.veiculos);
      setPagina(data.page);
      setTotalPaginas(data.totalPages);
    } else {
      setVeiculos(Array.isArray(data) ? data : [data]);
      setTotalPaginas(1);
      setPagina(1);
    }
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md mt-4">
      <h4 className="text-xl font-bold mb-4">Pesquisa de veículos</h4>

      {/* filtros */}
      <div className="flex space-x-4 mb-4">
        <div>
          <label className="block text-sm">Placa</label>
          <input
            type="text"
            value={filtroPlaca}
            onChange={e => setFiltroPlaca(e.target.value.toUpperCase())}
            onKeyDown={e => e.key==='Enter' && fetchVeiculos(1)}
            className="border p-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm">Cliente</label>
          <input
            type="text"
            value={filtroCliente}
            onChange={e => setFiltroCliente(e.target.value.toUpperCase())}
            onKeyDown={e => e.key==='Enter' && fetchVeiculos(1)}
            className="border p-2 rounded"
          />
        </div>
        <button
          onClick={() => { setFiltroPlaca(''); setFiltroCliente(''); fetchVeiculos(1); }}
          className="self-end px-4 py-2 bg-gray-200 rounded"
        >
          Limpar
        </button>
      </div>

      {/* tabela */}
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-100">
            {['ID','PLACA','MARCA','MODELO','ANO','COR','COMB.','CLIENTE','OPÇÕES'].map(th => (
              <th key={th} className="border p-2 text-left">{th}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {veiculos.length > 0 ? veiculos.map(v => (
            <tr key={v.id_veiculo} className="hover:bg-gray-50">
              <td className="border p-2">{v.id_veiculo}</td>
              <td className="border p-2">{v.placa}</td>
              <td className="border p-2">{v.marca_veiculo}</td>
              <td className="border p-2">{v.modelo_veiculo}</td>
              <td className="border p-2">{v.ano}</td>
              <td className="border p-2">{v.cor}</td>
              <td className="border p-2">{v.tipo_comb}</td>
              <td className="border p-2">{v.nome || v.nome_cliente}</td>
              <td className="border p-2">
                <button
                  onClick={() => window.location.href = `/veiculos?placa=${v.placa}`}
                  className="px-2 py-1 bg-blue-500 text-white rounded"
                >
                  Detalhes
                </button>
              </td>
            </tr>
          )) : (
            <tr><td colSpan={9} className="border p-2 text-center">Nenhum veículo encontrado.</td></tr>
          )}
        </tbody>
      </table>

      {/* paginação */}
      <div className="flex justify-center items-center space-x-4 mt-4">
        <button
          disabled={pagina===1}
          onClick={() => fetchVeiculos(pagina-1)}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Anterior
        </button>
        <span>{pagina} / {totalPaginas}</span>
        <button
          disabled={pagina===totalPaginas}
          onClick={() => fetchVeiculos(pagina+1)}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Próximo
        </button>
      </div>
    </div>
  );
}
