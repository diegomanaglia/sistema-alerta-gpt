// src/hooks/useOrdemServico.js
import { useState, useEffect, useRef } from "react";
import useVeiculoPorPlaca from "./useVeiculoPorPlaca";
import { useProdutosOS } from "./useProdutosOS";
import { calcularTotal, statusDescricao as getStatusDescricao } from "../utils/ordemServicoUtils";

// Define um ITEM_VAZIO para quando não houver produto na OS
const ITEM_VAZIO = { sku: "", descricao: "", qtd: 1, valor: 0, total: 0, produtoId: null };

export function useOrdemServico(id, placaParam = "") {
    // -------------- hook “Veículo/Placa” --------------
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

    // -------------- hook “Itens/Produtos OS” --------------
    const {
        itens,
        setItens,
        adicionarItem,
        removerItem,
        atualizarItem,
        buscarProdutoPorSku
    } = useProdutosOS();

    // -------------- outros estados --------------
    const [os, setOs] = useState(null);
    const [cliente, setCliente] = useState(null);
    const [modoCadastroVeiculo, setModoCadastroVeiculo] = useState(false);
    const [emCriacaoOS, setEmCriacaoOS] = useState(false);
    const [osId, setOsId] = useState(null);
    const [desconto, setDesconto] = useState(0);
    const [obs, setObs] = useState("");
    const [status, setStatus] = useState("");
    const [loadingProdutos, setLoadingProdutos] = useState(false);
    const [modalPagamento, setModalPagamento] = useState(false);
    const [formaPagamento, setFormaPagamento] = useState("");
    const isFirstRender = useRef(true);

    // -------------- flags de status --------------
    const emAndamento = emCriacaoOS || status === "EM ANDAMENTO";
    const fechada = status === "FECHADA";
    const cancelada = status === "CANCELADA";

    // -------------- 1) carregar OS (edição) --------------
    useEffect(() => {
        if (id) {
            carregarOS(id);
        }
        // eslint-disable-next-line
    }, [id]);

    async function carregarOS(osIdBusca) {
        setLoadingProdutos(true);
        try {
            const res = await fetch(`/api/ordem_servico/getOSById/${osIdBusca}`);
            if (!res.ok) throw new Error("Erro ao buscar OS");
            const data = await res.json();
            setOs(data);

            // Preenche estado “veiculo” apenas com placa+marca+modelo
            setVeiculo({
                placa: data.placa,
                marca_veiculo: data.marca_veiculo,
                modelo_veiculo: data.modelo_veiculo,
                nome: data.nome,               // supondo que a API já retorne nome do cliente
                telefone: data.telefone1 || data.whatsapp || data.celular || ""
            });

            // Preenche estado “cliente”
            setCliente({
                nome: data.nome,
                telefone: data.telefone1 || data.whatsapp || data.celular || ""
            });

            setDesconto(Number(data.desconto) || 0);
            setObs(data.obs || "");
            setStatus(data.status_os || data.status || "");
            setOsId(data.id_os);

            // Monta a lista de produtos da OS
            let produtos = [];
            if (typeof data.produtos === "string" && data.produtos.length > 0) {
                try {
                    produtos = JSON.parse(data.produtos);
                } catch {
                    produtos = [];
                }
            } else if (Array.isArray(data.produtos)) {
                produtos = data.produtos;
            }

            let itensDetalhados = [];
            if (produtos.length > 0) {
                itensDetalhados = await Promise.all(
                    produtos.map(async (p) => {
                        const resp = await fetch(`/api/produtos/getUmProduto/${p.id}`);
                        const prod = resp.ok ? await resp.json() : {};
                        return {
                            sku: prod.sku || "",
                            descricao: prod.descricao || "",
                            qtd: Number(p.qtd),
                            valor: Number(p.valor_unitario),
                            total: Number(p.qtd) * Number(p.valor_unitario),
                            produtoId: p.id
                        };
                    })
                );
            }

            if (
                (data.status_os === "EM ANDAMENTO" || data.status === "EM ANDAMENTO") &&
                itensDetalhados.length === 0
            ) {
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

    // -------------- 2) buscar veículo por placa (ao digitar) --------------
    useEffect(() => {
        // Só dispara a busca se: não estamos num ID de OS, não estivermos em “modo criação”,
        // e a placa tiver 7 caracteres.
        if (!id && !emCriacaoOS && placa.length === 7) {
            buscarVeiculo(placa);
        }
        // eslint-disable-next-line
    }, [placa, id, emCriacaoOS]);

    // -------------- 3) abrir modal de cadastro --------------
    function abrirCadastroVeiculo() {
        setModoCadastroVeiculo(true);
    }

    // -------------- 4) callback QUANDO o CadastroVeiculo confirma (POST deu certo) --------------
    async function onVeiculoCriado(novoVeiculoData) {
        setModoCadastroVeiculo(false);
        setPlaca(novoVeiculoData.placa);

        console.log("Veículo em useOrdemServico.js:", novoVeiculoData);

        // 1) Já sobrescreve veiculo com o objeto completo vindo do backend
        setVeiculo({
            placa: novoVeiculoData.placa,
            marca_veiculo: novoVeiculoData.marca_veiculo,
            modelo_veiculo: novoVeiculoData.modelo_veiculo,
            nome: novoVeiculoData.nome,
            telefone: novoVeiculoData.telefone,
            id_veiculo: novoVeiculoData.id_veiculo,
            id_cliente: novoVeiculoData.id_cliente_veiculo
        });

        setNaoEncontrado(false);

        // 2) Pergunta se quer iniciar OS com este veículo
        setTimeout(() => {
            if (
                window.confirm(
                    `Deseja abrir uma nova Ordem de Serviço para o veículo ${novoVeiculoData.placa}?`
                )
            ) {
                // Passa o próprio objeto “completo” que já veio do backend:
                iniciarOS({
                    id_veiculo: novoVeiculoData.id_veiculo,
                    id_cliente: novoVeiculoData.id_cliente_veiculo,
                    placa: novoVeiculoData.placa,
                    marca_veiculo: novoVeiculoData.marca_veiculo,
                    modelo_veiculo: novoVeiculoData.modelo_veiculo,
                    nome: novoVeiculoData.nome,
                    telefone: novoVeiculoData.telefone
                });
            }
        }, 100);
    }


    // -------------- 5) criar nova OS --------------
    function iniciarOS(veiculoParam) {
        setEmCriacaoOS(true);
        setItens([ITEM_VAZIO]);
        criarOS(veiculoParam);
    }

    async function criarOS(veiculoParam) {
        console.log("veiculoParam em criarOS:", veiculoParam);
        const hoje = new Date().toISOString().slice(0, 10);
        const payload = {
            data: hoje,
            id_veiculo: veiculoParam.id_veiculo,
            id_cliente: veiculoParam.id_cliente || veiculoParam.id_cliente_veiculo, // que porra é essa? ***************
            obs: "",
            valor_os: 0,
            status: "EM ANDAMENTO"
        };
        const res = await fetch("/api/ordem_servico/criarOS", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const json = await res.json();
        setOsId(json.insertId);
    }


    // -------------- 6) salvamento automático (produtos / desconto / obs) --------------
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
                .filter((i) => i.produtoId && i.qtd)
                .map((i) => ({
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
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dados)
            });
        } catch (error) {
            console.log(error);
        }
    }

    // -------------- 7) fechar OS (e dar baixa no estoque) --------------
    async function fecharOS(forma_pagamento) {
        try {
            const produtosParaSalvar = itens
                .filter((i) => i.produtoId && i.qtd)
                .map((i) => ({
                    id: i.produtoId,
                    qtd: i.qtd,
                    valor_unitario: i.valor
                }));

            const dados_os = {
                id: osId,
                listagem_produtos: JSON.stringify(produtosParaSalvar),
                valor_os: calcularTotal(itens, desconto),
                desconto,
                status: "FECHADA",
                forma_pagamento,
                obs
            };

            const resposta = await fetch("/api/ordem_servico/fecharOS", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dados_os)
            });

            if (!resposta.ok) {
                alert("Erro ao fechar OS.");
                throw new Error("Falha ao enviar a requisição: " + resposta.status);
            }

            // Depois que a OS realmente foi marcada como “FECHADA” no back, dar baixa no estoque:
            for (const produto of produtosParaSalvar) {
                const baixaRes = await fetch(`/api/ordem_servico/baixaEstoque`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: produto.id, qtd: produto.qtd })
                });
                if (!baixaRes.ok) {
                    console.error(
                        `Erro ao baixar estoque do produto ${produto.id}: ${baixaRes.statusText}`
                    );
                }
            }

            setStatus("FECHADA");
            setOs((prev) => ({
                ...prev,
                status_os: "FECHADA",
                forma_pagamento
            }));
            alert("A OS foi fechada com sucesso.");
        } catch (error) {
            alert("Erro ao fechar OS.");
            console.error("Erro:", error);
        }
    }

    // -------------- 8) cancelar OS (e repor estoque, se já tinha sido fechada) --------------
    async function cancelarOS() {
        // Pergunta ao usuário se realmente quer cancelar:
        if (!window.confirm("Você tem certeza de que deseja CANCELAR a OS?")) return;

        const statusAtual = status;
        const idDaOS = osId;
        // Se status era “FECHADA”, repõe estoque de todos os produtos:
        if (statusAtual === "FECHADA") {
            try {
                const resp = await fetch(`/api/ordem_servico/getOSById/${idDaOS}`);
                if (!resp.ok) throw new Error("Erro ao buscar OS");
                const dadosOS = await resp.json();

                let produtos = [];
                if (typeof dadosOS.produtos === "string" && dadosOS.produtos.length > 0) {
                    produtos = JSON.parse(dadosOS.produtos);
                } else if (Array.isArray(dadosOS.produtos)) {
                    produtos = dadosOS.produtos;
                }

                for (const produto of produtos) {
                    const respProd = await fetch(`/api/produtos/getUmProduto/${produto.id}`);
                    if (!respProd.ok) throw new Error("Erro ao buscar produto");
                    const dadosProduto = await respProd.json();
                    const nova_qtd =
                        parseFloat(dadosProduto.qtd_estoque) + parseFloat(produto.qtd);

                    await fetch("/api/ordem_servico/reporEstoque", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            id: produto.id,
                            nova_qtd
                        })
                    });
                }
            } catch (err) {
                alert("Erro ao repor estoque. Tente novamente.");
                console.error(err);
                return;
            }
        }

        // Finalmente, marca a OS como CANCELADA no back:
        try {
            const res = await fetch(`/api/ordem_servico/cancelarOS/${idDaOS}`, {
                method: "POST"
            });
            if (!res.ok) throw new Error("Erro ao cancelar OS");
            alert("A OS foi cancelada com sucesso!");
            setStatus("CANCELADA");
            setOs((prev) => ({
                ...prev,
                status_os: "CANCELADA"
            }));
        } catch (error) {
            alert("Erro ao cancelar OS.");
            console.error(error);
        }
    }

    // -------------- 9) emitir NF (placeholder) --------------
    function emitirNotaFiscal(osIdEmitir) {
        alert("Função de emitir NF ainda não implementada");
    }

    // -------------- 10) clonar OS (faz nova OS com valores atualizados) --------------
    async function clonarOS(osIdParaClonar) {
        if (!window.confirm("Deseja realmente clonar esta OS?")) return;

        try {
            // 1) Busca OS original
            const res = await fetch(`/api/ordem_servico/getOSById/${osIdParaClonar}`);
            if (!res.ok) throw new Error("Erro ao buscar OS original.");
            const dadosOS = await res.json();

            // 2) Extrai veículo, cliente e lista de produtos
            const veiculoIdOriginal = dadosOS.id_veiculo;
            const clienteIdOriginal = dadosOS.id_cliente;
            let produtos = [];
            if (typeof dadosOS.produtos === "string" && dadosOS.produtos.length > 0) {
                produtos = JSON.parse(dadosOS.produtos);
            } else if (Array.isArray(dadosOS.produtos)) {
                produtos = dadosOS.produtos;
            }

            // 3) Para cada produto, busca preço atualizado
            const produtosAtualizados = await Promise.all(
                produtos.map(async (prod) => {
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

            // 4) Cria nova OS “EM ANDAMENTO”
            const hoje = new Date().toISOString().slice(0, 10);
            const payload = {
                data: hoje,
                id_veiculo: veiculoIdOriginal,
                id_cliente: clienteIdOriginal,
                obs: dadosOS.obs || "",
                valor_os: produtosAtualizados.reduce((acc, p) => acc + p.total, 0),
                status: "EM ANDAMENTO"
            };
            const resNovaOS = await fetch("/api/ordem_servico/criarOS", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (!resNovaOS.ok) throw new Error("Erro ao criar nova OS clonada");
            const { insertId } = await resNovaOS.json();

            // 5) Persiste produtos na nova OS
            await fetch("/api/ordem_servico/salvarOS", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: insertId,
                    listagem_produtos: JSON.stringify(
                        produtosAtualizados.map((p) => ({
                            id: p.produtoId,
                            qtd: p.qtd,
                            valor_unitario: p.valor
                        }))
                    ),
                    valor_os: produtosAtualizados.reduce((acc, p) => acc + p.total, 0),
                    desconto: 0,
                    obs: dadosOS.obs || ""
                })
            });

            // 6) Redireciona para a nova OS
            alert("OS clonada com sucesso!");
            window.location.href = `/ordem_servico/${insertId}`;
        } catch (err) {
            alert("Erro ao clonar OS. Detalhe: " + err.message);
            console.error(err);
        }
    }

    // -------------- 11) helper “statusDescricao” --------------
    function statusDescricao() {
        return getStatusDescricao({ emAndamento, fechada, cancelada });
    }

    // -------------- 12) flags agrupadas --------------
    const flagsLocal = {
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
        mostraClonar: cancelada || fechada
    };

    return {
        os,
        veiculo,
        setVeiculo,
        cliente,
        setCliente,
        itens,
        setItens,
        desconto,
        setDesconto,
        obs,
        setObs,
        status,
        setStatus,
        osId,
        placa,
        setPlaca,
        naoEncontrado,
        modoCadastroVeiculo,
        setModoCadastroVeiculo,
        emCriacaoOS,
        setEmCriacaoOS,
        loadingProdutos,
        setLoadingProdutos,
        modalPagamento,
        setModalPagamento,
        formaPagamento,
        setFormaPagamento,
        onPlacaChange,
        abrirCadastroVeiculo,
        onVeiculoCriado,
        iniciarOS,
        criarOS,
        fecharOS,
        cancelarOS,
        clonarOS,
        emitirNotaFiscal,
        buscarProdutoPorSku,
        adicionarItem,
        removerItem,
        atualizarItem,
        calcularTotal: () => calcularTotal(itens, desconto),
        statusDescricao,
        flags: flagsLocal,
        buscarVeiculo,
        resetVeiculo
    };
}
