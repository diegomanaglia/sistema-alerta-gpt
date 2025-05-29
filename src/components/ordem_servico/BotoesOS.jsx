// src/components/ordem_servico/BotoesOS.jsx
import React from "react";

export default function BotoesOS({
  mostraVoltar = true,
  mostraFinalizar = false,
  onVoltar,
  onFinalizar,
  mostraDanfe = false,
  onEmitirDanfe,
  mostraCancelar = false,
  onCancelar,
  mostraClonar = false,
  onClonar,
}) {
  return (
    <div className="flex justify-end mt-4 space-x-2">
      {mostraVoltar && (
        <button
          onClick={onVoltar}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >Voltar</button>
      )}
      {mostraFinalizar && (
        <button
          onClick={onFinalizar}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >Finalizar OS</button>
      )}
      {mostraDanfe && (
        <button
          onClick={onEmitirDanfe}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >Emitir DANFe</button>
      )}
      {mostraCancelar && (
        <button
          onClick={onCancelar}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >Cancelar OS</button>
      )}
      {mostraClonar && (
        <button
          onClick={onClonar}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >Clonar OS</button>
      )}
    </div>
  );
}
