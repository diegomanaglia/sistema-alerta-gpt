import { useState } from "react";

export function useVeiculoOS(placaInicial = "") {
  const [veiculo, setVeiculo] = useState(null);
  const [placa, setPlaca] = useState(placaInicial);
  const [naoEncontrado, setNaoEncontrado] = useState(false);

  async function fetchVeiculo(p) {
    try {
      const res = await fetch(`/api/veiculos/getVeiculoUnico/${p}`);
      if (!res.ok) throw new Error('Não encontrado');
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

  return { veiculo, setVeiculo, placa, setPlaca, naoEncontrado, setNaoEncontrado, fetchVeiculo, onPlacaChange };
}
