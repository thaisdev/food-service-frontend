"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { RiShoppingCartLine } from "@remixicon/react"

import { Button } from "@/components/ui/button"
import { clearSessionAccess } from "@/lib/session-access"
import { cn } from "@/lib/utils"

const adminLinks = [
  { href: "/admin/dashboard", label: "Painel" },
  { href: "/admin/orders", label: "Pedidos" },
  { href: "/admin/products", label: "Produtos" },
  { href: "/admin/categories", label: "Categorias" },
]

const customerLinks = [
  { href: "/customers/menu", label: "Cardápio" },
  { href: "/customers/orders", label: "Meus pedidos" },
]

export function AppHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()

  const isDark = resolvedTheme === "dark"
  const isAdmin = pathname.startsWith("/admin")
  const isCustomers = pathname.startsWith("/customers")
  const logoSrc = "/branding/food-service-logo-app-icon-light.svg"
  const links = isAdmin ? adminLinks : isCustomers ? customerLinks : []
  const homeHref = isAdmin
    ? "/admin/dashboard"
    : isCustomers
      ? "/customers/menu"
      : "/"
  const subtitle = isAdmin
    ? "Módulo administrativo"
    : isCustomers
      ? "Módulo do cliente"
      : "Seleção de módulos"

  function handleSignOut() {
    clearSessionAccess()
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-50 border-b border-brand-bright/25 bg-brand-deep text-white shadow-[0_1px_0_color-mix(in_srgb,var(--brand-bright)_30%,transparent)]">
      <div className="mx-auto flex w-full max-w-[1800px] items-center justify-between gap-4 px-6 py-4">
        <div className="flex items-center gap-6">
          <Link href={homeHref} className="flex items-center gap-3">
            <Image
              src={logoSrc}
              alt="Food Service"
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
              priority
            />
            <span className="hidden sm:flex sm:flex-col sm:leading-none">
              <strong className="font-heading text-base font-semibold tracking-tight text-white">
                Food Service
              </strong>
              <span className="mt-1 text-[11px] font-medium tracking-[0.24em] text-brand-bright uppercase">
                {subtitle}
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            {links.map((link) => {
              const isActive =
                pathname === link.href ||
                (!["/admin/dashboard", "/customers/menu"].includes(link.href) &&
                  pathname.startsWith(link.href))

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-full px-3 py-2 text-sm text-white/78 transition-colors hover:bg-white/10 hover:text-white",
                    isActive &&
                      "bg-brand-bright text-brand-deep shadow-sm shadow-brand-bright/20"
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {isCustomers ? (
            <Button
              asChild
              size="icon"
              title="Abrir carrinho"
              variant="outline"
            >
              <Link href="/customers/menu/cart">
                <RiShoppingCartLine aria-hidden />
              </Link>
            </Button>
          ) : null}

          {(isAdmin || isCustomers) && (
            <Button
              type="button"
              variant="ghost"
              className={cn(
                "text-white hover:bg-white/10 hover:text-white",
                isCustomers && "hover:bg-destructive/25"
              )}
              onClick={handleSignOut}
            >
              {isAdmin ? "Sair" : "Pedir a conta"}
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            className="border-white/25 bg-white/8 text-white hover:bg-white/14 hover:text-white"
            onClick={() => setTheme(isDark ? "light" : "dark")}
          >
            {isDark ? "Modo claro" : "Modo escuro"}
          </Button>
        </div>
      </div>
    </header>
  )
}
