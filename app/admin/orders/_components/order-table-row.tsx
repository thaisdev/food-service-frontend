import Link from "next/link"
import { RiCloseLine, RiEditLine, RiEyeLine } from "@remixicon/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TableCell, TableRow } from "@/components/ui/table"
import { formatCurrency } from "@/helpers/currency"
import { formatDatetime } from "@/helpers/datetime"
import { formatOrderItems, formatTable } from "@/helpers/order"
import { type Order } from "@/lib/data-schema"

import { getOrderActionAvailability } from "../_helpers/orders-manager"
import { getStatusClasses } from "../_helpers/order-status-style"

type OrderTableRowProps = {
  isPending: boolean
  onCancelClick: (order: Order) => void
  order: Order
}

export function OrderTableRow({
  isPending,
  onCancelClick,
  order,
}: OrderTableRowProps) {
  const actionAvailability = getOrderActionAvailability(order)

  return (
    <TableRow>
      <TableCell className="px-6">
        <p className="font-medium">{order.id}</p>
        <p className="text-xs text-muted-foreground">
          {formatTable(order.table)}
        </p>
      </TableCell>
      <TableCell>
        <p className="font-medium">{order.customer}</p>
        <p className="text-xs text-muted-foreground">
          {formatTable(order.table)}
        </p>
      </TableCell>
      <TableCell className="min-w-72">
        <p className="text-sm leading-6">{formatOrderItems(order.items)}</p>
      </TableCell>
      <TableCell className="font-medium">
        {formatCurrency(order.total)}
      </TableCell>
      <TableCell>
        <Badge className={getStatusClasses(order.status)}>{order.status}</Badge>
      </TableCell>
      <TableCell className="font-medium">
        {formatDatetime(order.datetime)}
      </TableCell>
      <TableCell className="px-6 text-right">
        <div className="inline-flex gap-1">
          <Button asChild size="icon-sm" title="Ver pedido" variant="ghost">
            <Link
              href={`/admin/orders/details/${encodeURIComponent(order.id)}`}
            >
              <RiEyeLine aria-hidden />
            </Link>
          </Button>
          <OrderEditAction
            actionTitle={actionAvailability.editTitle}
            order={order}
            canEdit={actionAvailability.canEdit}
          />
          <Button
            disabled={isPending || !actionAvailability.canCancel}
            onClick={() => onCancelClick(order)}
            size="icon-sm"
            title={actionAvailability.cancelTitle}
            type="button"
            variant="destructive"
          >
            <RiCloseLine aria-hidden />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}

type OrderEditActionProps = {
  actionTitle: string
  canEdit: boolean
  order: Order
}

function OrderEditAction({
  actionTitle,
  canEdit,
  order,
}: OrderEditActionProps) {
  if (!canEdit) {
    return (
      <Button
        disabled
        size="icon-sm"
        title={actionTitle}
        type="button"
        variant="ghost"
      >
        <RiEditLine aria-hidden />
      </Button>
    )
  }

  return (
    <Button asChild size="icon-sm" title={actionTitle} variant="ghost">
      <Link href={`/admin/orders/edit/${encodeURIComponent(order.id)}`}>
        <RiEditLine aria-hidden />
      </Link>
    </Button>
  )
}
