import type { Metadata } from "next"
import { Geist_Mono, Inter, Noto_Sans } from "next/font/google"

import "./globals.css"
import { AppHeader } from "@/components/app-header"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

const interHeading = Inter({ subsets: ["latin"], variable: "--font-heading" })

const notoSans = Noto_Sans({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "Food Service",
  description: "Painel administrativo do Food Service.",
  icons: {
    icon: "/branding/food-service-logo-app-icon-primary.svg",
    shortcut: "/branding/food-service-logo-app-icon-primary.svg",
    apple: "/branding/food-service-logo-app-icon-light.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        notoSans.variable,
        interHeading.variable
      )}
    >
      <body>
        <ThemeProvider>
          <div className="min-h-svh bg-background text-foreground">
            <AppHeader />
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
