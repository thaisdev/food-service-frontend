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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatProductPrice } from "@/helpers/currency"
import {
  ProductStatus,
  ProductStock,
  type Category,
  type Product,
} from "@/lib/data-schema"

type CategoryProductsModalProps = {
  category: Category
  products: Product[]
}

function getProductBadgeClasses(value: ProductStatus | ProductStock) {
  switch (value) {
    case ProductStatus.Active:
    case ProductStock.Available:
      return "bg-success-muted text-success"
    case ProductStock.Low:
      return "bg-warning-muted text-warning"
    case ProductStatus.Inactive:
    case ProductStock.Unavailable:
      return "bg-destructive-muted text-destructive"
  }
}

export function CategoryProductsModal({
  category,
  products,
}: CategoryProductsModalProps) {
  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/45 p-4 backdrop-blur-sm"
      role="dialog"
    >
      <Card className="max-h-[calc(100svh-2rem)] w-full max-w-4xl overflow-hidden rounded-2xl border border-primary/15 p-0 shadow-xl">
        <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-primary/15 bg-primary-muted/45 p-6">
          <div>
            <CardTitle className="text-lg font-semibold">
              Produtos em {category.name}
            </CardTitle>
            <CardDescription className="text-sm">
              Itens cadastrados com esta categoria no cardápio.
            </CardDescription>
          </div>
          <Button asChild size="icon-sm" title="Fechar modal" variant="ghost">
            <Link href="/admin/categories">
              <RiCloseLine aria-hidden />
            </Link>
          </Button>
        </CardHeader>

        <CardContent className="max-h-[calc(100svh-9rem)] overflow-y-auto p-0">
          {products.length ? (
            <div className="pb-1">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-6">Código</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Estoque</TableHead>
                    <TableHead className="px-6">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="px-6 font-medium">
                        {product.id}
                      </TableCell>
                      <TableCell>
                        <div className="min-w-64">
                          <p className="font-medium">{product.name}</p>
                          <p className="max-w-96 truncate text-xs text-muted-foreground">
                            {product.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatProductPrice(product.price)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={getProductBadgeClasses(product.stock)}
                        >
                          {product.stock}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6">
                        <Badge
                          className={getProductBadgeClasses(product.status)}
                        >
                          {product.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-6">
              <p className="rounded-2xl border border-primary/15 bg-primary-muted/35 p-4 text-sm text-muted-foreground">
                Nenhum produto vinculado a esta categoria.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
