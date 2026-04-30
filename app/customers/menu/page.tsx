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
import { useProducts } from "@/hooks/use-local-storage-data"
import { useSessionAccess } from "@/hooks/use-session-access"

export default function CustomersMenuPage() {
  const access = useSessionAccess()
  const products = useProducts()
  const menuItems = products.filter(
    (product) => product.status === "Ativo" && product.stock !== "Indisponível"
  )
  const customerName = access?.module === "customers" ? access.name : "Cliente"
  const tableNumber = access?.module === "customers" ? access.table : "--"

  return (
    <main className="min-h-[calc(100svh-73px)] bg-gradient-to-b from-background via-background to-muted/40 px-6 py-10">
      <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-8">
        <section className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
          <Card className="rounded-3xl border border-border/70 bg-card/90 p-4 shadow-sm">
            <CardHeader>
              <Badge className="bg-primary/10 text-primary">
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

          <Card className="rounded-3xl border border-border/70 p-2 shadow-sm">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Atendimento atual</p>
              <strong className="mt-2 block text-2xl font-semibold tracking-tight">
                {customerName}
              </strong>
              <p className="mt-1 text-sm text-muted-foreground">
                Mesa {tableNumber}
              </p>

              <div className="mt-6 rounded-2xl border border-border/60 bg-background/70 p-4">
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
              className="overflow-hidden rounded-3xl border border-border/70 p-0 shadow-sm"
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
                  <Badge variant="secondary">{item.category}</Badge>
                  <CardTitle className="mt-3 text-lg font-semibold">
                    {item.name}
                  </CardTitle>
                  <CardDescription className="mt-2 text-sm leading-6">
                    {item.description}
                  </CardDescription>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <strong className="text-lg font-semibold">
                    {item.price}
                  </strong>
                  <Button>Adicionar</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    </main>
  )
}
