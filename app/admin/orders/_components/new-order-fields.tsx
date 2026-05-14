import { Input } from "@/components/ui/input"

type NewOrderFieldsProps = {
  customer: string
  onCustomerChange: (value: string) => void
  onTableChange: (value: string) => void
  table: number | ""
}

export function NewOrderFields({
  customer,
  onCustomerChange,
  onTableChange,
  table,
}: NewOrderFieldsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="grid gap-2">
        <label className="text-xs font-medium" htmlFor="customer">
          Cliente
        </label>
        <Input
          id="customer"
          onChange={(event) => onCustomerChange(event.target.value)}
          required
          value={customer}
        />
      </div>

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
    </div>
  )
}
