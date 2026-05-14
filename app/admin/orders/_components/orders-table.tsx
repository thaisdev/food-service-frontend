import { TablePagination } from "@/components/table-pagination"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { type Order } from "@/lib/data-schema"

import { OrderTableRow } from "./order-table-row"

type OrdersTableProps = {
  currentPage: number
  isPending: boolean
  onCancelClick: (order: Order) => void
  onPageChange: (page: number) => void
  orders: Order[]
  pageSize: number
  totalItems: number
  toolbar: React.ReactNode
}

export function OrdersTable({
  currentPage,
  isPending,
  onCancelClick,
  onPageChange,
  orders,
  pageSize,
  toolbar,
  totalItems,
}: OrdersTableProps) {
  return (
    <section>
      <Card className="rounded-3xl border border-info/15 p-0 shadow-sm">
        <CardHeader className="flex flex-col gap-4 border-b border-info/15 bg-info-muted/45 p-6">
          <div>
            <CardTitle className="text-lg font-semibold">
              Pedidos cadastrados
            </CardTitle>
            <CardDescription className="text-sm">
              Visualize, filtre e mantenha a fila operacional do sistema.
            </CardDescription>
          </div>
          {toolbar}
        </CardHeader>

        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="px-6">Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Itens</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead className="px-6 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <OrderTableRow
                  isPending={isPending}
                  key={order.id}
                  onCancelClick={onCancelClick}
                  order={order}
                />
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <TablePagination
          currentPage={currentPage}
          onPageChange={onPageChange}
          pageSize={pageSize}
          totalItems={totalItems}
        />
      </Card>
    </section>
  )
}
