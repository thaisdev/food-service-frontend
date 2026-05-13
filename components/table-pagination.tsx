"use client"

import { Button } from "@/components/ui/button"

type TablePaginationProps = {
  currentPage: number
  onPageChange: (page: number) => void
  pageSize: number
  totalItems: number
}

export function TablePagination({
  currentPage,
  onPageChange,
  pageSize,
  totalItems,
}: TablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const firstItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const lastItem = Math.min(currentPage * pageSize, totalItems)

  return (
    <div className="flex flex-col gap-3 border-t border-border/70 px-6 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <p>
        Mostrando {firstItem}-{lastItem} de {totalItems}
      </p>

      <div className="flex items-center gap-2">
        <Button
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          type="button"
          variant="outline"
        >
          Anterior
        </Button>
        <span>
          Página {currentPage} de {totalPages}
        </span>
        <Button
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          type="button"
          variant="outline"
        >
          Próxima
        </Button>
      </div>
    </div>
  )
}
