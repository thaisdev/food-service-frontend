"use client"

import { useEffect, useMemo, useState, useTransition } from "react"

import { OrderStatus, type Order } from "@/lib/data-schema"

import {
  getTodayDateFilterValue,
  parsePaginatedOrders,
  requestOrders,
  type OrderFilter,
} from "../_helpers/orders-manager"
import { CancelOrderModal } from "./cancel-order-modal"
import { OrdersFilters } from "./orders-filters"
import { OrdersPageHeader } from "./orders-page-header"
import { OrdersTable } from "./orders-table"

const ORDERS_PAGE_SIZE = 10

type OrdersManagerProps = {
  initialOrders: Order[]
}

export function OrdersManager({ initialOrders }: OrdersManagerProps) {
  const [orders, setOrders] = useState(initialOrders.slice(0, ORDERS_PAGE_SIZE))
  const [filter, setFilter] = useState<OrderFilter>("Todos")
  const [dateFilter, setDateFilter] = useState("")
  const todayDateFilter = useMemo(() => getTodayDateFilterValue(), [])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(initialOrders.length)
  const [refreshKey, setRefreshKey] = useState(0)
  const [orderPendingCancel, setOrderPendingCancel] = useState<Order | null>(
    null
  )
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    function updateOrders() {
      setCurrentPage(1)
      setRefreshKey((key) => key + 1)
      setMessage(null)
    }

    window.addEventListener("admin-orders:changed", updateOrders)

    return () => {
      window.removeEventListener("admin-orders:changed", updateOrders)
    }
  }, [])

  useEffect(() => {
    const searchParams = new URLSearchParams({
      page: String(currentPage),
      pageSize: String(ORDERS_PAGE_SIZE),
    })

    if (filter !== "Todos") {
      searchParams.set("status", filter)
    }

    if (dateFilter) {
      searchParams.set("date", dateFilter)
    }

    fetch(`/api/orders?${searchParams.toString()}`, { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        const paginatedOrders = parsePaginatedOrders(data)

        if (!paginatedOrders) {
          return
        }

        setOrders(paginatedOrders.items)
        setTotalItems(paginatedOrders.pagination.totalItems)
        setCurrentPage(paginatedOrders.pagination.page)
      })
  }, [currentPage, dateFilter, filter, refreshKey])

  function updateDateFilter(value: string) {
    setDateFilter(value)
    setCurrentPage(1)
  }

  function updateFilter(nextFilter: OrderFilter) {
    setFilter(nextFilter)
    setCurrentPage(1)
  }

  function confirmOrderCancellation(order: Order) {
    setMessage(null)

    startTransition(async () => {
      try {
        const nextOrders = await requestOrders("/api/orders", {
          body: JSON.stringify({
            id: order.id,
            status: OrderStatus.Canceled,
            table: order.table,
          }),
          method: "PUT",
        })

        setOrders(nextOrders.slice(0, ORDERS_PAGE_SIZE))
        setCurrentPage(1)
        setRefreshKey((key) => key + 1)
        setOrderPendingCancel(null)
        setMessage("Pedido cancelado.")
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Erro inesperado.")
        setOrderPendingCancel(null)
      }
    })
  }

  return (
    <main className="min-h-svh bg-[image:var(--page-gradient)] px-6 py-10">
      <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-8">
        <OrdersPageHeader />

        {message ? (
          <p className="rounded-md border border-info/20 bg-info-muted/40 px-3 py-2 text-xs text-muted-foreground">
            {message}
          </p>
        ) : null}

        <OrdersTable
          currentPage={currentPage}
          isPending={isPending}
          onCancelClick={setOrderPendingCancel}
          onPageChange={setCurrentPage}
          orders={orders}
          pageSize={ORDERS_PAGE_SIZE}
          totalItems={totalItems}
          toolbar={
            <OrdersFilters
              dateFilter={dateFilter}
              filter={filter}
              onDateFilterChange={updateDateFilter}
              onFilterChange={updateFilter}
              todayDateFilter={todayDateFilter}
            />
          }
        />
      </div>

      <CancelOrderModal
        isPending={isPending}
        onClose={() => setOrderPendingCancel(null)}
        onConfirm={confirmOrderCancellation}
        order={orderPendingCancel}
      />
    </main>
  )
}
