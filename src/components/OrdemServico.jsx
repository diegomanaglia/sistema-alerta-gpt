// src/components/OrdemServico.jsx
import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

// Componentes de layout
import ResumoOS from './ordem_servico/ResumoOS';
import TabelaProdutosOS from './ordem_servico/TabelaProdutosOS';
import CampoDescontoOS from './ordem_servico/CampoDescontoOS';
import CampoValorTotalOS from './ordem_servico/CampoValorTotalOS';
import CampoObservacoesOS from './ordem_servico/CampoObservacoesOS';
import ModalPagamentoOS from './ordem_servico/ModalPagamentoOS';
import BotoesOS from './ordem_servico/BotoesOS';

// Componente de cadastro/edição de veículo
import CadastroVeiculo from './CadastroVeiculo';

// Hook principal de OS
import { useOrdemServico } from '../hooks/useOrdemServico';

export default function OrdemServico() {
  const navigate = useNavigate();
  const { id } = useParams();                   // se existir, significa que estamos editando/consultando uma OS
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const placaParam = params.get('placa') || '';  // se veio ?placa=XXX, preenche automaticamente

  // Desestruturação do hook useOrdemServico
  const {
    os,
    veiculo,
    cliente,
    itens,
    desconto,
    setDesconto,
    obs,
    setObs,
    status,
    osId,
    placa,
    naoEncontrado,
    modoCadastroVeiculo,
    setModoCadastroVeiculo,
    emCriacaoOS,
    modalPagamento,
    setModalPagamento,
    formaPagamento,
    setFormaPagamento,
    onPlacaChange,
    abrirCadastroVeiculo,
    onVeiculoCriado,
    iniciarOS,
    adicionarItem,
    removerItem,
    atualizarItem,
    buscarProdutoPorSku,
    fecharOS,
    cancelarOS,
    emitirNotaFiscal,
    clonarOS,
    calcularTotal,
    statusDescricao,
    flags
  } = useOrdemServico(id, placaParam);

  console.log("Veículo em OrdemServico.jsx:", veiculo);

  // --------- Render “Pré‐OS” (digitar placa / cadastro de veículo) ---------
  // Se não houver `id` (ou seja, não estamos editando uma OS existente) e não estivermos já em “criação de OS”,
  // mostraremos o input de placa + possível resumo do veículo + botão "Iniciar OS".
  if (!id && !emCriacaoOS) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center space-y-2">
          {/* Input de placa (até 7 caracteres em uppercase) */}
          <input
            type="text"
            maxLength={7}
            placeholder="Digite a placa (7 caracteres)"
            value={placa}
            onChange={onPlacaChange}
            className="border p-2 rounded text-center uppercase w-48"
          />

          {/* Se o hook já carregou um `veiculo`, exibe um mini‐resumo e botão “Iniciar OS” */}
          {veiculo && (
            <div className="mt-4 bg-gray-100 p-4 rounded flex justify-between items-center">
              <div className="text-left">
                <p>
                  <span className="font-bold">PLACA:</span> {veiculo.placa}
                </p>
                <p>
                  <span className="font-bold">MARCA:</span> {veiculo.marca_veiculo}
                </p>
                <p>
                  <span className="font-bold">MODELO:</span> {veiculo.modelo_veiculo}
                </p>
                <p>
                  <span className="font-bold">CLIENTE:</span> {veiculo.nome}
                </p>
              </div>
              <button
                onClick={() => iniciarOS()}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Iniciar OS
              </button>
            </div>
          )}

          {/* Se não encontrou veículo (placa inválida) e não estamos no modal de cadastro, mostramos link para cadastrar */}
          {naoEncontrado && !modoCadastroVeiculo && (
            <div className="mt-4 text-red-600 font-semibold">
              Veículo não encontrado.
              <button
                onClick={() => abrirCadastroVeiculo()}
                className="ml-2 text-blue-600 underline font-bold"
              >
                Cadastrar novo?
              </button>
            </div>
          )}
        </div>

        {/* Modal de cadastro de veículo */}
        {modoCadastroVeiculo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded max-w-lg w-full">
              <CadastroVeiculo
                placaPadrao={placa}
                veiculoId={null}
                onCreated={(novoVeiculo) => {
                  // 1) fecha modal
                  setModoCadastroVeiculo(false);
                  // 2) atualiza estado de placa e veiculo no hook
                  onVeiculoCriado(novoVeiculo);
                  // note: o onVeiculoCriado já dispara iniciarOS() se o usuário confirmar.
                }}
                onClose={() => setModoCadastroVeiculo(false)}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // --------- Render principal (edição/visualização de OS ou criação imediata após cadastro de veículo) ---------
  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Título da OS (se já existe no backend, mostra id_os; se acabamos de criar, usa o osId recém‐criado) */}
      <h2 className="text-2xl font-bold mb-2">OS #{osId || (os && os.id_os) || ''}</h2>

      {/* Resumo: Status / Data / (se existir) Forma de Pagamento / Veículo / Cliente */}
      <ResumoOS
        status={statusDescricao()}
        data={
          os?.data
            ? `${os.data.slice(8, 10)}/${os.data.slice(5, 7)}/${os.data.slice(0, 4)}`
            : new Date().toLocaleDateString('pt-BR')
        }
        formaPagamento={os?.forma_pagamento}
        veiculo={veiculo}
        cliente={cliente}
      />

      {/* Tabela de produtos/serviços */}
      <TabelaProdutosOS
        itens={itens}
        podeEditar={flags.podeEditar}
        podeAdicionarItem={flags.podeAdicionarItem}
        podeRemoverItem={flags.podeRemoverItem}
        onAdicionarItem={adicionarItem}
        onRemoverItem={removerItem}
        onAtualizarItem={atualizarItem}
        buscarProdutoPorSku={buscarProdutoPorSku}
      />

      {/* Linha: Desconto / Valor Total */}
      <div className="flex justify-between items-center mt-4 gap-4">
        <CampoDescontoOS
          desconto={desconto}
          onChange={(val) => setDesconto(val)}
          podeEditar={flags.podeEditarDesconto}
        />
        <CampoValorTotalOS valorTotal={calcularTotal()} />
      </div>

      {/* Campo Observações (expand/collapse) */}
      <CampoObservacoesOS obs={obs} onChange={(val) => setObs(val)} podeEditar={flags.podeEditarObs} />

      {/* Botões de ação: Voltar / Finalizar / Emitir NF / Cancelar / Clonar */}
      <BotoesOS
        mostraVoltar={true}
        mostraFinalizar={flags.mostraFinalizar}
        mostraEmitirNF={flags.fechada}
        mostraCancelar={flags.fechada && !flags.cancelada}
        mostraClonar={flags.mostraClonar}
        onVoltar={() => navigate('/os')}                /* volta para lista de OS */
        onFinalizar={() => setModalPagamento(true)}     /* abre modal de pagamento */
        onEmitirNF={() => emitirNotaFiscal(osId)}
        onCancelar={() => cancelarOS()}                 /* não precisa repassar ID; o hook já sabe */
        onClonar={() => clonarOS(osId)}
      />

      {/* Modal de escolha de forma de pagamento */}
      <ModalPagamentoOS
        open={modalPagamento}
        formaPagamento={formaPagamento}
        setFormaPagamento={setFormaPagamento}
        onFechar={() => setModalPagamento(false)}
        onConfirmar={async () => {
          await fecharOS(formaPagamento);
          setModalPagamento(false);
        }}
      />
    </div>
  );
}
