// src/components/ordem_servico/CampoObservacoesOS.jsx
import React, { useState } from "react";

export default function CampoObservacoesOS({ obs, onChange, podeEditar }) {
  const [aberto, setAberto] = useState(false);

  return (
    <div className="mt-4 mb-2 bg-gray-100 rounded-xl px-4 py-2">
      <button
        type="button"
        onClick={() => setAberto(open => !open)}
        className="flex items-center gap-2 font-bold focus:outline-none select-none"
      >
        Observações
        <span className="text-lg">
          {aberto ? "▲" : "▼"}
        </span>
      </button>
      {aberto && (
        podeEditar ? (
          <textarea
            value={obs}
            onChange={e => onChange(e.target.value)}
            className="mt-3 w-full rounded-lg border p-3 bg-white"
            rows={4}
            placeholder="Digite observações..."
          />
        ) : (
          <div className="mt-3 bg-gray-50 rounded p-3 min-h-[32px]">{obs || "Nenhuma."}</div>
        )
      )}
    </div>
  );
}
