import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import ResumoOS from './ordem_servico/ResumoOS'
import TabelaProdutosOS from './ordem_servico/TabelaProdutosOS'
import CampoDescontoOS from './ordem_servico/CampoDescontoOS'
import CampoValorTotalOS from './ordem_servico/CampoValorTotalOS'
import CampoObservacoesOS from './ordem_servico/CampoObservacoesOS'
import ModalPagamentoOS from './ordem_servico/ModalPagamentoOS'
import BotoesOS from './ordem_servico/BotoesOS'
import CadastroVeiculo from './CadastroVeiculo'

const ITEM_VAZIO = { sku: '', descricao: '', qtd: 1, valor: 0, total: 0, produtoId: null }

export default function OrdemServico() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { search } = useLocation()
  const params = new URLSearchParams(search)
  const placaParam = params.get('placa') || ''

  // Estados principais
  const [os, setOs] = useState(null)
  const [itens, setItens] = useState([ITEM_VAZIO])
  const [veiculo, setVeiculo] = useState(null)
  const [cliente, setCliente] = useState(null)
  const [placa, setPlaca] = useState(placaParam)
  const [naoEncontrado, setNaoEncontrado] = useState(false)
  const [modoCadastroVeiculo, setModoCadastroVeiculo] = useState(false)
  const [emCriacaoOS, setEmCriacaoOS] = useState(false)
  const [osId, setOsId] = useState(null)
  const [desconto, setDesconto] = useState(0)
  const [obs, setObs] = useState('')
  const [status, setStatus] = useState('')
  const [loadingProdutos, setLoadingProdutos] = useState(false)
  const [modalPagamento, setModalPagamento] = useState(false)
  const [formaPagamento, setFormaPagamento] = useState("")
  // flags otimizadas
  const isFirstRender = useRef(true)

  // Flags de status (booleans)
  const emAndamento = emCriacaoOS || status === "EM ANDAMENTO"
  const fechada = status === "FECHADA"
  const cancelada = status === "CANCELADA"

  // Flags agrupadas (pra passar fácil pros filhos)
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
  }

  // --------------- Funções utilitárias ---------------

  function statusDescricao() {
    if (emAndamento) return "EM ANDAMENTO"
    if (fechada) return "FECHADA"
    if (cancelada) return "CANCELADA"
    return ""
  }

  function calcularTotal() {
    return (Array.isArray(itens) ? itens.reduce((acc, i) => acc + (i.total || 0), 0) : 0) - Number(desconto || 0)
  }

  // --------------- Carregar OS (edição) ---------------
  useEffect(() => {
    if (id) carregarOS(id)
  }, [id])

  async function carregarOS(osId) {
    setLoadingProdutos(true)
    try {
      const res = await fetch(`/api/ordem_servico/getOSById/${osId}`)
      if (!res.ok) throw new Error('Erro ao buscar OS')
      const data = await res.json()
      setOs(data)
      setVeiculo({
        placa: data.placa,
        marca_veiculo: data.marca_veiculo,
        modelo_veiculo: data.modelo_veiculo,
      })
      setCliente({
        nome: data.nome,
        telefone: data.telefone1 || data.whatsapp || data.celular || '',
      })
      setDesconto(Number(data.desconto) || 0)
      setObs(data.obs || '')
      setStatus(data.status_os || data.status || '')
      setOsId(data.id_os)

      let produtos = []
      if (typeof data.produtos === 'string' && data.produtos.length > 0) {
        try {
          produtos = JSON.parse(data.produtos)
        } catch {
          produtos = []
        }
      } else if (Array.isArray(data.produtos)) {
        produtos = data.produtos
      }

      let itensDetalhados = []
      if (produtos.length > 0) {
        itensDetalhados = await Promise.all(
          produtos.map(async p => {
            const resp = await fetch(`/api/produtos/getUmProduto/${p.id}`)
            const prod = resp.ok ? await resp.json() : {}
            return {
              sku: prod.sku || '',
              descricao: prod.descricao || '',
              qtd: Number(p.qtd),
              valor: Number(p.valor_unitario),
              total: Number(p.qtd) * Number(p.valor_unitario),
              produtoId: p.id
            }
          })
        )
      }

      if ((data.status_os === "EM ANDAMENTO" || data.status === "EM ANDAMENTO") && itensDetalhados.length === 0) {
        setItens([ITEM_VAZIO])
      } else {
        setItens(itensDetalhados)
      }
    } catch (err) {
      alert("Erro ao carregar OS.")
      setOs(null)
      setItens([ITEM_VAZIO])
    } finally {
      setLoadingProdutos(false)
    }
  }

  // --------------- Busca veículo por placa ---------------
  useEffect(() => {
    if (!id && placa.length === 7) fetchVeiculo(placa)
  }, [placa, id])

  async function fetchVeiculo(p) {
    try {
      const res = await fetch(`/api/veiculos/getVeiculoUnico/${p}`)
      if (!res.ok) throw new Error('Não encontrado')
      const data = await res.json()
      if (data && data.placa) {
        setVeiculo(data)
        setNaoEncontrado(false)
      } else {
        setVeiculo(null)
        setNaoEncontrado(true)
      }
    } catch {
      setVeiculo(null)
      setNaoEncontrado(true)
    }
  }

  function onPlacaChange(e) {
    setPlaca(e.target.value.toUpperCase().slice(0, 7))
  }

  function abrirCadastroVeiculo() { setModoCadastroVeiculo(true) }
  function onVeiculoCriado(novo) {
    setModoCadastroVeiculo(false)
    setPlaca(novo.placa)
    setVeiculo(novo)
    setNaoEncontrado(false)
  }

  // --------------- Nova OS (criação) ---------------
  function iniciarOS() {
    setEmCriacaoOS(true)
    setItens([ITEM_VAZIO])
    criarOS()
  }
  async function criarOS() {
    const hoje = new Date().toISOString().slice(0, 10)
    const payload = {
      data: hoje,
      id_veiculo: veiculo.id_veiculo,
      id_cliente: veiculo.id_cliente,
      obs: '',
      valor_os: 0,
      status: 'EM ANDAMENTO'
    }
    const res = await fetch('/api/ordem_servico/criarOS', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const json = await res.json()
    setOsId(json.insertId)
  }

  // --------------- Salvamento automático ---------------
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (!osId || loadingProdutos) return

    salvarAutomatico()
  }, [itens, desconto, obs, osId, loadingProdutos])

  async function salvarAutomatico() {
    try {
      const inputs = itens
        .filter(i => i.produtoId && i.qtd)
        .map(i => ({
          id: i.produtoId,
          qtd: i.qtd,
          valor_unitario: i.valor
        }))

      const dados = {
        id: osId,
        listagem_produtos: JSON.stringify(inputs),
        valor_os: calcularTotal(),
        desconto,
        obs
      }

      await fetch(`/api/ordem_servico/salvarOS`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
      })
    } catch (error) {
      console.log(error)
    }
  }

  // --------------- Itens ---------------
  function handleAdicionarItem() {
    setItens(prev => [...prev, { ...ITEM_VAZIO }])
  }
  function handleAtualizarItem(idx, campo, valor) {
    setItens(prev => {
      const copia = prev.map((item, i) =>
        i === idx ? { ...item, [campo]: valor, total: campo === 'qtd' || campo === 'valor' ? (campo === 'qtd' ? valor : item.qtd) * (campo === 'valor' ? valor : item.valor) : item.total } : item
      )
      return copia
    })
  }
  function handleRemoverItem(idx) {
    setItens(prev => {
      const nova = prev.filter((_, i) => i !== idx)
      return nova.length ? nova : [ITEM_VAZIO]
    })
  }
  async function buscarProdutoPorSku(idx, sku) {
    if (!sku) return
    try {
      const res = await fetch(`/api/produtos/getProdutoBySku/${sku}`)
      if (!res.ok) throw new Error('Não encontrado')
      const prod = await res.json()
      setItens(prev => {
        const c = [...prev]
        c[idx].sku = prod.sku || ''
        c[idx].descricao = prod.descricao || ''
        c[idx].valor = parseFloat(prod.valor_venda) || 0
        c[idx].produtoId = prod.id
        c[idx].total = c[idx].qtd * c[idx].valor
        return c
      })
    } catch {
      setItens(prev => {
        const c = [...prev]
        c[idx].sku = ''
        c[idx].descricao = ''
        c[idx].valor = 0
        c[idx].produtoId = null
        c[idx].total = 0
        return c
      })
      alert('Produto não encontrado!')
    }
  }

  // --------------- Fechar OS (baixa estoque) ---------------
  async function fecharOS(forma_pagamento) {
    try {
      const produtosParaSalvar = itens
        .filter(i => i.produtoId && i.qtd)
        .map(i => ({
          id: i.produtoId,
          qtd: i.qtd,
          valor_unitario: i.valor
        }))

      const dados_os = {
        id: osId,
        listagem_produtos: JSON.stringify(produtosParaSalvar),
        valor_os: calcularTotal(),
        desconto: desconto,
        status: "FECHADA",
        forma_pagamento: forma_pagamento,
        obs: obs
      }

      // Fecha OS no backend
      const resposta = await fetch("/api/ordem_servico/fecharOS", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados_os)
      })

      if (!resposta.ok) {
        alert("Erro ao fechar OS.")
        throw new Error('Falha ao enviar a requisição: ' + resposta.status)
      }

      // Baixa no estoque
      for (const produto of produtosParaSalvar) {
        await fetch(`/api/ordem_servico/baixaEstoque`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: produto.id, qtd: produto.qtd })
        })
      }

      setStatus("FECHADA")
      setOs(prev => ({
        ...prev,
        status_os: "FECHADA",
        forma_pagamento
      }))
      alert("A OS foi fechada com sucesso.")
    } catch (error) {
      alert("Erro ao fechar OS.")
      console.error('Erro:', error)
    }
  }

  // ----------- Render pré-OS (busca placa/novo) -----------
  if (!id && !emCriacaoOS) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center space-y-2">
          <input
            type="text"
            maxLength={7}
            placeholder="Digite a placa (7 caracteres)"
            value={placa}
            onChange={onPlacaChange}
            className="border p-2 rounded text-center uppercase w-48"
          />
          {veiculo && (
            <div className="mt-4 bg-gray-100 p-4 rounded flex justify-between items-center">
              <div>
                <p><b>PLACA:</b> {veiculo.placa}</p>
                <p><b>MARCA:</b> {veiculo.marca_veiculo}</p>
                <p><b>MODELO:</b> {veiculo.modelo_veiculo}</p>
                <p><b>CLIENTE:</b> {veiculo.nome}</p>
              </div>
              <button
                onClick={iniciarOS}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Iniciar OS
              </button>
            </div>
          )}
          {naoEncontrado && !modoCadastroVeiculo && (
            <div className="mt-4 text-red-600">
              Veículo não encontrado.
              <button
                onClick={abrirCadastroVeiculo}
                className="ml-2 text-blue-600 underline"
              >Cadastrar novo?</button>
            </div>
          )}
        </div>
        {modoCadastroVeiculo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded max-w-md w-full">
              <CadastroVeiculo
                source="os"
                onCreated={onVeiculoCriado}
                onClose={() => setModoCadastroVeiculo(false)}
              />
            </div>
          </div>
        )}
      </div>
    )
  }

  // ----------- Render principal unificado (edição/visualização) -----------
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-2">
        OS #{osId || (os && os.id_os) || ""}
      </h2>

      {/* Resumo */}
      <ResumoOS
        status={statusDescricao()}
        data={os?.data ? `${os.data.slice(8, 10)}/${os.data.slice(5, 7)}/${os.data.slice(0, 4)}` : new Date().toLocaleDateString('pt-BR')}
        formaPagamento={os?.forma_pagamento}
        veiculo={veiculo}
        cliente={cliente}
      />

      {/* Tabela de Produtos */}
      <TabelaProdutosOS
        itens={itens}
        podeEditar={flags.podeEditar}
        podeAdicionarItem={flags.podeAdicionarItem}
        podeRemoverItem={flags.podeRemoverItem}
        onAdicionarItem={handleAdicionarItem}
        onRemoverItem={handleRemoverItem}
        onAtualizarItem={handleAtualizarItem}
        buscarProdutoPorSku={buscarProdutoPorSku}
      />

      {/* Desconto e Valor Total */}
      <div className="flex justify-between items-center mt-4 gap-4">
        <CampoDescontoOS
          desconto={desconto}
          onChange={setDesconto}
          podeEditar={flags.podeEditarDesconto}
        />
        <CampoValorTotalOS valorTotal={calcularTotal()} />
      </div>

      {/* Observações */}
      <CampoObservacoesOS
        obs={obs}
        onChange={setObs}
        podeEditar={flags.podeEditarObs}
      />

      {/* Botões */}
      <BotoesOS
        mostraVoltar={flags.mostraVoltar}
        mostraFinalizar={flags.mostraFinalizar}
        onVoltar={() => navigate(-1)}
        onFinalizar={() => setModalPagamento(true)}
        // mostraDanfe, mostraCancelar, mostraClonar: exemplos para futuro!
      />

      {/* Modal Forma de Pagamento */}
      <ModalPagamentoOS
        open={modalPagamento}
        formaPagamento={formaPagamento}
        setFormaPagamento={setFormaPagamento}
        onFechar={() => setModalPagamento(false)}
        onConfirmar={async () => {
          await fecharOS(formaPagamento)
          setModalPagamento(false)
        }}
      />
    </div>
  )
}
