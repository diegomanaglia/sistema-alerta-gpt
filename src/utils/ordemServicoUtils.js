export function calcularTotal(itens, desconto) {
  return (Array.isArray(itens)
    ? itens.reduce((acc, i) => acc + (i.total || 0), 0)
    : 0) - Number(desconto || 0);
}
export function statusDescricao({ emAndamento, fechada, cancelada }) {
  if (emAndamento) return "EM ANDAMENTO";
  if (fechada) return "FECHADA";
  if (cancelada) return "CANCELADA";
  return "";
}
