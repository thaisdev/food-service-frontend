import { ReactNode } from "react"

type AdminDashboardLayoutProps = {
  children: ReactNode
  modal: ReactNode
}

export default function AdminDashboardLayout({
  children,
  modal,
}: AdminDashboardLayoutProps) {
  return (
    <>
      {children}
      {modal}
    </>
  )
}
