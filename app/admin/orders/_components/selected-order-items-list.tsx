import { formatCurrency, formatProductPrice } from "@/helpers/currency"
import { type SelectedOrderItem } from "@/helpers/order"
import { type Product } from "@/lib/data-schema"

type SelectedOrderItemsListProps = {
  products: Product[]
  selectedItems: SelectedOrderItem[]
}

export function SelectedOrderItemsList({
  products,
  selectedItems,
}: SelectedOrderItemsListProps) {
  if (!selectedItems.length) {
    return null
  }

  return (
    <div className="mt-4 grid gap-3 border-b border-border/70 pb-4">
      <span className="text-xs font-medium">Itens selecionados</span>
      <div className="grid gap-3">
        {selectedItems.map((item) => (
          <SelectedOrderItemCard
            item={item}
            key={`selected-${item.productId}`}
            products={products}
          />
        ))}
      </div>
    </div>
  )
}

type SelectedOrderItemCardProps = {
  item: SelectedOrderItem
  products: Product[]
}

function SelectedOrderItemCard({ item, products }: SelectedOrderItemCardProps) {
  const product = products.find(
    (currentProduct) => currentProduct.id === item.productId
  )

  if (!product) {
    return null
  }

  const quantity =
    typeof item.quantity === "number" && Number.isFinite(item.quantity)
      ? item.quantity
      : 0

  return (
    <div className="rounded-xl border border-info/15 bg-info-muted/30 p-3">
      <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium">{product.name}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Quantidade: {item.quantity || "-"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Observação: {item.observation.trim() || "Sem observação"}
          </p>
        </div>
        <div className="text-sm font-medium md:text-right">
          <p>{formatProductPrice(product.price)}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Subtotal: {formatCurrency(product.price * quantity)}
          </p>
        </div>
      </div>
    </div>
  )
}
