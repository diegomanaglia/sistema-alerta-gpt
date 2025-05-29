// src/components/ordem_servico/CampoDescontoOS.jsx
import React from "react";
import { NumericFormat } from 'react-number-format';

export default function CampoDescontoOS({ desconto, onChange, podeEditar }) {
  return (
    <div className="space-x-2 flex items-center">
      <label className="font-bold">Desconto:</label>
      {podeEditar ? (
        <NumericFormat
          value={desconto}
          onValueChange={values => onChange(values.floatValue || 0)}
          decimalScale={2}
          fixedDecimalScale
          decimalSeparator=","
          thousandSeparator="."
          allowNegative={false}
          prefix="R$ "
          className="w-20 border p-1 rounded"
          placeholder="0,00"
        />
      ) : (
        <span>
          <NumericFormat
            value={desconto}
            displayType="text"
            thousandSeparator="."
            decimalSeparator=","
            decimalScale={2}
            fixedDecimalScale
            prefix="R$ "
          />
        </span>
      )}
    </div>
  );
}
