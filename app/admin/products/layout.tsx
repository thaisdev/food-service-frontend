import { ReactNode } from "react"

type AdminProductsLayoutProps = {
  children: ReactNode
  modal: ReactNode
}

export default function AdminProductsLayout({
  children,
  modal,
}: AdminProductsLayoutProps) {
  return (
    <>
      {children}
      {modal}
    </>
  )
}
