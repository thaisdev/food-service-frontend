"use client"

import { useRouter } from "next/navigation"
import { FormEvent, useMemo, useState, useTransition } from "react"

import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/helpers/currency"
import {
  calculateOrderTotal,
  createOrderItems,
  type SelectedOrderItem,
} from "@/helpers/order"
import { getEditableOrderStatuses } from "@/helpers/order-status"
import { normalizeSearchText } from "@/lib/api-pagination"
import {
  OrderStatus,
  ProductStatus,
  ProductStock,
  type Category,
  type Order,
  type Product,
} from "@/lib/data-schema"

import {
  createOrderSavePayload,
  getSubmitAction,
  hasInvalidQuantity,
  requestOrderSave,
} from "../_helpers/order-form"
import { AdminOrderFormModalHeader } from "./admin-order-form-modal-header"
import { EditOrderFields } from "./edit-order-fields"
import { NewOrderFields } from "./new-order-fields"
import { OrderFormActions } from "./order-form-actions"
import { OrderFormMessage } from "./order-form-message"
import { OrderItemsPicker } from "./order-items-picker"

const ALL_CATEGORIES_FILTER = "all"

type AdminOrderFormModalProps = {
  categories?: Category[]
  closeHref?: string
  order?: Order
  products?: Product[]
}

export function AdminOrderFormModal({
  categories = [],
  closeHref = "/admin/orders",
  order,
  products = [],
}: AdminOrderFormModalProps) {
  const router = useRouter()
  const [customer, setCustomer] = useState("")
  const [table, setTable] = useState<number | "">(order?.table ?? 1)
  const [status, setStatus] = useState(order?.status ?? OrderStatus.Waiting)
  const [selectedItems, setSelectedItems] = useState<SelectedOrderItem[]>([])
  const [productNameFilter, setProductNameFilter] = useState("")
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    ALL_CATEGORIES_FILTER
  )
  const [message, setMessage] = useState<string | null>(null)
  const [isErrorMessage, setIsErrorMessage] = useState(false)
  const [isPending, startTransition] = useTransition()

  const orderItems = useMemo(
    () => createOrderItems(selectedItems, products),
    [products, selectedItems]
  )
  const calculatedTotal = useMemo(
    () => calculateOrderTotal(orderItems),
    [orderItems]
  )
  const editableStatuses = useMemo(
    () => (order ? getEditableOrderStatuses(order.status) : []),
    [order]
  )
  const visibleOrderProducts = useMemo(
    () =>
      products.filter((product) => product.status !== ProductStatus.Inactive),
    [products]
  )
  const productCategories = useMemo(
    () =>
      categories.filter((category) =>
        visibleOrderProducts.some(
          (product) => product.categoryId === category.id
        )
      ),
    [categories, visibleOrderProducts]
  )
  const filteredProducts = useMemo(() => {
    const normalizedProductNameFilter = normalizeSearchText(productNameFilter)

    return visibleOrderProducts.filter((product) => {
      const matchesName =
        !normalizedProductNameFilter ||
        normalizeSearchText(product.name).includes(normalizedProductNameFilter)
      const matchesCategory =
        selectedCategoryId === ALL_CATEGORIES_FILTER ||
        product.categoryId === selectedCategoryId

      return matchesName && matchesCategory
    })
  }, [productNameFilter, selectedCategoryId, visibleOrderProducts])

  function updateTable(value: string) {
    if (!value) {
      setTable("")
      return
    }

    const nextTable = Number(value)

    if (Number.isInteger(nextTable) && nextTable > 0) {
      setTable(nextTable)
    }
  }

  function toggleProduct(product: Product, checked: boolean) {
    if (product.stock === ProductStock.Unavailable) {
      return
    }

    setSelectedItems((currentItems) => {
      if (!checked) {
        return currentItems.filter((item) => item.productId !== product.id)
      }

      if (currentItems.some((item) => item.productId === product.id)) {
        return currentItems
      }

      return [
        ...currentItems,
        {
          observation: "",
          productId: product.id,
          quantity: 1,
        },
      ]
    })
  }

  function updateSelectedItem(
    productId: string,
    field: "observation" | "quantity",
    value: string
  ) {
    setSelectedItems((currentItems) =>
      currentItems.map((item) => {
        if (item.productId !== productId) {
          return item
        }

        if (field === "quantity") {
          if (!value) {
            return {
              ...item,
              quantity: "",
            }
          }

          const quantity = Number(value)

          if (Number.isFinite(quantity) && quantity > 0) {
            return {
              ...item,
              quantity,
            }
          }

          return item
        }

        return {
          ...item,
          observation: value,
        }
      })
    )
  }

  function resetNewOrderForm() {
    setCustomer("")
    setTable(1)
    setSelectedItems([])
    setProductNameFilter("")
    setSelectedCategoryId(ALL_CATEGORIES_FILTER)
  }

  function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(null)
    setIsErrorMessage(false)

    const submitAction = getSubmitAction(event)
    const payload = createOrderSavePayload({
      customer,
      order,
      orderItems,
      status,
      table,
    })

    if (!order && !orderItems.length) {
      setIsErrorMessage(true)
      setMessage("Selecione ao menos um produto para o pedido.")
      return
    }

    if (!order && hasInvalidQuantity(selectedItems)) {
      setIsErrorMessage(true)
      setMessage("Informe a quantidade dos produtos selecionados.")
      return
    }

    startTransition(async () => {
      try {
        const nextOrders = await requestOrderSave(payload)

        if (nextOrders) {
          window.dispatchEvent(
            new CustomEvent<Order[]>("admin-orders:changed", {
              detail: nextOrders,
            })
          )
        }

        if (!order && submitAction === "continue") {
          resetNewOrderForm()
          setIsErrorMessage(false)
          setMessage("Pedido cadastrado. Você pode cadastrar mais pedidos.")
          return
        }

        router.replace(closeHref)
        router.refresh()
      } catch (error) {
        setIsErrorMessage(true)
        setMessage(error instanceof Error ? error.message : "Erro inesperado.")
      }
    })
  }

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/45 p-4 backdrop-blur-sm"
      role="dialog"
    >
      <Card className="max-h-[calc(100svh-2rem)] w-full max-w-2xl overflow-hidden rounded-2xl border border-info/15 p-0 shadow-xl">
        <AdminOrderFormModalHeader
          closeHref={closeHref}
          isEditing={Boolean(order)}
        />

        <CardContent className="max-h-[calc(100svh-9rem)] overflow-y-auto p-6">
          <form className="space-y-4" onSubmit={submitOrder}>
            {order ? (
              <EditOrderFields
                editableStatuses={editableStatuses}
                onStatusChange={setStatus}
                onTableChange={updateTable}
                order={order}
                status={status}
                table={table}
              />
            ) : (
              <>
                <NewOrderFields
                  customer={customer}
                  onCustomerChange={setCustomer}
                  onTableChange={updateTable}
                  table={table}
                />

                <OrderItemsPicker
                  allCategoriesFilter={ALL_CATEGORIES_FILTER}
                  categories={categories}
                  filteredProducts={filteredProducts}
                  onCategoryFilterChange={setSelectedCategoryId}
                  onProductNameFilterChange={setProductNameFilter}
                  onProductToggle={toggleProduct}
                  onSelectedItemChange={updateSelectedItem}
                  productCategories={productCategories}
                  productNameFilter={productNameFilter}
                  products={products}
                  selectedCategoryId={selectedCategoryId}
                  selectedItems={selectedItems}
                />

                <div className="rounded-2xl border border-info/15 bg-info-muted/35 p-4">
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="mt-1 text-sm font-semibold">
                    {formatCurrency(calculatedTotal)}
                  </p>
                </div>
              </>
            )}

            <OrderFormMessage isError={isErrorMessage} message={message} />

            <OrderFormActions
              closeHref={closeHref}
              isEditing={Boolean(order)}
              isPending={isPending}
            />
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
