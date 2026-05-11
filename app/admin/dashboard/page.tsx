import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function AdminHomePage() {
  return (
    <main className="flex min-h-[calc(100svh-73px)] bg-[image:var(--page-gradient)] px-6 py-10">
      <div className="mx-auto flex w-full max-w-[1800px]">
        <Card className="max-w-xl rounded-3xl border border-border/70 p-4 shadow-sm">
          <CardContent className="flex min-w-0 flex-col gap-4 p-4 text-sm leading-loose">
            <Badge className="bg-primary/10 text-primary">
              Painel em construção
            </Badge>
            <h1 className="font-heading text-4xl font-semibold tracking-tight">
              Gerencie pedidos e produtos com mais clareza
            </h1>
            <p className="text-base text-muted-foreground">
              Use o cabeçalho para navegar entre as áreas administrativas e
              altere o tema da interface pelo botão no topo.
            </p>
            <div className="flex gap-3">
              <Button asChild>
                <Link href="/admin/orders">Ver pedidos</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/admin/products">Ver produtos</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
