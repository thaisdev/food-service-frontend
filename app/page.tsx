"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { setSessionAccess } from "@/lib/session-access"

export default function Page() {
  const router = useRouter()
  const [adminEmail, setAdminEmail] = useState("")
  const [adminPassword, setAdminPassword] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [tableNumber, setTableNumber] = useState("")

  function handleAdminSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!adminEmail.trim() || !adminPassword.trim()) {
      return
    }

    setSessionAccess({
      module: "admin",
      email: adminEmail.trim(),
    })

    router.push("/admin/home")
  }

  function handleCustomerSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const name = customerName.trim()
    const table = tableNumber.trim()

    if (!name || !table) {
      return
    }

    setSessionAccess({
      module: "customers",
      name,
      table,
    })

    router.push("/customers/menu")
  }

  return (
    <main className="min-h-[calc(100svh-73px)] bg-[image:var(--page-gradient)] px-6 py-10">
      <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-8">
        <section className="max-w-3xl space-y-4">
          <Badge className="bg-primary text-primary-foreground">
            Escolha o módulo
          </Badge>
          <h1 className="font-heading text-4xl font-semibold tracking-tight md:text-5xl">
            Acesse como administrador ou cliente
          </h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground">
            Entre no módulo mais adequado para o seu momento. A equipe
            administrativa controla pedidos e produtos, enquanto o cliente
            acessa o cardápio e registra seu pedido pela mesa.
          </p>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <Card className="rounded-3xl border border-primary/20 bg-card/95 p-4 shadow-sm shadow-primary/5">
            <CardHeader className="space-y-2 px-4">
              <Badge className="bg-primary/10 text-primary">
                Administrador
              </Badge>
              <CardTitle className="text-2xl font-semibold tracking-tight">
                Acesso da equipe
              </CardTitle>
              <CardDescription className="text-sm leading-6">
                Use e-mail e senha para entrar no painel administrativo e
                gerenciar pedidos, produtos e operação.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form className="space-y-4" onSubmit={handleAdminSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="admin-email" className="text-sm">
                    E-mail
                  </Label>
                  <Input
                    id="admin-email"
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(event) => setAdminEmail(event.target.value)}
                    className="h-11 rounded-2xl bg-background px-4 text-sm md:text-sm"
                    placeholder="admin@foodservice.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-password" className="text-sm">
                    Senha
                  </Label>
                  <Input
                    id="admin-password"
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(event) => setAdminPassword(event.target.value)}
                    className="h-11 rounded-2xl bg-background px-4 text-sm md:text-sm"
                    placeholder="Digite sua senha"
                  />
                </div>

                <Button type="submit" className="w-full sm:w-auto">
                  Entrar no admin
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border border-success/20 bg-card/95 p-4 shadow-sm shadow-success/5">
            <CardHeader className="space-y-2 px-4">
              <Badge className="bg-success-muted text-success">Cliente</Badge>
              <CardTitle className="text-2xl font-semibold tracking-tight">
                Acesso ao cardápio
              </CardTitle>
              <CardDescription className="text-sm leading-6">
                Informe seu primeiro nome e o número da mesa para visualizar o
                cardápio e iniciar seu pedido.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form className="space-y-4" onSubmit={handleCustomerSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="customer-name" className="text-sm">
                    Primeiro nome
                  </Label>
                  <Input
                    id="customer-name"
                    type="text"
                    required
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                    className="h-11 rounded-2xl bg-background px-4 text-sm md:text-sm"
                    placeholder="Ex.: Marina"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="table-number" className="text-sm">
                    Número da mesa
                  </Label>
                  <Input
                    id="table-number"
                    type="text"
                    inputMode="numeric"
                    required
                    value={tableNumber}
                    onChange={(event) => setTableNumber(event.target.value)}
                    className="h-11 rounded-2xl bg-background px-4 text-sm md:text-sm"
                    placeholder="Ex.: 12"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-success text-success-foreground hover:bg-green/90 sm:w-auto"
                >
                  Entrar como cliente
                </Button>
              </form>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  )
}
