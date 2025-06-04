import React from "react";

// Props: status, data, formaPagamento, veiculo, cliente
export default function ResumoOS({ status, data, formaPagamento, veiculo, cliente }) {
    console.log("Veículo no ResumoOS:", veiculo);
    console.log("Cliente no ResumoOS:", cliente);
  return (
    <div className="mb-4 p-4 rounded bg-gray-100 flex flex-col md:flex-row justify-between">
      <div className="mb-2 md:mb-0">
        <p>
          <span className="font-bold">Status:</span> {status || "--"}
        </p>
        <p>
          <span className="font-bold">Data:</span> {data || "--/--/----"}
        </p>
        {formaPagamento && (
          <p>
            <span className="font-bold">Pagamento:</span> {formaPagamento}
          </p>
        )}
      </div>
      {veiculo && (
        <div className="mb-2 md:mb-0">
          <p>
            <span className="font-bold">Placa:</span> {veiculo.placa}
          </p>
          <p>
            <span className="font-bold">Marca:</span> {veiculo.marca_veiculo || ""}
          </p>
          <p>
            <span className="font-bold">Modelo:</span> {veiculo.modelo_veiculo || ""}
          </p>
        </div>
      )}
      {cliente && (
        <div>
          <p>
            <span className="font-bold">Cliente:</span> {cliente.nome}
          </p>
          <p>
            <span className="font-bold">Telefone:</span> {cliente.telefone || ""}
          </p>
        </div>
      )}
    </div>
  );
}
