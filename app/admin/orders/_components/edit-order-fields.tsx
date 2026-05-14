import { Input } from "@/components/ui/input"
import { formatOrderItems } from "@/helpers/order"
import { OrderStatus, type Order } from "@/lib/data-schema"

type EditOrderFieldsProps = {
  editableStatuses: OrderStatus[]
  onStatusChange: (status: OrderStatus) => void
  onTableChange: (value: string) => void
  order: Order
  status: OrderStatus
  table: number | ""
}

export function EditOrderFields({
  editableStatuses,
  onStatusChange,
  onTableChange,
  order,
  status,
  table,
}: EditOrderFieldsProps) {
  return (
    <>
      <div className="rounded-2xl border border-border/70 bg-muted/35 p-4">
        <p className="text-sm font-medium">
          {order.id} · {order.customer}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {formatOrderItems(order.items)}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-xs font-medium" htmlFor="table">
            Mesa
          </label>
          <Input
            id="table"
            min={1}
            onChange={(event) => onTableChange(event.target.value)}
            placeholder="1"
            required
            type="number"
            value={table}
          />
        </div>

        <div className="grid gap-2">
          <label className="text-xs font-medium" htmlFor="status">
            Status
          </label>
          <select
            className="h-7 w-full rounded-md border border-input bg-input/20 px-2 text-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
            id="status"
            onChange={(event) =>
              onStatusChange(event.target.value as OrderStatus)
            }
            value={status}
          >
            {editableStatuses.map((currentStatus) => (
              <option key={currentStatus} value={currentStatus}>
                {currentStatus}
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  )
}
