// src/components/ListagemOS.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { NumericFormat } from 'react-number-format'

export default function ListagemOS() {
  const [oss, setOss] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filtroPlaca, setFiltroPlaca] = useState('');
  const [filtroCliente, setFiltroCliente] = useState('');
  const navigate = useNavigate();
  const { search } = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(search);
    const placaParam = params.get('placa');
    if (placaParam) {
      setFiltroPlaca(placaParam.toUpperCase());
      filtrarPorPlaca(placaParam.toUpperCase());
    } else {
      fetchOSs(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchOSs(p = 1) {
    try {
      const res = await fetch(`/api/ordem_servico/getOSs?page=${p}`);
      const data = await res.json();
      setOss(data.oss || []);
      setPage(data.page || 1);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Erro ao buscar OSs:', err);
      setOss([]);
      setPage(1);
      setTotalPages(1);
    }
  }

  async function filtrarPorPlaca(placaValue) {
    const placa = placaValue || filtroPlaca;
    if (!placa) {
      fetchOSs(1);
      return;
    }
    try {
      const res = await fetch(`/api/ordem_servico/getOSByPlaca/${placa}`);
      const data = await res.json();
      setOss(Array.isArray(data) ? data : []);
      setPage(1);
      setTotalPages(1);
    } catch (err) {
      console.error('Erro ao filtrar por placa:', err);
      setOss([]);
    }
  }

  async function filtrarPorCliente() {
    const nome = filtroCliente;
    if (!nome) {
      fetchOSs(1);
      return;
    }
    try {
      const res = await fetch(`/api/ordem_servico/getOSByNomeCliente/${nome}`);
      const data = await res.json();
      setOss(Array.isArray(data) ? data : []);
      setPage(1);
      setTotalPages(1);
    } catch (err) {
      console.error('Erro ao filtrar por cliente:', err);
      setOss([]);
    }
  }

  function handleDetalhes(id) {
    navigate(`/ordem_servico/${id}`);
  }

  function formatarData(dateStr) {
    if (!dateStr || typeof dateStr !== "string" || dateStr.length < 10) return "--/--/----";
    // Esperando formato YYYY-MM-DD
    return `${dateStr.slice(8,10)}/${dateStr.slice(5,7)}/${dateStr.slice(0,4)}`;
  }

  function formatarValor(valor) {
    if (valor === null || valor === undefined || isNaN(valor)) return "0,00";
    return Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md mt-4">
      <h4 className="text-xl font-bold mb-4">Pesquisa de Ordens de Serviço</h4>

      {/* filtros */}
      <div className="flex space-x-4 mb-4 items-end">
        <div>
          <label className="block text-sm">Placa</label>
          <input
            type="text"
            value={filtroPlaca}
            onChange={e => setFiltroPlaca(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && filtrarPorPlaca()}
            className="border p-2 rounded w-40"
            placeholder="EX: ABC1234"
            autoComplete="off"
          />
        </div>
        <div>
          <label className="block text-sm">Cliente</label>
          <input
            type="text"
            value={filtroCliente}
            onChange={e => setFiltroCliente(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && filtrarPorCliente()}
            className="border p-2 rounded w-48"
            placeholder="Nome do cliente..."
            autoComplete="off"
          />
        </div>
        <button
          onClick={() => {
            setFiltroPlaca('');
            setFiltroCliente('');
            fetchOSs(1);
          }}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer"
        >
          Limpar
        </button>
      </div>

      {/* tabela */}
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-100">
            {['ID', 'DATA', 'PLACA', 'CLIENTE', 'VALOR', 'STATUS', 'OPÇÕES'].map(th => (
              <th key={th} className="border p-2 text-left">{th}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {oss.length > 0 ? oss.map(os => (
            <tr key={os.id_os || Math.random()} className="hover:bg-gray-50">
              <td className="border p-2">{os.id_os ?? "--"}</td>
              <td className="border p-2">{formatarData(os.data)}</td>
              <td className="border p-2">{os.placa ?? "--"}</td>
              <td className="border p-2">{os.nome ?? "--"}</td>
              <td className="border p-2">{<NumericFormat value={os.valor_os} displayType="text" thousandSeparator="." decimalSeparator="," decimalScale={2} fixedDecimalScale allowNegative={false} prefix="R$ " readOnly />}</td>
              <td className="border p-2">{os.status_os ?? "--"}</td>
              <td className="border p-2">
                <button
                  onClick={() => handleDetalhes(os.id_os)}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
                  disabled={!os.id_os}
                >
                  Abrir
                </button>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan={7} className="border p-2 text-center">Nenhuma OS encontrada.</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* paginação */}
      <div className="flex justify-center items-center space-x-4 mt-4">
        <button
          disabled={page <= 1}
          onClick={() => fetchOSs(page - 1)}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 cursor-pointer"
        >
          Anterior
        </button>
        <span>{page} / {totalPages}</span>
        <button
          disabled={page >= totalPages}
          onClick={() => fetchOSs(page + 1)}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 cursor-pointer"
        >
          Próximo
        </button>
      </div>
    </div>
  );
}
