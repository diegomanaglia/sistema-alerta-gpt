import React, { useState, useEffect } from 'react';

export default function CadastroVeiculo({ source }) {
  // Campos do formulário
  const [placa, setPlaca] = useState('');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [ano, setAno] = useState('');
  const [cor, setCor] = useState('');
  const [tipoComb, setTipoComb] = useState('');
  const [motorizacao, setMotorizacao] = useState('');
  const [categoria, setCategoria] = useState('');
  const [clienteSelecionado, setClienteSelecionado] = useState(null);

  // Listas dinâmicas
  const [marcas, setMarcas] = useState([]);
  const [modelos, setModelos] = useState([]);

  // Captura params da URL (placa e source)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const placaUrl = params.get('placa');
    const src = params.get('source');
    if (placaUrl && src === 'os') {
      setPlaca(placaUrl);
    }
  }, []);

  // Carrega marcas ao montar componente
  useEffect(() => {
    async function carregarMarcas() {
      const res = await fetch('/api/veiculos/getMarcasVeiculos');
      if (res.ok) setMarcas(await res.json());
    }
    carregarMarcas();
  }, []);

  // Quando marca muda, carrega modelos
  useEffect(() => {
    if (!marca) return;
    async function carregarModelos() {
      const res = await fetch(`/api/veiculos/getModelosVeiculosByMarca/${marca}`);
      if (res.ok) setModelos(await res.json());
    }
    carregarModelos();
  }, [marca]);

  // Função de submissão
  async function handleSubmit() {
    if (!placa || !marca || !modelo || !ano || !cor || !tipoComb || !motorizacao || !categoria) {
      alert('Por favor, insira todos os campos.');
      return;
    }
    const dados = {
      placa: placa.toUpperCase(),
      marca,
      modelo,
      ano,
      cor: cor.toUpperCase(),
      tipo_comb: tipoComb,
      motorizacao: motorizacao.toUpperCase(),
      categoria_veiculo: categoria,
      id_cliente: clienteSelecionado
    };
    try {
      const res = await fetch('/veiculos/criarVeiculo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
      });
      if (!res.ok) throw new Error('Erro ' + res.status);
      alert('Veículo criado com sucesso.');
      const redirect = source === 'os' ? `/ordem_servico?placa=${placa}` : `/veiculos?placa=${placa}`;
      window.location.href = redirect;
    } catch (err) {
      console.error(err);
      alert('Falha ao criar veículo.');
    }
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h4 className="text-xl font-bold mb-4">Cadastro de veículo</h4>
      <div className="space-y-4">
        {/* Linha 1 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="placa" className="block text-sm font-medium">PLACA</label>
            <input
              id="placa"
              type="text"
              value={placa}
              onChange={e => setPlaca(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded p-2"
            />
          </div>
          <div>
            <label htmlFor="marca" className="block text-sm font-medium">MARCA</label>
            <select
              id="marca"
              value={marca}
              onChange={e => setMarca(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded p-2"
            >
              <option value="">Selecionar</option>
              {marcas.map(m => (
                <option key={m.id_marca_veiculo} value={m.id_marca_veiculo}>
                  {m.marca_veiculo}
                </option>
              ))}
            </select>
          </div>
        </div>
        {/* Linha 2 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="modelo" className="block text-sm font-medium">MODELO</label>
            <select
              id="modelo"
              value={modelo}
              onChange={e => setModelo(e.target.value)}
              disabled={!marca}
              className="mt-1 block w-full border border-gray-300 rounded p-2 bg-gray-50"
            >
              <option value="">Selecionar</option>
              {modelos.map(mo => (
                <option key={mo.id_modelo_veiculo} value={mo.id_modelo_veiculo}>
                  {mo.modelo_veiculo}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="ano" className="block text-sm font-medium">ANO</label>
            <input
              id="ano"
              type="number"
              value={ano}
              onChange={e => setAno(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded p-2"
            />
          </div>
        </div>
        {/* Linha 3 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="cor" className="block text-sm font-medium">COR</label>
            <input
              id="cor"
              type="text"
              value={cor}
              onChange={e => setCor(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded p-2"
            />
          </div>
          <div>
            <label htmlFor="tipoComb" className="block text-sm font-medium">TIPO DE COMB.</label>
            <select
              id="tipoComb"
              value={tipoComb}
              onChange={e => setTipoComb(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded p-2"
            >
              <option value="">Selecionar</option>
              <option value="FLEX">FLEX</option>
              <option value="DIESEL">DIESEL</option>
              <option value="GASOLINA">GASOLINA</option>
              <option value="ETANOL">ETANOL</option>
            </select>
          </div>
        </div>
        {/* Linha 4 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="motorizacao" className="block text-sm font-medium">MOTORIZAÇÃO</label>
            <input
              id="motorizacao"
              type="text"
              value={motorizacao}
              onChange={e => setMotorizacao(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded p-2"
            />
          </div>
          <div>
            <label htmlFor="categoria" className="block text-sm font-medium">CATEGORIA</label>
            <select
              id="categoria"
              value={categoria}
              onChange={e => setCategoria(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded p-2"
            >
              <option value="">Selecionar</option>
              <option value="CARRO DE PASSEIO">CARRO DE PASSEIO</option>
              <option value="UTILITÁRIO">UTILITÁRIO</option>
              <option value="VAN">VAN</option>
              <option value="CAMINHÃO">CAMINHÃO</option>
            </select>
          </div>
        </div>
        {/* Cliente vinculado */}
        <div className="flex items-center justify-between mt-4">
          <p className="font-semibold">
            <span className="font-bold">CLIENTE:</span> {clienteSelecionado ? clienteSelecionado.nome : 'Nenhum cliente selecionado.'}
          </p>
          <button
            onClick={() => {/* Lógica de modal para selecionar cliente */}}
            className="flex items-center px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            <span className="material-symbols-outlined mr-1">person</span>
            Vincular Cliente
          </button>
        </div>
        {/* Botões de ação */}
        <div className="mt-6 flex space-x-4">
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}
