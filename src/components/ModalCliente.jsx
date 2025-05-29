// src/components/ModalCliente.jsx
import React, { useState, useEffect } from 'react';

export default function ModalCliente({ clienteId, isOpen, onClose }) {
  const [tipoPessoa, setTipoPessoa] = useState('PESSOA FISICA');
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [ie, setIe] = useState('');
  const [im, setIm] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [telefone1, setTelefone1] = useState('');
  const [telefone2, setTelefone2] = useState('');
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState('');
  const [numeroEndereco, setNumeroEndereco] = useState('');
  const [bairro, setBairro] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [codIbge, setCodIbge] = useState('');
  const [complemento, setComplemento] = useState('');
  const [uf, setUf] = useState('');
  const [status, setStatus] = useState('ATIVO');
  const [veiculos, setVeiculos] = useState([]);

  // Carrega dados para edição ou limpa para novo
  useEffect(() => {
    if (!isOpen) return;
    if (clienteId) {
      fetch(`/api/clientes/getClienteById/${clienteId}`)
        .then(res => res.json())
        .then(data => {
          setTipoPessoa(data.tipo_pessoa);
          setNome(data.nome);
          setCpf(data.cpf || '');
          setCnpj(data.cnpj || '');
          setNomeFantasia(data.nome_fantasia || '');
          setIe(data.inscricao_estadual || '');
          setIm(data.inscricao_municipal || '');
          setEmail(data.email || '');
          setWhatsapp(data.whatsapp || '');
          setTelefone1(data.telefone1 || '');
          setTelefone2(data.telefone2 || '');
          setCep(data.cep || '');
          setEndereco(data.endereco || '');
          setNumeroEndereco(data.numero_endereco || '');
          setBairro(data.bairro || '');
          setMunicipio(data.municipio || '');
          setCodIbge(data.cod_ibge || '');
          setComplemento(data.complemento || '');
          setUf(data.uf || '');
          setStatus(data.status || 'ATIVO');
        });
      fetch(`/api/veiculos/getVeiculosByIdCliente/${clienteId}`)
        .then(res => res.json())
        .then(list => setVeiculos(list));
    } else {
      setTipoPessoa('PESSOA FISICA');
      setNome(''); setCpf(''); setCnpj(''); setNomeFantasia(''); setIe(''); setIm('');
      setEmail(''); setWhatsapp(''); setTelefone1(''); setTelefone2('');
      setCep(''); setEndereco(''); setNumeroEndereco(''); setBairro(''); setMunicipio(''); setCodIbge(''); setComplemento(''); setUf('');
      setStatus('ATIVO');
      setVeiculos([]);
    }
  }, [isOpen, clienteId]);

  // Lookup CEP
  useEffect(() => {
    if (cep.length === 8) {
      fetch(`https://cep.awesomeapi.com.br/json/${cep}`)
        .then(res => res.json())
        .then(d => {
          setEndereco(d.address.toUpperCase());
          setBairro(d.district.toUpperCase());
          setMunicipio(d.city.toUpperCase());
          setCodIbge(d.city_ibge);
          setUf(d.state.toUpperCase());
        })
        .catch(() => {});
    }
  }, [cep]);

  // Lookup CNPJ
  useEffect(() => {
    if (tipoPessoa === 'PESSOA JURIDICA' && cnpj.length === 14) {
      fetch(`https://publica.cnpj.ws/cnpj/${cnpj}`)
        .then(res => res.json())
        .then(d => {
          setNome(d.razao_social.toUpperCase());
          setNomeFantasia(d.estabelecimento.nome_fantasia || '');
          setEmail(d.estabelecimento.email || '');
          setTelefone1(d.estabelecimento.telefone1 || '');
          setTelefone2(d.estabelecimento.telefone2 || '');
          setCep(d.estabelecimento.cep || '');
          setEndereco(`${d.estabelecimento.tipo_logradouro} ${d.estabelecimento.logradouro}`.toUpperCase());
          setNumeroEndereco(d.estabelecimento.numero || '');
          setComplemento(d.estabelecimento.complemento || '');
          setBairro(d.estabelecimento.bairro.toUpperCase());
          setMunicipio(d.estabelecimento.cidade.nome.toUpperCase());
          setCodIbge(d.estabelecimento.cidade.ibge_id || '');
          setUf(d.estabelecimento.estado.sigla.toUpperCase());
          setIe(d.estabelecimento.inscricoes_estaduais?.[0]?.inscricao_estadual || '');
        })
        .catch(() => {});
    }
  }, [cnpj, tipoPessoa]);

  // Submissão de novo ou edição
  async function handleSubmit() {
    const payload = {
      id_cliente: clienteId || undefined,
      tipo_pessoa: tipoPessoa,
      nome,
      cpf,
      cnpj,
      nome_fantasia: nomeFantasia,
      inscricao_estadual: ie,
      inscricao_municipal: im,
      email,
      whatsapp,
      telefone1,
      telefone2,
      cep,
      endereco,
      numero_endereco: numeroEndereco,
      bairro,
      municipio,
      cod_ibge: codIbge,
      complemento,
      uf,
      status,
    };
    const url = clienteId ? '/api/clientes/salvarEdicaoCliente' : '/api/clientes/criarCliente';
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      alert(clienteId ? 'Cliente atualizado!' : 'Cliente criado!');
      onClose();
    } else {
      alert('Erro ao salvar cliente.');
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-2xl overflow-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-xl font-bold">
            {clienteId ? 'Editar Cliente' : 'Novo Cliente'}
          </h4>
          <button onClick={onClose} className="text-2xl leading-none cursor-pointer">×</button>
        </div>
        <div className="space-y-4">
          {/* Tipo Pessoa */}
          <div>
            <label className="block text-sm">Tipo Cliente</label>
            <select
              value={tipoPessoa}
              onChange={e => setTipoPessoa(e.target.value)}
              className="border p-2 rounded w-full"
            >
              <option value="PESSOA FISICA">PESSOA FÍSICA</option>
              <option value="PESSOA JURIDICA">PESSOA JURÍDICA</option>
            </select>
          </div>
          {/* Campos Gerais */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm">{tipoPessoa === 'PESSOA JURIDICA' ? 'Razão Social' : 'Nome'}</label>
              <input
                type="text"
                value={nome}
                onChange={e => setNome(e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>
            <div>
              <label className="block text-sm">{tipoPessoa === 'PESSOA JURIDICA' ? 'CNPJ' : 'CPF'}</label>
              <input
                type="text"
                value={tipoPessoa === 'PESSOA JURIDICA' ? cnpj : cpf}
                onChange={e => tipoPessoa === 'PESSOA JURIDICA' ? setCnpj(e.target.value) : setCpf(e.target.value)}
                className="border p-2 rounded w-full"
                maxLength={tipoPessoa === 'PESSOA JURIDICA' ? 14 : 11}
              />
            </div>
          </div>
          {/* PJ Específicos */}
          {tipoPessoa === 'PESSOA JURIDICA' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm">Nome Fantasia</label>
                  <input
                    type="text"
                    value={nomeFantasia}
                    onChange={e => setNomeFantasia(e.target.value)}
                    className="border p-2 rounded w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm">Inscrição Estadual</label>
                  <input
                    type="text"
                    value={ie}
                    onChange={e => setIe(e.target.value)}
                    className="border p-2 rounded w-full"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm">Inscrição Municipal</label>
                <input
                  type="text"
                  value={im}
                  onChange={e => setIm(e.target.value)}
                  className="border p-2 rounded w-full"
                />
              </div>
            </div>
          )}
          {/* Contato */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>
            <div>
              <label className="block text-sm">WhatsApp</label>
              <input
                type="text"
                value={whatsapp}
                onChange={e => setWhatsapp(e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm">Telefone 1</label>
              <input
                type="text"
                value={telefone1}
                onChange={e => setTelefone1(e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>
            <div>
              <label className="block text-sm">Telefone 2</label>
              <input
                type="text"
                value={telefone2}
                onChange={e => setTelefone2(e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>
          </div>
          {/* Endereço */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm">CEP</label>
              <input
                type="text"
                value={cep}
                onChange={e => setCep(e.target.value)}
                className="border p-2 rounded w-full"
                maxLength={8}
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm">Endereço</label>
              <input
                type="text"
                value={endereco}
                onChange={e => setEndereco(e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm">Número</label>
              <input
                type="text"
                value={numeroEndereco}
                onChange={e => setNumeroEndereco(e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>
            <div>
              <label className="block text-sm">Bairro</label>
              <input
                type="text"
                value={bairro}
                onChange={e => setBairro(e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>
            <div>
              <label className="block text-sm">Cidade</label>
              <input
                type="text"
                value={municipio}
                onChange={e => setMunicipio(e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm">Complemento</label>
              <input
                type="text"
                value={complemento}
                onChange={e => setComplemento(e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm">UF</label>
              <input
                type="text"
                value={uf}
                onChange={e => setUf(e.target.value)}
                className="border p-2 rounded w-full"
              />
            </div>
          </div>
          {/* Status */}
          <div>
            <label className="block text-sm">Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="border p-2 rounded w-full"
            >
              <option value="ATIVO">ATIVO</option>
              <option value="INATIVO">INATIVO</option>
              <option value="RESTRICAO">RESTRIÇÃO</option>
            </select>
          </div>
          {/* Veículos vinculados em edição */}
          {clienteId && veiculos.length > 0 && (
            <div>
              <label className="block text-sm font-bold">Veículos do Cliente:</label>
              <ul className="list-disc ml-6">
                {veiculos.map(v => <li key={v.id_veiculo}>{v.placa}</li>)}
              </ul>
            </div>
          )}
        </div>
        {/* Ações */}
        <div className="mt-6 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >Cancelar</button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >Salvar</button>
        </div>
      </div>
    </div>
  );
}
