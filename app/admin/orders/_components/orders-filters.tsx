import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { OrderStatus } from "@/lib/data-schema"

import { type OrderFilter } from "../_helpers/orders-manager"

type OrdersFiltersProps = {
  dateFilter: string
  filter: OrderFilter
  onDateFilterChange: (value: string) => void
  onFilterChange: (filter: OrderFilter) => void
  todayDateFilter: string
}

export function OrdersFilters({
  dateFilter,
  filter,
  onDateFilterChange,
  onFilterChange,
  todayDateFilter,
}: OrdersFiltersProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div className="grid gap-1.5">
        <label className="text-xs font-medium" htmlFor="dateFilter">
          Data
        </label>
        <Input
          className="h-9 max-w-48"
          id="dateFilter"
          max={todayDateFilter}
          onChange={(event) => onDateFilterChange(event.target.value)}
          type="date"
          value={dateFilter}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {(["Todos", ...Object.values(OrderStatus)] as const).map(
          (currentFilter) => (
            <Button
              key={currentFilter}
              onClick={() => onFilterChange(currentFilter)}
              type="button"
              variant={filter === currentFilter ? "default" : "outline"}
            >
              {currentFilter}
            </Button>
          )
        )}
      </div>
    </div>
  )
}
