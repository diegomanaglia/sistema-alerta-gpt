import { useState } from "react";
const ITEM_VAZIO = { sku: "", descricao: "", qtd: 1, valor: 0, total: 0, produtoId: null };

export function useProdutosOS(initItens = [ITEM_VAZIO]) {
  const [itens, setItens] = useState(initItens);

  function adicionarItem() {
    setItens((prev) => [...prev, { ...ITEM_VAZIO }]);
  }
  function removerItem(idx) {
    setItens((prev) => {
      const nova = prev.filter((_, i) => i !== idx);
      return nova.length ? nova : [ITEM_VAZIO];
    });
  }
  function atualizarItem(idx, campo, valor) {
    setItens((prev) =>
      prev.map((item, i) =>
        i === idx
          ? {
              ...item,
              [campo]: valor,
              total:
                campo === "qtd" || campo === "valor"
                  ? campo === "qtd"
                    ? valor * item.valor
                    : item.qtd * valor
                  : item.total
            }
          : item
      )
    );
  }
  async function buscarProdutoPorSku(idx, sku) {
    if (!sku) return;
    try {
      const res = await fetch(`/api/produtos/getProdutoBySku/${sku}`);
      if (!res.ok) throw new Error("Não encontrado");
      const prod = await res.json();
      setItens((prev) => {
        const c = [...prev];
        c[idx].sku = prod.sku || "";
        c[idx].descricao = prod.descricao || "";
        c[idx].valor = parseFloat(prod.valor_venda) || 0;
        c[idx].produtoId = prod.id;
        c[idx].total = c[idx].qtd * c[idx].valor;
        return c;
      });
    } catch {
      setItens((prev) => {
        const c = [...prev];
        c[idx].sku = "";
        c[idx].descricao = "";
        c[idx].valor = 0;
        c[idx].produtoId = null;
        c[idx].total = 0;
        return c;
      });
      alert("Produto não encontrado!");
    }
  }
  return { itens, setItens, adicionarItem, removerItem, atualizarItem, buscarProdutoPorSku };
}
