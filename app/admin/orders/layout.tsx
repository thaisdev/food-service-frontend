import { ReactNode } from "react"

type AdminOrdersLayoutProps = {
  children: ReactNode
  modal: ReactNode
}

export default function AdminOrdersLayout({
  children,
  modal,
}: AdminOrdersLayoutProps) {
  return (
    <>
      {children}
      {modal}
    </>
  )
}
