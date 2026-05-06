"use client"

import Image from "next/image"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useCategories, useProducts } from "@/hooks/use-api-data"
import { useSessionAccess } from "@/hooks/use-session-access"
import {
  ProductStatus,
  ProductStock,
  formatProductPrice,
  getProductCategoryName,
} from "@/lib/data-schema"
import { SessionModule } from "@/lib/session-access"

export default function CustomersMenuPage() {
  const access = useSessionAccess()
  const categories = useCategories()
  const products = useProducts()
  const menuItems = products.filter(
    (product) =>
      product.status === ProductStatus.Active &&
      product.stock !== ProductStock.Unavailable
  )
  const customerName =
    access?.module === SessionModule.Customers ? access.name : "Cliente"
  const tableNumber =
    access?.module === SessionModule.Customers ? access.table : "--"

  return (
    <main className="min-h-[calc(100svh-73px)] bg-[image:var(--page-gradient)] px-6 py-10">
      <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-8">
        <section className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
          <Card className="rounded-3xl border border-success/20 bg-card/90 p-4 shadow-sm shadow-success/5">
            <CardHeader>
              <Badge className="bg-success text-success-foreground">
                Módulo do cliente
              </Badge>
              <CardTitle className="mt-2 font-heading text-3xl font-semibold tracking-tight md:text-4xl">
                Cardápio digital e pedidos
              </CardTitle>
              <CardDescription className="max-w-2xl text-sm leading-6 md:text-base">
                Escolha os produtos do seu pedido, acompanhe os destaques da
                casa e envie tudo direto para a equipe de atendimento.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="rounded-3xl border border-primary/25 bg-primary-muted/45 p-2 shadow-sm shadow-primary/5">
            <CardContent className="p-4">
              <p className="text-sm text-brand-muted">Atendimento atual</p>
              <strong className="mt-2 block text-2xl font-semibold tracking-tight text-primary">
                {customerName}
              </strong>
              <p className="mt-1 text-sm text-muted-foreground">
                Mesa {tableNumber}
              </p>

              <div className="mt-6 rounded-2xl border border-warning/20 bg-warning-muted/60 p-4">
                <p className="text-sm font-medium">Sugestão do dia</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Combine um prato principal com bebida e sobremesa para montar
                  um pedido completo.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {menuItems.map((item) => (
            <Card
              key={item.id}
              className="overflow-hidden rounded-3xl border border-primary/15 p-0 shadow-sm transition-colors hover:border-success/35"
            >
              <div className="relative aspect-[4/3] w-full bg-muted/30">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1279px) 50vw, 25vw"
                />
              </div>

              <CardContent className="space-y-4 p-5">
                <div>
                  <Badge className="bg-primary-muted text-primary">
                    {getProductCategoryName(item, categories)}
                  </Badge>
                  <CardTitle className="mt-3 text-lg font-semibold">
                    {item.name}
                  </CardTitle>
                  <CardDescription className="mt-2 text-sm leading-6">
                    {item.description}
                  </CardDescription>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <strong className="text-lg font-semibold">
                    {formatProductPrice(item.price)}
                  </strong>
                  <Button className="bg-success text-success-foreground hover:bg-green/90">
                    Adicionar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    </main>
  )
}
