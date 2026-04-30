"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const links = [
  { href: "/admin/home", label: "In\u00edcio" },
  { href: "/admin/orders", label: "Pedidos" },
  { href: "/admin/products", label: "Produtos" },
]

export function AppHeader() {
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()

  const isDark = resolvedTheme === "dark"
  const logoSrc = isDark
    ? "/branding/food-service-logo-app-icon-primary.svg"
    : "/branding/food-service-logo-simbolo.svg"

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-white/95 backdrop-blur dark:bg-card/95">
      <div className="mx-auto flex w-full max-w-[1800px] items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-6">
          <Link href="/admin/home" className="flex items-center gap-3">
            <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-card shadow-sm ring-1 ring-border/70">
              <Image
                src={logoSrc}
                alt="Food Service"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
                priority
              />
            </span>
            <span className="hidden sm:flex sm:flex-col sm:leading-none">
              <strong className="font-heading text-base font-semibold tracking-tight">
                Food Service
              </strong>
              <span className="mt-1 text-[11px] font-medium tracking-[0.24em] text-muted-foreground uppercase">
                Painel administrativo
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            {links.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/admin/home" && pathname.startsWith(link.href))

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-full px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                    isActive && "bg-primary/10 font-medium text-primary"
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => setTheme(isDark ? "light" : "dark")}
        >
          {isDark ? "Modo claro" : "Modo escuro"}
        </Button>
      </div>
    </header>
  )
}
