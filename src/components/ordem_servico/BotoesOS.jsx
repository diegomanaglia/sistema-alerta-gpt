import React from "react";

export default function BotoesOS({
    mostraVoltar,
    mostraFinalizar,
    mostraEmitirNF,
    mostraCancelar,
    mostraClonar,
    onVoltar,
    onFinalizar,
    onEmitirNF,
    onCancelar,
    onClonar
}) {
    return (
        <div className="flex justify-end gap-2 mt-4">
            {mostraVoltar && (
                <button
                    onClick={onVoltar}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                    Voltar
                </button>
            )}
            {mostraEmitirNF && (
                <button
                    onClick={onEmitirNF}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Emitir NF
                </button>
            )}
            {mostraCancelar && (
                <button
                    onClick={onCancelar}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                    Cancelar OS
                </button>
            )}
            {mostraFinalizar && (
                <button
                    onClick={onFinalizar}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                    Finalizar OS
                </button>
            )}
            {mostraClonar && (
                <button
                    onClick={onClonar}
                    className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                >
                    Clonar OS
                </button>
            )}

        </div>
    );
}
