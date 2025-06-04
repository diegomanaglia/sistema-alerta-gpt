import { useState } from "react";

export default function useVeiculoPorPlaca(placaInicial = "") {
  const [veiculo, setVeiculo] = useState(null);
  const [placa, setPlaca] = useState(placaInicial.toUpperCase());
  const [naoEncontrado, setNaoEncontrado] = useState(false);

  async function buscarVeiculo(placaBusca) {
    const placaFinal = (placaBusca || placa).toUpperCase();
    if (!placaFinal || placaFinal.length !== 7) return;
    try {
      const res = await fetch(`/api/veiculos/getVeiculoUnico/${placaFinal}`);
      if (!res.ok) throw new Error("Não encontrado");
      const data = await res.json();
      if (data && data.placa) {
        setVeiculo(data);
        setNaoEncontrado(false);
      } else {
        setVeiculo(null);
        setNaoEncontrado(true);
      }
    } catch {
      setVeiculo(null);
      setNaoEncontrado(true);
    }
  }

  function onPlacaChange(e) {
    setPlaca(e.target.value.toUpperCase().slice(0, 7));
  }

  function resetVeiculo() {
    setVeiculo(null);
    setNaoEncontrado(false);
    setPlaca("");
  }

  return {
    veiculo,
    setVeiculo,
    placa,
    setPlaca,
    naoEncontrado,
    buscarVeiculo,
    onPlacaChange,
    resetVeiculo,
    setNaoEncontrado
  };
}
