// src/components/ordem_servico/TabelaProdutosOS.jsx
import React from "react";
import { NumericFormat } from 'react-number-format';

export default function TabelaProdutosOS({
  itens = [],
  podeEditar = false,
  podeAdicionarItem = false,
  podeRemoverItem = false,
  onAdicionarItem,
  onRemoverItem,
  onAtualizarItem,
  buscarProdutoPorSku,
}) {
  return (
    <div className="mb-4">
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">CÓDIGO</th>
            <th className="border p-2">DESCRIÇÃO</th>
            <th className="border p-2">QTD</th>
            <th className="border p-2">VALOR</th>
            <th className="border p-2">TOTAL</th>
            {podeRemoverItem && <th className="border p-2"></th>}
          </tr>
        </thead>
        <tbody>
          {Array.isArray(itens) && itens.length > 0
            ? itens.map((item, i) => (
                <tr key={i}>
                  <td className="border p-1">
                    {podeEditar ? (
                      <input
                        type="text"
                        value={item.sku}
                        onChange={e => onAtualizarItem(i, 'sku', e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === 'Tab') {
                            e.preventDefault();
                            buscarProdutoPorSku(i, e.target.value);
                          }
                        }}
                        className="w-full uppercase"
                      />
                    ) : (
                      <span>{item.sku}</span>
                    )}
                  </td>
                  <td className="border p-1">
                    {podeEditar ? (
                      <input
                        type="text"
                        value={item.descricao}
                        readOnly
                        className="w-full bg-gray-100"
                      />
                    ) : (
                      <span>{item.descricao}</span>
                    )}
                  </td>
                  <td className="border p-1">
                    {podeEditar ? (
                      <input
                        type="number"
                        value={item.qtd}
                        min={1}
                        onChange={e => onAtualizarItem(i, 'qtd', Number(e.target.value))}
                        className="w-16 text-right"
                      />
                    ) : (
                      <span>{item.qtd}</span>
                    )}
                  </td>
                  <td className="border p-1">
                    <NumericFormat
                      value={item.valor}
                      displayType={podeEditar ? "input" : "text"}
                      thousandSeparator="."
                      decimalSeparator=","
                      decimalScale={2}
                      fixedDecimalScale
                      allowNegative={false}
                      prefix="R$ "
                      readOnly
                      className="w-24 bg-gray-100 text-right"
                    />
                  </td>
                  <td className="border p-1">
                    <NumericFormat
                      value={item.total}
                      displayType={podeEditar ? "input" : "text"}
                      thousandSeparator="."
                      decimalSeparator=","
                      decimalScale={2}
                      fixedDecimalScale
                      allowNegative={false}
                      prefix="R$ "
                      readOnly
                      className="w-24 bg-gray-100 text-right"
                    />
                  </td>
                  {podeRemoverItem && (
                    <td className="border p-1 text-center">
                      <button
                        onClick={() => onRemoverItem(i)}
                        className="text-red-600 hover:underline"
                        tabIndex={-1}
                      >
                        ✕
                      </button>
                    </td>
                  )}
                </tr>
              ))
            : (
                <tr>
                  <td colSpan={podeRemoverItem ? 6 : 5} className="border p-2 text-center">
                    Nenhum produto cadastrado.
                  </td>
                </tr>
              )
          }
        </tbody>
      </table>

      {podeAdicionarItem && (
        <div className="flex justify-end">
          <button
            onClick={onAdicionarItem}
            className="px-3 py-1 bg-blue-200 rounded hover:bg-blue-300"
          >+ Item</button>
        </div>
      )}
    </div>
  );
}
