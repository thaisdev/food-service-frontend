import { RiCloseLine } from "@remixicon/react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatOrderItems } from "@/helpers/order"
import { type Order } from "@/lib/data-schema"

type CancelOrderModalProps = {
  isPending: boolean
  onClose: () => void
  onConfirm: (order: Order) => void
  order: Order | null
}

export function CancelOrderModal({
  isPending,
  onClose,
  onConfirm,
  order,
}: CancelOrderModalProps) {
  if (!order) {
    return null
  }

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/45 p-4 backdrop-blur-sm"
      role="dialog"
    >
      <Card className="w-full max-w-md rounded-2xl border border-destructive/20 p-0 shadow-xl">
        <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-destructive/15 bg-destructive-muted/45 p-6">
          <div>
            <CardTitle className="text-lg font-semibold">
              Cancelar pedido
            </CardTitle>
            <CardDescription className="text-sm">
              O pedido continuará na listagem com status cancelado.
            </CardDescription>
          </div>
          <Button
            disabled={isPending}
            onClick={onClose}
            size="icon-sm"
            title="Fechar modal"
            type="button"
            variant="ghost"
          >
            <RiCloseLine aria-hidden />
          </Button>
        </CardHeader>

        <CardContent className="space-y-4 p-6">
          <div className="rounded-2xl border border-border/70 bg-muted/35 p-4">
            <p className="text-sm font-medium">
              {order.id} · {order.customer}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatOrderItems(order.items)}
            </p>
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            <Button
              disabled={isPending}
              onClick={onClose}
              type="button"
              variant="outline"
            >
              Voltar
            </Button>
            <Button
              disabled={isPending}
              onClick={() => onConfirm(order)}
              type="button"
              variant="destructive"
            >
              <RiCloseLine aria-hidden />
              {isPending ? "Cancelando..." : "Cancelar pedido"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
