import { Input } from "@/components/ui/input"
import { type SelectedOrderItem } from "@/helpers/order"
import { type Category, type Product } from "@/lib/data-schema"

import { SelectableProductCard } from "./selectable-product-card"
import { SelectedOrderItemsList } from "./selected-order-items-list"

type OrderItemsPickerProps = {
  allCategoriesFilter: string
  categories: Category[]
  filteredProducts: Product[]
  onCategoryFilterChange: (categoryId: string) => void
  onProductNameFilterChange: (name: string) => void
  onProductToggle: (product: Product, checked: boolean) => void
  onSelectedItemChange: (
    productId: string,
    field: "observation" | "quantity",
    value: string
  ) => void
  productCategories: Category[]
  productNameFilter: string
  products: Product[]
  selectedCategoryId: string
  selectedItems: SelectedOrderItem[]
}

export function OrderItemsPicker({
  allCategoriesFilter,
  categories,
  filteredProducts,
  onCategoryFilterChange,
  onProductNameFilterChange,
  onProductToggle,
  onSelectedItemChange,
  productCategories,
  productNameFilter,
  products,
  selectedCategoryId,
  selectedItems,
}: OrderItemsPickerProps) {
  return (
    <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
      <div className="flex flex-col gap-3 border-b border-border/70 pb-4">
        <span className="text-xs font-medium">Itens</span>
        <div className="grid gap-3 md:grid-cols-[1fr_14rem]">
          <div className="grid gap-2">
            <label className="text-xs font-medium" htmlFor="productNameFilter">
              Produto
            </label>
            <Input
              id="productNameFilter"
              onChange={(event) =>
                onProductNameFilterChange(event.target.value)
              }
              placeholder="Pesquisar por nome"
              value={productNameFilter}
            />
          </div>

          <div className="grid gap-2">
            <label
              className="text-xs font-medium"
              htmlFor="productCategoryFilter"
            >
              Categoria
            </label>
            <select
              className="h-9 w-full rounded-md border border-input bg-input/20 px-3 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
              id="productCategoryFilter"
              onChange={(event) => onCategoryFilterChange(event.target.value)}
              value={selectedCategoryId}
            >
              <option value={allCategoriesFilter}>Todas</option>
              {productCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <SelectedOrderItemsList
        products={products}
        selectedItems={selectedItems}
      />

      <div className="mt-4 max-h-80 overflow-y-auto pr-1">
        <ProductPickerResults
          categories={categories}
          filteredProducts={filteredProducts}
          onProductToggle={onProductToggle}
          onSelectedItemChange={onSelectedItemChange}
          products={products}
          selectedItems={selectedItems}
        />
      </div>
    </div>
  )
}

type ProductPickerResultsProps = Pick<
  OrderItemsPickerProps,
  | "categories"
  | "filteredProducts"
  | "onProductToggle"
  | "onSelectedItemChange"
  | "products"
  | "selectedItems"
>

function ProductPickerResults({
  categories,
  filteredProducts,
  onProductToggle,
  onSelectedItemChange,
  products,
  selectedItems,
}: ProductPickerResultsProps) {
  if (!products.length) {
    return (
      <p className="rounded-xl border border-warning/20 bg-warning-muted/45 p-4 text-sm text-muted-foreground">
        Cadastre produtos antes de montar os itens do pedido.
      </p>
    )
  }

  if (!filteredProducts.length) {
    return (
      <p className="rounded-xl border border-warning/20 bg-warning-muted/45 p-4 text-sm text-muted-foreground">
        Nenhum produto encontrado para os filtros informados.
      </p>
    )
  }

  return (
    <div className="grid gap-3">
      {filteredProducts.map((product) => (
        <SelectableProductCard
          categories={categories}
          key={product.id}
          onProductToggle={onProductToggle}
          onSelectedItemChange={onSelectedItemChange}
          product={product}
          selectedItem={selectedItems.find(
            (item) => item.productId === product.id
          )}
        />
      ))}
    </div>
  )
}
