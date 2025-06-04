// src/components/CadastroVeiculo.jsx
import React, { useState, useEffect } from 'react';

export default function CadastroVeiculo({ placaPadrao = "", veiculoId = null, onClose, onCreated }) {
    // Estados principais
    const [placa, setPlaca] = useState(placaPadrao.toUpperCase());
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

    // Estados para modal de busca de cliente
    const [buscaClienteOpen, setBuscaClienteOpen] = useState(false);
    const [termoBusca, setTermoBusca] = useState('');
    const [clientesResultados, setClientesResultados] = useState([]);
    const [clienteNaoEncontrado, setClienteNaoEncontrado] = useState(false);

    // Carrega marcas ao montar
    useEffect(() => {
        fetch('/api/veiculos/getMarcasVeiculos')
            .then(res => res.json())
            .then(data => setMarcas(data))
            .catch(console.error);
    }, []);

    // Carrega modelos quando marca muda
    useEffect(() => {
        if (!marca) return;
        fetch(`/api/veiculos/getModelosVeiculosByMarca/${marca}`)
            .then(res => res.json())
            .then(data => setModelos(data))
            .catch(console.error);
    }, [marca]);

    // Se for edição, busca dados do veículo
    useEffect(() => {
        if (!veiculoId) return;
        fetch(`/api/veiculos/getVeiculoById/${veiculoId}`)
            .then(res => res.json())
            .then(data => {
                setPlaca(data.placa || '');
                setMarca(data.id_marca_veiculo?.toString() || '');
                setModelo(data.id_modelo_veiculo?.toString() || '');
                setAno(data.ano?.toString() || '');
                setCor(data.cor || '');
                setTipoComb(data.tipo_comb || '');
                setMotorizacao(data.motorizacao || '');
                setCategoria(data.categoria_veiculo || '');
                setClienteSelecionado({ id: data.id_cliente_veiculo, nome: data.nome });
            })
            .catch(console.error);
    }, [veiculoId]);

    // Pesquisa clientes
    async function pesquisarClientes() {
        const termo = termoBusca.trim().toUpperCase();
        if (!termo) return;
        try {
            const res = await fetch(`/api/clientes/pesquisaClientes/${termo}`);
            if (res.status === 200) {
                const data = await res.json();
                if (data.length > 0) {
                    setClientesResultados(data);
                    setClienteNaoEncontrado(false);
                } else {
                    setClientesResultados([]);
                    setClienteNaoEncontrado(true);
                }
            } else {
                setClientesResultados([]);
                setClienteNaoEncontrado(true);
            }
        } catch (err) {
            console.error(err);
            setClientesResultados([]);
            setClienteNaoEncontrado(true);
        }
    }

    // Seleciona cliente
    function selecionarCliente(id, nome) {
        setClienteSelecionado({ id, nome });
        setBuscaClienteOpen(false);
        setTermoBusca('');
    }

    // Submissão (criar ou editar)
    async function handleSubmit() {
        if (!placa || !marca || !modelo || !ano || !cor || !tipoComb || !motorizacao || !categoria) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        try {
            if (veiculoId) {
                // Editar veículo
                const body = {
                    id_veiculo: veiculoId,
                    input_placa: placa.toUpperCase(),
                    input_marca: parseInt(marca),
                    input_modelo: parseInt(modelo),
                    input_ano: parseInt(ano),
                    input_cor: cor.toUpperCase(),
                    input_tipo_comb: tipoComb,
                    input_motorizacao: motorizacao.toUpperCase(),
                    input_categoria: categoria,
                    id_cliente: clienteSelecionado?.id || null
                };
                const res = await fetch('/api/veiculos/salvarEdicaoVeiculo', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
                if (!res.ok) throw new Error('Erro ' + res.status);
                alert('Veículo atualizado com sucesso.');
                if (typeof onClose === "function") onClose(); // Fecha o modal só após sucesso
            } else {
                // Criar novo veículo
                const body = {
                    placa: placa.toUpperCase(),
                    marca,
                    modelo,
                    ano,
                    cor: cor.toUpperCase(),
                    tipo_comb: tipoComb,
                    motorizacao: motorizacao.toUpperCase(),
                    categoria_veiculo: categoria,
                    id_cliente: clienteSelecionado?.id || null
                };
                const res = await fetch('/api/veiculos/criarVeiculo', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
                if (!res.ok) throw new Error('Erro ' + res.status);

                // **Aqui pegamos o objeto completo que o backend retornou** (conforme a query ajustada acima).
                const novoVeicCompleto = await res.json();
                console.log("VEÍCULO CRIADO (completo):", novoVeicCompleto);

                alert('Veículo cadastrado com sucesso.');

                // Chamamos onCreated, passando obrigatoriamente o objeto que veio do backend.
                if (typeof onCreated === "function") {
                    onCreated(novoVeicCompleto);
                }
                if (typeof onClose === "function") onClose();
            }
        } catch (error) {
            console.error(error);
            alert('Falha ao salvar veículo.');
            // NÃO fecha o modal se der erro
        }
    }




    return (
        <>
            {/* Modal principal */}
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-auto">
                    {/* Cabeçalho */}
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-xl font-bold">{veiculoId ? 'Editar Veículo' : 'Cadastrar Veículo'}</h4>
                        <button onClick={onClose} className="text-gray-600 hover:text-gray-800 cursor-pointer">✕</button>
                    </div>

                    <div className="space-y-4">
                        {/* Campos do formulário */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium">PLACA</label>
                                <input value={placa} onChange={e => setPlaca(e.target.value.toUpperCase())} className="mt-1 block w-full border rounded p-2 uppercase" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">MARCA</label>
                                <select value={marca} onChange={e => setMarca(e.target.value)} className="mt-1 block w-full border rounded p-2">
                                    <option value="">Selecionar</option>
                                    {marcas.map(m => <option key={m.id_marca_veiculo} value={m.id_marca_veiculo}>{m.marca_veiculo}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium">MODELO</label>
                                <select value={modelo} disabled={!marca} onChange={e => setModelo(e.target.value)} className="mt-1 block w-full border rounded p-2 disabled:opacity-50">
                                    <option value="">Selecionar</option>
                                    {modelos.map(mo => <option key={mo.id_modelo_veiculo} value={mo.id_modelo_veiculo}>{mo.modelo_veiculo}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium">ANO</label>
                                <input type="number" value={ano} onChange={e => setAno(e.target.value)} className="mt-1 block w-full border rounded p-2" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium">COR</label>
                                <input value={cor} onChange={e => setCor(e.target.value)} className="mt-1 block w-full border rounded p-2 uppercase" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">TIPO DE COMB.</label>
                                <select value={tipoComb} onChange={e => setTipoComb(e.target.value)} className="mt-1 block w-full border rounded p-2">
                                    <option value="">Selecionar</option>
                                    <option value="FLEX">FLEX</option>
                                    <option value="DIESEL">DIESEL</option>
                                    <option value="GASOLINA">GASOLINA</option>
                                    <option value="ETANOL">ETANOL</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium">MOTORIZAÇÃO</label>
                                <input value={motorizacao} onChange={e => setMotorizacao(e.target.value)} className="mt-1 block w-full border rounded p-2 uppercase" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">CATEGORIA</label>
                                <select value={categoria} onChange={e => setCategoria(e.target.value)} className="mt-1 block w-full border rounded p-2">
                                    <option value="">Selecionar</option>
                                    <option value="CARRO DE PASSEIO">CARRO DE PASSEIO</option>
                                    <option value="UTILITÁRIO">UTILITÁRIO</option>
                                    <option value="VAN">VAN</option>
                                    <option value="CAMINHÃO">CAMINHÃO</option>
                                </select>
                            </div>
                        </div>

                        {/* Vincular Cliente */}
                        <div className="flex items-center justify-between mt-4">
                            <p className="font-medium"><span className="font-bold">CLIENTE:</span> {clienteSelecionado?.nome || 'Nenhum cliente selecionado.'}</p>
                            <button onClick={() => setBuscaClienteOpen(true)} className="flex items-center px-3 py-1 bg-gray-200 rounded hover:bg-gray-300">
                                Vincular Cliente
                            </button>
                        </div>

                        {/* Ações */}
                        <div className="mt-6 flex space-x-4">
                            <button onClick={handleSubmit} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">{veiculoId ? 'Salvar' : 'Cadastrar'}
                                {veiculoId ? 'Salvar' : 'Cadastrar'}
                            </button>
                            <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancelar</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Busca Cliente */}
            {buscaClienteOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[80vh] overflow-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h5 className="text-lg font-bold">Pesquisar Cliente</h5>
                            <button onClick={() => setBuscaClienteOpen(false)} className="text-gray-600 hover:text-gray-800">✕</button>
                        </div>
                        <input
                            type="text"
                            placeholder="Nome, CPF ou CNPJ"
                            value={termoBusca}
                            onChange={e => setTermoBusca(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && pesquisarClientes()}
                            className="w-full border rounded p-2 mb-4 uppercase"
                        />
                        {clienteNaoEncontrado && <p className="text-red-600 mb-4">Nenhum cliente encontrado.</p>}
                        {clientesResultados.length > 0 && (
                            <table className="w-full table-auto border-collapse mb-4">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border p-2 text-left">Nome</th>
                                        <th className="border p-2 text-left">CPF/CNPJ</th>
                                        <th className="border p-2 text-left">Opção</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {clientesResultados.map(c => (
                                        <tr key={c.id_cliente} className="hover:bg-gray-50">
                                            <td className="border p-2">{c.nome}</td>
                                            <td className="border p-2">{c.cpf || c.cnpj}</td>
                                            <td className="border p-2">
                                                <button onClick={() => selecionarCliente(c.id_cliente, c.nome)} className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">Selecionar</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
