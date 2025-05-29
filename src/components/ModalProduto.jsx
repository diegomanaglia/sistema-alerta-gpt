// src/components/ModalProduto.jsx
import React, { useState, useEffect } from 'react';

export default function ModalProduto({ produtoId, isOpen, onClose, refreshList }) {
  // Campos do produto
  const [sku, setSku] = useState('');
  const [apelido, setApelido] = useState('');

  const [marcas, setMarcas] = useState([]);
  const [marca, setMarca] = useState('');
  const [descricao, setDescricao] = useState('');

  const [categorias, setCategorias] = useState([]);
  const [categoria, setCategoria] = useState('');

  const [subcategorias, setSubcategorias] = useState([]);
  const [subcategoria, setSubcategoria] = useState('');

  const [viscosidades, setViscosidades] = useState([]);
  const [viscosidade, setViscosidade] = useState('');

  const [codigoBarras, setCodigoBarras] = useState('');
  const [valorCusto, setValorCusto] = useState('');
  const [valorVenda, setValorVenda] = useState('');
  const [qtdDisponivel, setQtdDisponivel] = useState('');
  const [qtdMinima, setQtdMinima] = useState('');
  const [qtdIdeal, setQtdIdeal] = useState('');
  const [obs, setObs] = useState('');
  const [status, setStatus] = useState('ATIVO');

  // Nested modal state
  const [nestedOpen, setNestedOpen] = useState(false);
  const [nestedType, setNestedType] = useState('');
  const [newValue, setNewValue] = useState('');

  // Carregar listas estáticas
  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/produtos/getMarcas')
      .then(r => r.json()).then(setMarcas);
    fetch('/api/produtos/getCategorias')
      .then(r => r.json()).then(setCategorias);
    if (produtoId) {
      fetch(`/api/produtos/getUmProduto/${produtoId}`)
        .then(r => r.json())
        .then(p => {
          setSku(p.sku);
          setApelido(p.apelido);
          setMarca(String(p.marca));
          setDescricao(p.descricao);
          setCategoria(String(p.categoria));
          setSubcategoria(String(p.subcategoria));
          setViscosidade(p.viscosidade || '');
          setCodigoBarras(p.codigo_barras);
          setValorCusto(p.valor_custo);
          setValorVenda(p.valor_venda);
          setQtdDisponivel(p.qtd_disponivel);
          setQtdMinima(p.qtd_minima);
          setQtdIdeal(p.qtd_ideal);
          setObs(p.obs);
          setStatus(p.status);
        });
    } else {
      // nova criação
      setSku(''); setApelido(''); setMarca(''); setDescricao('');
      setCategoria(''); setSubcategoria(''); setViscosidade('');
      setCodigoBarras(''); setValorCusto(''); setValorVenda('');
      setQtdDisponivel(''); setQtdMinima(''); setQtdIdeal(''); setObs(''); setStatus('ATIVO');
    }
  }, [isOpen, produtoId]);

  // Sempre que categoria mudar, recarrega subcategorias e, se for óleo (id 1), viscosidades
  useEffect(() => {
    if (!isOpen) return;
    if (categoria) {
      fetch(`/api/produtos/getSubCategoriaByCategoriaId/${categoria}`)
        .then(r => r.json()).then(setSubcategorias);
      if (categoria === '1') {
        fetch('/api/produtos/getViscosidades')
          .then(r => r.json()).then(setViscosidades);
      } else {
        setViscosidade('');
      }
    }
  }, [categoria, isOpen]);

  // Nested modal: criar novo item genérico
  async function handleNestedSave() {
    let endpoint = '';
    let body = {};
    switch (nestedType) {
      case 'marca': endpoint = '/api/produtos/salvarMarca'; body = { marca: newValue }; break;
      case 'categoria': endpoint = '/api/produtos/salvarCategoria'; body = { categoria: newValue }; break;
      case 'subcategoria': endpoint = '/api/produtos/salvarSubCategoria'; body = { categoria, subcategoria: newValue }; break;
      case 'viscosidade': endpoint = '/api/produtos/salvarViscosidade'; body = { viscosidade: newValue }; break;
    }
    await fetch(endpoint, {
      method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(body)
    });
    // Recarrega a lista afetada
    if (nestedType === 'marca') fetch('/api/produtos/getMarcas').then(r=>r.json()).then(setMarcas);
    if (nestedType === 'categoria') fetch('/api/produtos/getCategorias').then(r=>r.json()).then(setCategorias);
    if (nestedType === 'subcategoria') fetch(`/api/produtos/getSubCategoriaByCategoriaId/${categoria}`).then(r=>r.json()).then(setSubcategorias);
    if (nestedType === 'viscosidade') fetch('/api/produtos/getViscosidades').then(r=>r.json()).then(setViscosidades);
    setNestedOpen(false);
    setNewValue('');
  }

  // Submeter criação ou edição
  async function handleSubmit() {
    const payload = { sku, apelido, marca: parseInt(marca), descricao, categoria: parseInt(categoria), subcategoria: parseInt(subcategoria), viscosidade, codigo_barras: codigoBarras, valor_custo: parseFloat(valorCusto), valor_venda: parseFloat(valorVenda), qtd_disponivel: parseFloat(qtdDisponivel), qtd_minima: parseFloat(qtdMinima), qtd_ideal: parseFloat(qtdIdeal), obs, status };
    const url = produtoId ? '/api/produtos/editarProduto' : '/api/produtos/criarProduto';
    const res = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ ...payload, id: produtoId }) });
    if (res.ok) {
      alert(produtoId ? 'Produto atualizado!' : 'Produto criado!');
      onClose();
      refreshList();
    } else {
      alert('Erro ao salvar produto.');
    }
  }

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-xl font-bold">{produtoId ? 'Editar Produto' : 'Novo Produto'}</h4>
          <button onClick={onClose} className="text-2xl leading-none cursor-pointer">×</button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div><label className="block text-sm">SKU</label><input value={sku} onChange={e=>setSku(e.target.value)} className="border p-2 rounded w-full"/></div>
            <div><label className="block text-sm">Apelido</label><input value={apelido} onChange={e=>setApelido(e.target.value)} className="border p-2 rounded w-full"/></div>
            <div className="flex items-end space-x-2">
              <div className="flex-1"><label className="block text-sm">Marca</label><select value={marca} onChange={e=>setMarca(e.target.value)} className="border p-2 rounded w-full">
                <option value="">Selecione</option>{marcas.map(m=> <option key={m.id_marca} value={m.id_marca}>{m.marca}</option>)}</select></div>
              <button onClick={()=>{setNestedType('marca');setNestedOpen(true);}} className="text-2xl">＋</button>
            </div>
          </div>
          <div><label className="block text-sm">Descrição</label><input value={descricao} onChange={e=>setDescricao(e.target.value)} className="border p-2 rounded w-full"/></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-end space-x-2">
              <div className="flex-1"><label className="block text-sm">Categoria</label><select value={categoria} onChange={e=>setCategoria(e.target.value)} className="border p-2 rounded w-full">
                <option value="">Selecione</option>{categorias.map(c=> <option key={c.id_categoria} value={c.id_categoria}>{c.categoria}</option>)}</select></div>
              <button onClick={()=>{setNestedType('categoria');setNestedOpen(true);}} className="text-2xl">＋</button>
            </div>
            <div className="flex items-end space-x-2">
              <div className="flex-1"><label className="block text-sm">Subcategoria</label><select value={subcategoria} onChange={e=>setSubcategoria(e.target.value)} className="border p-2 rounded w-full">
                <option value="">Selecione</option>{subcategorias.map(s=> <option key={s.id_subcategoria} value={s.id_subcategoria}>{s.subcategoria}</option>)}</select></div>
              <button onClick={()=>{setNestedType('subcategoria');setNestedOpen(true);}} className="text-2xl">＋</button>
            </div>
            {categoria === '1' && <div className="flex items-end space-x-2">
              <div className="flex-1"><label className="block text-sm">Viscosidade</label><select value={viscosidade} onChange={e=>setViscosidade(e.target.value)} className="border p-2 rounded w-full">
                <option value="">Selecione</option>{viscosidades.map(v=> <option key={v.viscosidade} value={v.viscosidade}>{v.viscosidade}</option>)}</select></div>
              <button onClick={()=>{setNestedType('viscosidade');setNestedOpen(true);}} className="text-2xl">＋</button>
            </div>}
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="block text-sm">Código Barras</label><input value={codigoBarras} onChange={e=>setCodigoBarras(e.target.value)} className="border p-2 rounded w-full"/></div>
            <div><label className="block text-sm">Valor Custo</label><input type="number" value={valorCusto} onChange={e=>setValorCusto(e.target.value)} className="border p-2 rounded w-full"/></div>
            <div><label className="block text-sm">Valor Venda</label><input type="number" value={valorVenda} onChange={e=>setValorVenda(e.target.value)} className="border p-2 rounded w-full"/></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="block text-sm">Qtd Disponível</label><input type="number" value={qtdDisponivel} onChange={e=>setQtdDisponivel(e.target.value)} className="border p-2 rounded w-full"/></div>
            <div><label className="block text-sm">Qtd Mínima</label><input type="number" value={qtdMinima} onChange={e=>setQtdMinima(e.target.value)} className="border p-2 rounded w-full"/></div>
            <div><label className="block text-sm">Qtd Ideal</label><input type="number" value={qtdIdeal} onChange={e=>setQtdIdeal(e.target.value)} className="border p-2 rounded w-full"/></div>
          </div>
          <div><label className="block text-sm">Observações</label><input value={obs} onChange={e=>setObs(e.target.value)} className="border p-2 rounded w-full"/></div>
          <div><label className="block text-sm">Status</label><select value={status} onChange={e=>setStatus(e.target.value)} className="border p-2 rounded w-full">
            <option value="ATIVO">ATIVO</option><option value="INATIVO">INATIVO</option><option value="RESTRIÇÃO">RESTRIÇÃO</option>
          </select></div>
        </div>
        <div className="mt-6 flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cancelar</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Salvar</button>
        </div>
      </div>

      {/* Nested Modal para criação de marca/categoria/subcategoria/viscosidade */}
      {nestedOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg w-full max-w-sm">
            <h4 className="text-lg font-bold mb-2">Cadastro de {nestedType}</h4>
            <input
              type="text"
              value={newValue}
              onChange={e => setNewValue(e.target.value)}
              className="border p-2 rounded w-full mb-4"
              placeholder={`Nova ${nestedType}`}
            />
            <div className="flex justify-end space-x-2">
              <button onClick={() => setNestedOpen(false)} className="px-3 py-1 bg-gray-200 rounded">Cancelar</button>
              <button onClick={handleNestedSave} className="px-3 py-1 bg-green-600 text-white rounded">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
