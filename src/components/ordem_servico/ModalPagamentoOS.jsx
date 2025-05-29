// src/components/ordem_servico/ModalPagamentoOS.jsx
import React from "react";

export default function ModalPagamentoOS({
  open,
  formaPagamento,
  setFormaPagamento,
  onFechar,
  onConfirmar,
  carregando = false, // para futuro: loading enquanto processa fechamento
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-xs shadow-lg flex flex-col items-center">
        <h2 className="font-bold text-lg mb-4">Escolha a forma de pagamento</h2>
        <select
          className="w-full border p-2 rounded mb-4"
          value={formaPagamento}
          onChange={e => setFormaPagamento(e.target.value)}
        >
          <option value="" disabled>Selecione</option>
          <option value="DINHEIRO">Dinheiro</option>
          <option value="PIX">PIX</option>
          <option value="CARTÃO DÉBITO">Cartão Débito</option>
          <option value="CARTÃO CRÉDITO">Cartão Crédito</option>
          <option value="FATURADO">Faturado</option>
          <option value="FIADO">Fiado</option>
        </select>

        <div className="flex gap-3 w-full">
          <button
            className="flex-1 py-2 bg-gray-200 rounded hover:bg-gray-300"
            onClick={onFechar}
            disabled={carregando}
          >
            Cancelar
          </button>
          <button
            className={`flex-1 py-2 rounded text-white 
              ${formaPagamento
                ? "bg-green-600 hover:bg-green-700"
                : "bg-green-400 cursor-not-allowed"
              }`}
            disabled={!formaPagamento || carregando}
            onClick={onConfirmar}
          >
            {carregando ? "Fechando..." : "Fechar OS"}
          </button>
        </div>
      </div>
    </div>
  );
}
