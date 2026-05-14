"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { RiCloseLine } from "@remixicon/react"
import { FormEvent, useState } from "react"

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
import { SessionModule, setSessionAccess } from "@/lib/session-access"
import { cn } from "@/lib/utils"

type LoginMode = "customer" | "employee"

function getModeButtonClasses(isActive: boolean) {
  return cn(
    "rounded-full border bg-transparent p-0 transition-colors focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:outline-none",
    isActive ? "border-primary" : "border-transparent hover:border-primary/30"
  )
}

export function CustomerLoginModal() {
  const router = useRouter()
  const [mode, setMode] = useState<LoginMode>("customer")
  const [customerName, setCustomerName] = useState("")
  const [tableNumber, setTableNumber] = useState("")
  const [employeeEmail, setEmployeeEmail] = useState("")
  const [employeePassword, setEmployeePassword] = useState("")

  function handleCustomerSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const name = customerName.trim()
    const table = tableNumber.trim()

    if (!name || !table) {
      return
    }

    setSessionAccess({
      module: SessionModule.Customers,
      name,
      table,
      cart: [],
    })

    router.replace("/customers/menu")
  }

  function handleEmployeeSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const email = employeeEmail.trim()

    if (!email || !employeePassword.trim()) {
      return
    }

    setSessionAccess({
      module: SessionModule.Admin,
      email,
    })

    router.replace("/admin/dashboard")
  }

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/45 p-4 backdrop-blur-sm"
      role="dialog"
    >
      <Card className="max-h-[calc(100svh-2rem)] w-full max-w-lg overflow-hidden rounded-2xl border border-primary/20 p-0 shadow-xl">
        <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-primary/15 bg-primary-muted/45 p-6">
          <div>
            <CardTitle className="text-lg font-semibold">Entrar</CardTitle>
            <CardDescription className="text-sm">
              Identifique-se para continuar no Food Service.
            </CardDescription>
          </div>
          <Button asChild size="icon-sm" title="Fechar modal" variant="ghost">
            <Link href="/customers/menu">
              <RiCloseLine aria-hidden />
            </Link>
          </Button>
        </CardHeader>

        <CardContent className="max-h-[calc(100svh-9rem)] overflow-y-auto p-2">
          <div className="mx-auto w-full max-w-sm lg:max-w-xs">
            <div
              className="mb-5 flex flex-wrap justify-center gap-2"
              aria-label="Tipo de login"
            >
              <button
                aria-pressed={mode === "customer"}
                className={getModeButtonClasses(mode === "customer")}
                onClick={() => setMode("customer")}
                type="button"
              >
                <Badge
                  className={cn(
                    "h-7 px-3 text-xs",
                    mode === "customer"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-primary"
                  )}
                >
                  Sou cliente
                </Badge>
              </button>
              <button
                aria-pressed={mode === "employee"}
                className={getModeButtonClasses(mode === "employee")}
                onClick={() => setMode("employee")}
                type="button"
              >
                <Badge
                  className={cn(
                    "h-7 px-3 text-xs",
                    mode === "employee"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-primary"
                  )}
                >
                  Sou funcionário
                </Badge>
              </button>
            </div>

            {mode === "customer" ? (
              <form className="mb-5 space-y-4" onSubmit={handleCustomerSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="customer-name" className="text-sm">
                    Primeiro nome
                  </Label>
                  <Input
                    id="customer-name"
                    required
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                    className="h-11 rounded-2xl bg-background px-4 text-sm md:text-sm"
                    placeholder="Ex.: Marina"
                    type="text"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="table-number" className="text-sm">
                    Número da mesa
                  </Label>
                  <Input
                    id="table-number"
                    inputMode="numeric"
                    required
                    value={tableNumber}
                    onChange={(event) => setTableNumber(event.target.value)}
                    className="h-11 rounded-2xl bg-background px-4 text-sm md:text-sm"
                    placeholder="Ex.: 12"
                    type="text"
                  />
                </div>

                <div className="flex justify-center">
                  <Button
                    type="submit"
                    className="bg-success text-success-foreground hover:bg-green/90"
                  >
                    Entrar como cliente
                  </Button>
                </div>
              </form>
            ) : (
              <form className="mb-5 space-y-4" onSubmit={handleEmployeeSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="employee-email" className="text-sm">
                    E-mail
                  </Label>
                  <Input
                    id="employee-email"
                    required
                    value={employeeEmail}
                    onChange={(event) => setEmployeeEmail(event.target.value)}
                    className="h-11 rounded-2xl bg-background px-4 text-sm md:text-sm"
                    placeholder="admin@foodservice.com"
                    type="email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employee-password" className="text-sm">
                    Senha
                  </Label>
                  <Input
                    id="employee-password"
                    required
                    value={employeePassword}
                    onChange={(event) =>
                      setEmployeePassword(event.target.value)
                    }
                    className="h-11 rounded-2xl bg-background px-4 text-sm md:text-sm"
                    placeholder="Digite sua senha"
                    type="password"
                  />
                </div>

                <div className="flex justify-center">
                  <Button type="submit">Entrar como funcionário</Button>
                </div>
              </form>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
