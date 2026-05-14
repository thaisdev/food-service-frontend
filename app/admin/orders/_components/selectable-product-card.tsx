import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { formatProductPrice } from "@/helpers/currency"
import { type SelectedOrderItem } from "@/helpers/order"
import {
  getProductCategoryName,
  type Category,
  type Product,
} from "@/lib/data-schema"

type SelectableProductCardProps = {
  categories: Category[]
  onProductToggle: (product: Product, checked: boolean) => void
  onSelectedItemChange: (
    productId: string,
    field: "observation" | "quantity",
    value: string
  ) => void
  product: Product
  selectedItem?: SelectedOrderItem
}

export function SelectableProductCard({
  categories,
  onProductToggle,
  onSelectedItemChange,
  product,
  selectedItem,
}: SelectableProductCardProps) {
  const isSelected = Boolean(selectedItem)

  return (
    <div className="rounded-xl border border-border/70 bg-card/80 p-3">
      <label
        className="flex min-w-0 items-start gap-3"
        htmlFor={`order-product-${product.id}`}
      >
        <Checkbox
          checked={isSelected}
          id={`order-product-${product.id}`}
          onCheckedChange={(checked) =>
            onProductToggle(product, checked === true)
          }
        />
        <span className="min-w-0">
          <span className="block text-sm font-medium">{product.name}</span>
          <span className="mt-1 block text-xs text-muted-foreground">
            {formatProductPrice(product.price)}
          </span>
          <span className="mt-1 block text-xs text-muted-foreground">
            {getProductCategoryName(product, categories)}
          </span>
        </span>
      </label>

      {selectedItem ? (
        <div className="mt-3 grid gap-3 md:grid-cols-[8rem_1fr]">
          <div className="grid gap-2">
            <label
              className="text-xs font-medium"
              htmlFor={`order-product-quantity-${product.id}`}
            >
              Quantidade
            </label>
            <Input
              id={`order-product-quantity-${product.id}`}
              min={1}
              onChange={(event) =>
                onSelectedItemChange(product.id, "quantity", event.target.value)
              }
              type="number"
              value={selectedItem.quantity}
            />
          </div>

          <div className="grid gap-2">
            <label
              className="text-xs font-medium"
              htmlFor={`order-product-observation-${product.id}`}
            >
              Observações
            </label>
            <Input
              id={`order-product-observation-${product.id}`}
              onChange={(event) =>
                onSelectedItemChange(
                  product.id,
                  "observation",
                  event.target.value
                )
              }
              placeholder="Ex: Sem cebola"
              value={selectedItem.observation}
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}
