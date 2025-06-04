// src/pages/OrdemServico.jsx
import React from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

import { useOrdemServico } from '../hooks/useOrdemServico';

import ResumoOS from '../components/ordem_servico/ResumoOS';
import TabelaProdutosOS from '../components/ordem_servico/TabelaProdutosOS';
import CampoDescontoOS from '../components/ordem_servico/CampoDescontoOS';
import CampoValorTotalOS from '../components/ordem_servico/CampoValorTotalOS';
import CampoObservacoesOS from '../components/ordem_servico/CampoObservacoesOS';
import BotoesOS from '../components/ordem_servico/BotoesOS';
import ModalPagamentoOS from '../components/ordem_servico/ModalPagamentoOS';

import CadastroVeiculo from '../components/CadastroVeiculo';

export default function OrdemServico() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { search } = useLocation();
  const placaParam = new URLSearchParams(search).get('placa') || '';

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

  // “Antes de iniciar OS”: apenas pesquisando a placa ou cadastrando novo veículo
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
                <p><b>MARCA:</b> {veiculo.marca_veiculo || ''}</p>
                <p><b>MODELO:</b> {veiculo.modelo_veiculo || ''}</p>
                <p><b>CLIENTE:</b> {veiculo.nome || ''}</p>
              </div>
              <button
                onClick={() => iniciarOS(veiculo)}
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
                className="ml-2 text-blue-600 underline cursor-pointer"
              >
                Cadastrar novo?
              </button>
            </div>
          )}
        </div>

        {modoCadastroVeiculo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded max-w-md w-full">
              <CadastroVeiculo
                placaPadrao={placa}
                onCreated={onVeiculoCriado}
                onClose={() => abrirCadastroVeiculo(false)}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // “Tela de OS” (embaralha edição ou apenas visualização)
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-2">
        OS #{osId || (os && os.id_os) || ''}
      </h2>

      <ResumoOS
        status={statusDescricao()}
        data={
          os?.data
            ? `${os.data.slice(8, 10)}/${os.data.slice(5, 7)}/${os.data.slice(0, 4)}`
            : new Date().toLocaleDateString('pt-BR')
        }
        formaPagamento={os?.forma_pagamento}
        veiculo={veiculo}
        cliente={cliente || (veiculo ? { nome: veiculo.nome, telefone: veiculo.telefone || '' } : null)}
      />

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

      <div className="flex justify-between items-center mt-4 gap-4">
        <CampoDescontoOS
          desconto={desconto}
          onChange={val => setDesconto(val)}
          podeEditar={flags.podeEditarDesconto}
        />
        <CampoValorTotalOS valorTotal={calcularTotal()} />
      </div>

      <CampoObservacoesOS
        obs={obs}
        onChange={val => setObs(val)}
        podeEditar={flags.podeEditarObs}
      />

      <BotoesOS
        mostraVoltar={flags.mostraVoltar}
        mostraFinalizar={flags.mostraFinalizar}
        mostraEmitirNF={flags.fechada}
        mostraCancelar={flags.fechada && !flags.cancelada}
        mostraClonar={flags.mostraClonar}
        onVoltar={() => navigate('/os')}
        onFinalizar={() => setModalPagamento(true)}
        onEmitirNF={() => emitirNotaFiscal(osId)}
        onCancelar={() => cancelarOS()}
        onClonar={() => clonarOS(osId)}
      />

      {modalPagamento && (
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
      )}
    </div>
  );
}
