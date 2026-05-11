export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    currency: "BRL",
    minimumFractionDigits: 2,
    style: "currency",
  }).format(value)
}

export const formatProductPrice = formatCurrency
