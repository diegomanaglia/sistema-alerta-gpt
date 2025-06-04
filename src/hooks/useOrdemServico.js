import { useState, useEffect, useRef } from "react";
import useVeiculoPorPlaca from "./useVeiculoPorPlaca";
import { useProdutosOS } from "./useProdutosOS";
import { calcularTotal, statusDescricao as getStatusDescricao } from "../utils/ordemServicoUtils";

// Opcional: Defina o item vazio em um arquivo de constantes
const ITEM_VAZIO = { sku: '', descricao: '', qtd: 1, valor: 0, total: 0, produtoId: null };

export function useOrdemServico(id, placaParam = "") {
    // Veículo e cliente (hook)
    const {
        veiculo,
        setVeiculo,
        placa,
        setPlaca,
        naoEncontrado,
        buscarVeiculo,
        onPlacaChange,
        resetVeiculo,
        setNaoEncontrado
    } = useVeiculoPorPlaca(placaParam);

    // Itens/produtos (hook)
    const {
        itens,
        setItens,
        adicionarItem,
        removerItem,
        atualizarItem,
        buscarProdutoPorSku
    } = useProdutosOS();

    // Demais estados
    const [os, setOs] = useState(null);
    const [cliente, setCliente] = useState(null);
    const [modoCadastroVeiculo, setModoCadastroVeiculo] = useState(false);
    const [emCriacaoOS, setEmCriacaoOS] = useState(false);
    const [osId, setOsId] = useState(null);
    const [desconto, setDesconto] = useState(0);
    const [obs, setObs] = useState('');
    const [status, setStatus] = useState('');
    const [loadingProdutos, setLoadingProdutos] = useState(false);
    const [modalPagamento, setModalPagamento] = useState(false);
    const [formaPagamento, setFormaPagamento] = useState('');
    const isFirstRender = useRef(true);

    // Flags
    const emAndamento = emCriacaoOS || status === "EM ANDAMENTO";
    const fechada = status === "FECHADA";
    const cancelada = status === "CANCELADA";

    // ----------- Carregar OS (edição) -----------
    useEffect(() => {
        if (id) carregarOS(id);
        // eslint-disable-next-line
    }, [id]);

    async function carregarOS(osId) {
        setLoadingProdutos(true);
        try {
            const res = await fetch(`/api/ordem_servico/getOSById/${osId}`);
            if (!res.ok) throw new Error('Erro ao buscar OS');
            const data = await res.json();
            setOs(data);
            setVeiculo({
                placa: data.placa,
                marca_veiculo: data.marca_veiculo,
                modelo_veiculo: data.modelo_veiculo,
            });
            setCliente({
                nome: data.nome,
                telefone: data.telefone1 || data.whatsapp || data.celular || '',
            });
            setDesconto(Number(data.desconto) || 0);
            setObs(data.obs || '');
            setStatus(data.status_os || data.status || '');
            setOsId(data.id_os);

            let produtos = [];
            if (typeof data.produtos === 'string' && data.produtos.length > 0) {
                try { produtos = JSON.parse(data.produtos); } catch { produtos = []; }
            } else if (Array.isArray(data.produtos)) {
                produtos = data.produtos;
            }

            let itensDetalhados = [];
            if (produtos.length > 0) {
                itensDetalhados = await Promise.all(
                    produtos.map(async p => {
                        const resp = await fetch(`/api/produtos/getUmProduto/${p.id}`);
                        const prod = resp.ok ? await resp.json() : {};
                        return {
                            sku: prod.sku || '',
                            descricao: prod.descricao || '',
                            qtd: Number(p.qtd),
                            valor: Number(p.valor_unitario),
                            total: Number(p.qtd) * Number(p.valor_unitario),
                            produtoId: p.id
                        };
                    })
                );
            }

            if ((data.status_os === "EM ANDAMENTO" || data.status === "EM ANDAMENTO") && itensDetalhados.length === 0) {
                setItens([ITEM_VAZIO]);
            } else {
                setItens(itensDetalhados);
            }
        } catch (err) {
            alert("Erro ao carregar OS.");
            setOs(null);
            setItens([ITEM_VAZIO]);
        } finally {
            setLoadingProdutos(false);
        }
    }

    // ----------- Busca veículo por placa (automatizada ao digitar placa) -----------
    useEffect(() => {
        // só faz a busca de veículo se NÃO estivermos criando uma nova OS
        if (!id && !emCriacaoOS && placa.length === 7) {
            buscarVeiculo(placa);
        }
        // eslint-disable-next-line
    }, [placa, id, emCriacaoOS]);


    function abrirCadastroVeiculo() { setModoCadastroVeiculo(true); }
    function onVeiculoCriado(novoVeiculo) {
        setModoCadastroVeiculo(false);
        setPlaca(novoVeiculo.placa);
        setVeiculo(novoVeiculo);   // Aqui todos os dados do veículo já vêm do backend!
        setNaoEncontrado(false);

        setTimeout(() => {
            if (window.confirm(`Deseja abrir uma nova Ordem de Serviço para o veículo ${novoVeiculo.placa}?`)) {
                iniciarOS(novoVeiculo);
            }
        }, 100);
    }

    // ----------- Nova OS (criação) -----------
    function iniciarOS(veiculoParam) {
        setEmCriacaoOS(true);
        setItens([ITEM_VAZIO]);
        criarOS(veiculoParam || veiculo);
    }

    async function criarOS(veiculoParam) {
        const veic = veiculoParam || veiculo;
        const hoje = new Date().toISOString().slice(0, 10);
        const payload = {
            data: hoje,
            id_veiculo: veic.id_veiculo, // aqui nunca vai ser undefined
            id_cliente: veic.id_cliente || veic.id_cliente_veiculo,
            obs: '',
            valor_os: 0,
            status: 'EM ANDAMENTO'
        };
        const res = await fetch('/api/ordem_servico/criarOS', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const json = await res.json();
        setOsId(json.insertId);
    }


    // ----------- Salvamento automático -----------
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        if (!osId || loadingProdutos) return;

        salvarAutomatico();
        // eslint-disable-next-line
    }, [itens, desconto, obs, osId, loadingProdutos]);

    async function salvarAutomatico() {
        try {
            const inputs = itens
                .filter(i => i.produtoId && i.qtd)
                .map(i => ({
                    id: i.produtoId,
                    qtd: i.qtd,
                    valor_unitario: i.valor
                }));

            const dados = {
                id: osId,
                listagem_produtos: JSON.stringify(inputs),
                valor_os: calcularTotal(itens, desconto),
                desconto,
                obs
            };

            await fetch(`/api/ordem_servico/salvarOS`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });
        } catch (error) {
            console.log(error);
        }
    }

    // ----------- Fechar OS (baixa estoque) -----------
    async function fecharOS(forma_pagamento) {
        try {
            const produtosParaSalvar = itens
                .filter(i => i.produtoId && i.qtd)
                .map(i => ({
                    id: i.produtoId,
                    qtd: i.qtd,
                    valor_unitario: i.valor
                }));

            // console.log("Produtos para salvar:", produtosParaSalvar);

            const dados_os = {
                id: osId,
                listagem_produtos: JSON.stringify(produtosParaSalvar),
                valor_os: calcularTotal(itens, desconto),
                desconto: desconto,
                status: "FECHADA",
                forma_pagamento: forma_pagamento,
                obs: obs
            };

            const resposta = await fetch("/api/ordem_servico/fecharOS", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados_os)
            });

            if (!resposta.ok) {
                alert("Erro ao fechar OS.");
                throw new Error('Falha ao enviar a requisição: ' + resposta.status);
            } else {
                // Baixa no estoque
                for (const produto of produtosParaSalvar) {
                    try {
                        // console.log(`Baixando estoque do produto ${produto.id} com quantidade ${produto.qtd}`);
                        const baixaRes = await fetch(`/api/ordem_servico/baixaEstoque`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ id: produto.id, qtd: produto.qtd })
                        });
                        if (!baixaRes.ok) {
                            console.error(`Erro ao baixar estoque do produto ${produto.id}:`, baixaRes.statusText);
                        }
                    } catch (err) {
                        console.error(`Erro inesperado ao baixar estoque do produto ${produto.id}:`, err);
                    }
                }

                setStatus("FECHADA");

                setOs(prev => ({
                    ...prev,
                    status_os: "FECHADA",
                    forma_pagamento
                }));

                alert("A OS foi fechada com sucesso.");
            }
        } catch (error) {
            alert("Erro ao fechar OS.");
            console.error('Erro:', error);
        }
    }

    // ----------- Cancelar OS (reposição do estoque) -----------
    async function cancelarOS() {
        // Confirmação
        if (!window.confirm("Você tem certeza de que deseja CANCELAR a Ordem de Serviço?")) return;

        // Pega o status da OS
        const statusAtual = status; // do state
        const id = osId;            // do state

        // Se OS estiver FECHADA, repõe o estoque
        if (statusAtual === "FECHADA") {
            try {
                const response = await fetch(`/api/ordem_servico/getOSById/${id}`);
                if (!response.ok) throw new Error("Erro ao buscar OS");
                const dadosOS = await response.json();

                let produtos = [];
                if (typeof dadosOS.produtos === 'string' && dadosOS.produtos.length > 0) {
                    produtos = JSON.parse(dadosOS.produtos);
                } else if (Array.isArray(dadosOS.produtos)) {
                    produtos = dadosOS.produtos;
                }

                for (const produto of produtos) {
                    // Busca quantidade atual
                    const respostaProd = await fetch(`/api/produtos/getUmProduto/${produto.id}`);
                    if (!respostaProd.ok) throw new Error("Erro ao buscar produto");
                    const dadosProduto = await respostaProd.json();

                    const nova_qtd = parseFloat(dadosProduto.qtd_estoque) + parseFloat(produto.qtd);

                    const dados = {
                        id: produto.id,
                        nova_qtd
                    };

                    await fetch("/api/ordem_servico/reporEstoque", {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(dados)
                    });
                }
            } catch (err) {
                alert("Erro ao repor estoque. Tente novamente.");
                console.error(err);
                return;
            }
        }

        // Atualiza status da OS para CANCELADA
        try {
            const res = await fetch(`/api/ordem_servico/cancelarOS/${id}`);
            if (!res.ok) throw new Error('Erro ao cancelar OS');
            alert("A OS foi cancelada com sucesso!");
            // Atualiza status no front também
            setStatus("CANCELADA");
            setOs(prev => ({
                ...prev,
                status_os: "CANCELADA"
            }));
        } catch (error) {
            alert("Erro ao cancelar OS.");
            console.error(error);
        }
    }


    // ----------- Emitir NF -----------
    function emitirNotaFiscal(osId) {
        alert('Função de emitir NF ainda não implementada');
        // ou abre modal, etc
    }

    // ----------- Clonar OS -----------
    async function clonarOS(osIdParaClonar) {
        // Confirmação opcional
        if (!window.confirm("Deseja realmente clonar esta OS?")) return;

        try {
            // 1. Busca os dados da OS original
            const res = await fetch(`/api/ordem_servico/getOSById/${osIdParaClonar}`);
            if (!res.ok) throw new Error("Erro ao buscar OS original.");
            const dadosOS = await res.json();

            // 2. Pega o veículo e a lista de produtos
            const veiculoId = dadosOS.id_veiculo;
            const clienteId = dadosOS.id_cliente;
            let produtos = [];
            if (typeof dadosOS.produtos === 'string' && dadosOS.produtos.length > 0) {
                produtos = JSON.parse(dadosOS.produtos);
            } else if (Array.isArray(dadosOS.produtos)) {
                produtos = dadosOS.produtos;
            }

            // 3. Para cada produto, busca o preço ATUAL no banco
            const produtosAtualizados = await Promise.all(
                produtos.map(async prod => {
                    const resProd = await fetch(`/api/produtos/getUmProduto/${prod.id}`);
                    const infoProd = resProd.ok ? await resProd.json() : {};
                    return {
                        id: prod.id,
                        sku: infoProd.sku || "",
                        descricao: infoProd.descricao || "",
                        qtd: prod.qtd,
                        valor: parseFloat(infoProd.valor_venda) || 0,
                        total: prod.qtd * (parseFloat(infoProd.valor_venda) || 0),
                        produtoId: prod.id
                    };
                })
            );

            // 4. Cria a nova OS com os dados coletados (status EM ANDAMENTO, data atual)
            const hoje = new Date().toISOString().slice(0, 10);
            const payload = {
                data: hoje,
                id_veiculo: veiculoId,
                id_cliente: clienteId,
                obs: dadosOS.obs || '',
                valor_os: produtosAtualizados.reduce((acc, p) => acc + p.total, 0),
                status: 'EM ANDAMENTO'
            };
            const resNovaOS = await fetch('/api/ordem_servico/criarOS', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!resNovaOS.ok) throw new Error("Erro ao criar nova OS clonada");
            const { insertId } = await resNovaOS.json();

            // 5. Salva os produtos na nova OS
            // Obs: aqui, o backend espera o mesmo payload do salvamento automático
            await fetch('/api/ordem_servico/salvarOS', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: insertId,
                    listagem_produtos: JSON.stringify(
                        produtosAtualizados.map(p => ({
                            id: p.produtoId,
                            qtd: p.qtd,
                            valor_unitario: p.valor
                        }))
                    ),
                    valor_os: produtosAtualizados.reduce((acc, p) => acc + p.total, 0),
                    desconto: 0,
                    obs: dadosOS.obs || ''
                })
            });

            // 6. Redireciona para a tela de edição da nova OS
            alert('OS clonada com sucesso!');
            window.location.href = `/ordem_servico/${insertId}`;

        } catch (err) {
            alert('Erro ao clonar OS. Detalhe: ' + err.message);
            console.error(err);
        }
    }


    // ----------- Helpers -----------
    function statusDescricao() {
        return getStatusDescricao({ emAndamento, fechada, cancelada });
    }

    // ----------- Flags agrupadas -----------
    const flags = {
        podeEditar: emAndamento,
        podeAdicionarItem: emAndamento,
        podeRemoverItem: emAndamento,
        podeEditarDesconto: emAndamento,
        podeEditarObs: emAndamento,
        mostraFinalizar: emAndamento && !emCriacaoOS,
        mostraVoltar: true,
        fechada,
        cancelada,
        emAndamento,
        mostraClonar: cancelada || fechada,
    };

    // Retorna tudo que a tela principal precisa
    return {
        os, veiculo, setVeiculo, setNaoEncontrado, cliente, setCliente, itens, setItens, desconto, setDesconto,
        obs, setObs, status, setStatus, osId, placa, setPlaca, naoEncontrado,
        modoCadastroVeiculo, setModoCadastroVeiculo, emCriacaoOS, setEmCriacaoOS,
        loadingProdutos, setLoadingProdutos, modalPagamento, setModalPagamento,
        formaPagamento, setFormaPagamento,
        onPlacaChange, abrirCadastroVeiculo, onVeiculoCriado,
        iniciarOS, criarOS, fecharOS, cancelarOS, clonarOS, emitirNotaFiscal, buscarProdutoPorSku,
        adicionarItem, removerItem, atualizarItem,
        calcularTotal: () => calcularTotal(itens, desconto),
        statusDescricao, flags, buscarVeiculo, resetVeiculo
    };
}
