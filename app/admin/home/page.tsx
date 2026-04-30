import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function AdminHomePage() {
  return (
    <main className="flex min-h-[calc(100svh-73px)] px-6 py-10">
      <div className="mx-auto flex w-full max-w-[1800px]">
        <div className="flex max-w-xl min-w-0 flex-col gap-4 text-sm leading-loose">
          <span className="inline-flex w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            {"Painel em constru\u00e7\u00e3o"}
          </span>
          <h1 className="font-heading text-4xl font-semibold tracking-tight">
            Gerencie pedidos e produtos com mais clareza
          </h1>
          <p className="text-base text-muted-foreground">
            {
              "Use o cabe\u00e7alho para navegar entre as \u00e1reas administrativas e altere o tema da interface pelo bot\u00e3o no topo."
            }
          </p>
          <div className="flex gap-3">
            <Button asChild>
              <Link href="/admin/orders">Ver pedidos</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/products">Ver produtos</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
