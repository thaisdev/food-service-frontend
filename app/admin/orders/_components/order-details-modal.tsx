import Link from "next/link"
import { RiCloseLine } from "@remixicon/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatCurrency } from "@/helpers/currency"
import { formatDatetime } from "@/helpers/datetime"
import { formatOrderItems, formatTable } from "@/helpers/order"
import { type Order } from "@/lib/data-schema"

import { getStatusClasses } from "../_helpers/order-status-style"

type OrderDetailsModalProps = {
  closeHref?: string
  order: Order
}

export function OrderDetailsModal({
  closeHref = "/admin/orders",
  order,
}: OrderDetailsModalProps) {
  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/45 p-4 backdrop-blur-sm"
      role="dialog"
    >
      <Card className="w-full max-w-xl rounded-2xl border border-info/15 p-0 shadow-xl">
        <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-info/15 bg-info-muted/45 p-6">
          <div>
            <CardTitle className="text-lg font-semibold">
              Pedido {order.id}
            </CardTitle>
            <CardDescription className="text-sm">
              Detalhes cadastrados para acompanhamento administrativo.
            </CardDescription>
          </div>
          <Button asChild size="icon-sm" title="Fechar modal" variant="ghost">
            <Link href={closeHref}>
              <RiCloseLine aria-hidden />
            </Link>
          </Button>
        </CardHeader>

        <CardContent className="space-y-4 p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["Cliente", order.customer],
              ["Mesa", formatTable(order.table)],
              ["Total", formatCurrency(order.total)],
              ["Hora", formatDatetime(order.datetime)],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl border border-border/70 bg-muted/35 p-4"
              >
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="mt-1 text-sm font-medium">{value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-border/70 bg-muted/35 p-4">
            <p className="text-xs text-muted-foreground">Itens</p>
            <p className="mt-1 text-sm font-medium">
              {formatOrderItems(order.items)}
            </p>
          </div>

          <Badge className={getStatusClasses(order.status)}>
            {order.status}
          </Badge>
        </CardContent>
      </Card>
    </div>
  )
}
