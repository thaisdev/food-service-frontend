export type PaginatedResponse<T> = {
  items: T[]
  pagination: {
    page: number
    pageSize: number
    totalItems: number
    totalPages: number
  }
}

export function parsePaginationParams(searchParams: URLSearchParams) {
  const page = Math.max(1, Number(searchParams.get("page")) || 1)
  const pageSize = Math.max(1, Number(searchParams.get("pageSize")) || 10)

  return { page, pageSize }
}

export function paginateItems<T>(
  items: T[],
  page: number,
  pageSize: number
): PaginatedResponse<T> {
  const totalItems = items.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const safePage = Math.min(page, totalPages)
  const startIndex = (safePage - 1) * pageSize

  return {
    items: items.slice(startIndex, startIndex + pageSize),
    pagination: {
      page: safePage,
      pageSize,
      totalItems,
      totalPages,
    },
  }
}

export function normalizeSearchText(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
}
