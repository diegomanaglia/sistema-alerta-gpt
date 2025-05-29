// src/components/ordem_servico/CampoValorTotalOS.jsx
import React from "react";
import { NumericFormat } from 'react-number-format';

export default function CampoValorTotalOS({ valorTotal }) {
  return (
    <div className="space-x-2 flex items-center">
      <label className="font-bold">Valor Total:</label>
      <span className="font-bold">
        <NumericFormat
          value={valorTotal}
          displayType="text"
          thousandSeparator="."
          decimalSeparator=","
          decimalScale={2}
          fixedDecimalScale
          prefix="R$ "
        />
      </span>
    </div>
  );
}
