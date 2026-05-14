import Link from "next/link"
import { RiAddLine } from "@remixicon/react"

import { Button } from "@/components/ui/button"

export function OrdersPageHeader() {
  return (
    <section className="flex flex-col gap-4 rounded-3xl border border-info/20 bg-card/85 p-8 shadow-sm shadow-info/5 backdrop-blur">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl space-y-2">
          <h1 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
            Gerencie os pedidos cadastrados
          </h1>
          <p className="text-sm leading-6 text-muted-foreground md:text-base">
            Cadastre, edite, acompanhe status e cancele pedidos.
          </p>
        </div>
        <Button
          asChild
          className="bg-success text-success-foreground hover:bg-success/90"
        >
          <Link href="/admin/orders/new">
            <RiAddLine aria-hidden />
            Novo pedido
          </Link>
        </Button>
      </div>
    </section>
  )
}
