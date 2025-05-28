// src/components/ModalProduto.jsx
import React, { useState, useEffect } from 'react';

export default function ModalProduto({ produtoId, isOpen, onClose }) {
  const [sku, setSku] = useState('');
  const [apelido, setApelido] = useState('');
  const [marca, setMarca] = useState('');
  const [marcas, setMarcas] = useState([]);
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [subcategoria, setSubcategoria] = useState('');
  const [subcategorias, setSubcategorias] = useState([]);
  const [viscosidade, setViscosidade] = useState('');
  const [viscosidades, setViscosidades] = useState([]);
  const [codigoBarras, setCodigoBarras] = useState('');
  const [valorCusto, setValorCusto] = useState('');
  const [valorVenda, setValorVenda] = useState('');
  const [qtdDisponivel, setQtdDisponivel] = useState('');
  const [qtdMinima, setQtdMinima] = useState('');
  const [qtdIdeal, setQtdIdeal] = useState('');
  const [obs, setObs] = useState('');
  const [status, setStatus] = useState('');
  const statusOptions = ['ATIVO', 'INATIVO', 'RESTRIÇÃO'];

  useEffect(() => {
    if (!isOpen) return;
    // Carrega dados iniciais
    async function loadData() {
      // Produto
      const resProd = await fetch(`/api/produtos/getUmProduto/${produtoId}`);
      const prod = await resProd.json();
      setSku(prod.sku);
      setApelido(prod.apelido);
      setDescricao(prod.descricao);
      setCategoria(prod.categoria);
      setSubcategoria(prod.subcategoria);
      setViscosidade(prod.viscosidade);
      setCodigoBarras(prod.cod_barras);
      setValorCusto(prod.custo);
      setValorVenda(prod.valor_venda);
      setQtdDisponivel(prod.qtd_estoque);
      setQtdMinima(prod.qtd_minima);
      setQtdIdeal(prod.qtd_ideal);
      setObs(prod.observacoes);
      setStatus(prod.status);

      // Marcas
      const resMarcas = await fetch('/api/produtos/getMarcas');
      setMarcas(await resMarcas.json());
      setMarca(prod.marca);

      // Categorias
      const resCats = await fetch('/api/produtos/getCategorias');
      setCategorias(await resCats.json());

      // Subcategorias
      const resSub = await fetch(`/api/produtos/getSubCategoriaByCategoriaId/${prod.categoria}`);
      setSubcategorias(await resSub.json());

      // Viscosidades (se categoria óleo)
      if (prod.categoria === 1) {
        const resVis = await fetch('/api/produtos/getViscosidades');
        setViscosidades(await resVis.json());
      }
    }
    loadData();
  }, [isOpen, produtoId]);

  // Ao mudar categoria, atualiza subcategorias e viscosidades
  useEffect(() => {
    async function updateDeps() {
      if (!categoria) return;
      const resSub = await fetch(`/api/produtos/getSubCategoriaByCategoriaId/${categoria}`);
      setSubcategorias(await resSub.json());
      if (categoria === 1) {
        const resVis = await fetch('/api/produtos/getViscosidades');
        setViscosidades(await resVis.json());
      } else {
        setViscosidades([]);
        setViscosidade('');
      }
    }
    updateDeps();
  }, [categoria]);

  async function handleSave() {
    const payload = {
      id: produtoId,
      sku,
      apelido,
      marca: parseInt(marca),
      descricao,
      categoria: parseInt(categoria),
      subcategoria: parseInt(subcategoria),
      viscosidade,
      codigo_barras: codigoBarras,
      valor_custo: parseFloat(valorCusto),
      valor_venda: parseFloat(valorVenda),
      qtd_disponivel: parseFloat(qtdDisponivel),
      qtd_minima: parseFloat(qtdMinima),
      qtd_ideal: parseFloat(qtdIdeal),
      observacoes: obs,
      status
    };
    await fetch('/api/produtos/editarProduto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    onClose();
    window.location.href = `/produtos?q=${produtoId}`;
  }

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6 overflow-auto max-h-full">
        <button onClick={onClose} className="float-right text-gray-500 hover:text-gray-700">&times;</button>
        <h4 className="text-xl font-bold mb-4">Editar Produto</h4>
        <div className="space-y-4">
          {/* Código / SKU */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="sku" className="block text-sm font-medium">Código / SKU</label>
              <input id="sku" type="text" value={sku} onChange={e => setSku(e.target.value)} className="mt-1 block w-full border rounded p-2" />
            </div>
            <div>
              <label htmlFor="apelido" className="block text-sm font-medium">Apelido</label>
              <input id="apelido" type="text" value={apelido} onChange={e => setApelido(e.target.value)} className="mt-1 block w-full border rounded p-2" />
            </div>
          </div>
          {/* Marca / Descrição */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="marca" className="block text-sm font-medium">Marca</label>
              <select id="marca" value={marca} onChange={e => setMarca(e.target.value)} className="mt-1 block w-full border rounded p-2">
                <option value="">Selecionar</option>
                {marcas.map(m => <option key={m.id_marca} value={m.id_marca}>{m.marca}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="descricao" className="block text-sm font-medium">Descrição</label>
              <input id="descricao" type="text" value={descricao} onChange={e => setDescricao(e.target.value)} className="mt-1 block w-full border rounded p-2" />
            </div>
          </div>
          {/* Categoria / Subcategoria */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="categoria" className="block text-sm font-medium">Categoria</label>
              <select id="categoria" value={categoria} onChange={e => setCategoria(e.target.value)} className="mt-1 block w-full border rounded p-2">
                <option value="">Selecionar</option>
                {categorias.map(c => <option key={c.id_categoria} value={c.id_categoria}>{c.categoria}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="subcategoria" className="block text-sm font-medium">Sub-categoria</label>
              <select id="subcategoria" value={subcategoria} onChange={e => setSubcategoria(e.target.value)} className="mt-1 block w-full border rounded p-2">
                <option value="">Selecionar</option>
                {subcategorias.map(s => <option key={s.id_subcategoria} value={s.id_subcategoria}>{s.subcategoria}</option>)}
              </select>
            </div>
          </div>
          {/* Viscosidade */}
          {viscosidades.length > 0 && (
            <div>
              <label htmlFor="viscosidade" className="block text-sm font-medium">Viscosidade</label>
              <select id="viscosidade" value={viscosidade} onChange={e => setViscosidade(e.target.value)} className="mt-1 block w-full border rounded p-2">
                <option value="">Selecionar</option>
                {viscosidades.map(v => <option key={v.viscosidade} value={v.viscosidade}>{v.viscosidade}</option>)}
              </select>
            </div>
          )}
          {/* Código de Barras */}
          <div>
            <label htmlFor="codigo_barras" className="block text-sm font-medium">Código de Barras</label>
            <input id="codigo_barras" type="text" value={codigoBarras} onChange={e => setCodigoBarras(e.target.value)} className="mt-1 block w-full border rounded p-2" />
          </div>
          {/* Valores e Quantidades */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="valor_custo" className="block text-sm font-medium">Valor Custo</label>
              <input id="valor_custo" type="number" value={valorCusto} onChange={e => setValorCusto(e.target.value)} className="mt-1 block w-full border rounded p-2" />
            </div>
            <div>
              <label htmlFor="valor_venda" className="block text-sm font-medium">Valor Venda</label>
              <input id="valor_venda" type="number" value={valorVenda} onChange={e => setValorVenda(e.target.value)} className="mt-1 block w-full border rounded p-2" />
            </div>
            <div>
              <label htmlFor="qtd_disponivel" className="block text-sm font-medium">QTD Disponível</label>
              <input id="qtd_disponivel" type="number" value={qtdDisponivel} onChange={e => setQtdDisponivel(e.target.value)} className="mt-1 block w-full border rounded p-2" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="qtd_minima" className="block text-sm font-medium">QTD Mínima</label>
              <input id="qtd_minima" type="number" value={qtdMinima} onChange={e => setQtdMinima(e.target.value)} className="mt-1 block w-full border rounded p-2" />
            </div>
            <div>
              <label htmlFor="qtd_ideal" className="block text-sm font-medium">QTD Ideal</label>
              <input id="qtd_ideal" type="number" value={qtdIdeal} onChange={e => setQtdIdeal(e.target.value)} className="mt-1 block w-full border rounded p-2" />
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium">Status</label>
              <select id="status" value={status} onChange={e => setStatus(e.target.value)} className="mt-1 block w-full border rounded p-2">
                <option value="">Selecionar</option>
                {statusOptions.map(st => <option key={st} value={st}>{st}</option>)}
              </select>
            </div>
          </div>
          {/* Observações */}
          <div>
            <label htmlFor="obs" className="block text-sm font-medium">Observações</label>
            <input id="obs" type="text" value={obs} onChange={e => setObs(e.target.value)} className="mt-1 block w-full border rounded p-2" />
          </div>
          {/* Botão Salvar */}
          <div className="mt-6 text-right">
            <button onClick={handleSave} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Salvar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
