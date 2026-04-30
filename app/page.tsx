"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"

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

    router.push("/admin/home")
  }

  function handleCustomerSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const name = customerName.trim()
    const table = tableNumber.trim()

    if (!name || !table) {
      return
    }

    const params = new URLSearchParams({
      name,
      table,
    })

    router.push(`/customers/menu?${params.toString()}`)
  }

  return (
    <main className="min-h-[calc(100svh-73px)] bg-gradient-to-b from-background via-background to-muted/40 px-6 py-10">
      <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-8">
        <section className="max-w-3xl space-y-4">
          <span className="inline-flex w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Escolha o módulo
          </span>
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
          <article className="rounded-3xl border border-border/70 bg-card p-8 shadow-sm">
            <div className="mb-6 space-y-2">
              <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                Administrador
              </span>
              <h2 className="text-2xl font-semibold tracking-tight">
                Acesso da equipe
              </h2>
              <p className="text-sm leading-6 text-muted-foreground">
                Use e-mail e senha para entrar no painel administrativo e
                gerenciar pedidos, produtos e operação.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleAdminSubmit}>
              <div className="space-y-2">
                <label htmlFor="admin-email" className="text-sm font-medium">
                  E-mail
                </label>
                <input
                  id="admin-email"
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(event) => setAdminEmail(event.target.value)}
                  className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none ring-0 transition-colors placeholder:text-muted-foreground/70 focus:border-primary"
                  placeholder="admin@foodservice.com"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="admin-password" className="text-sm font-medium">
                  Senha
                </label>
                <input
                  id="admin-password"
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(event) => setAdminPassword(event.target.value)}
                  className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none ring-0 transition-colors placeholder:text-muted-foreground/70 focus:border-primary"
                  placeholder="Digite sua senha"
                />
              </div>

              <Button type="submit" className="w-full sm:w-auto">
                Entrar no admin
              </Button>
            </form>
          </article>

          <article className="rounded-3xl border border-border/70 bg-card p-8 shadow-sm">
            <div className="mb-6 space-y-2">
              <span className="inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                Cliente
              </span>
              <h2 className="text-2xl font-semibold tracking-tight">
                Acesso ao cardápio
              </h2>
              <p className="text-sm leading-6 text-muted-foreground">
                Informe seu primeiro nome e o número da mesa para visualizar o
                cardápio e iniciar seu pedido.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleCustomerSubmit}>
              <div className="space-y-2">
                <label htmlFor="customer-name" className="text-sm font-medium">
                  Primeiro nome
                </label>
                <input
                  id="customer-name"
                  type="text"
                  required
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none ring-0 transition-colors placeholder:text-muted-foreground/70 focus:border-primary"
                  placeholder="Ex.: Marina"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="table-number" className="text-sm font-medium">
                  Número da mesa
                </label>
                <input
                  id="table-number"
                  type="text"
                  inputMode="numeric"
                  required
                  value={tableNumber}
                  onChange={(event) => setTableNumber(event.target.value)}
                  className="h-11 w-full rounded-2xl border border-border bg-background px-4 text-sm outline-none ring-0 transition-colors placeholder:text-muted-foreground/70 focus:border-primary"
                  placeholder="Ex.: 12"
                />
              </div>

              <Button type="submit" className="w-full sm:w-auto">
                Entrar como cliente
              </Button>
            </form>
          </article>
        </section>
      </div>
    </main>
  )
}
