import { ReactNode } from "react"

type CustomersMenuLayoutProps = {
  children: ReactNode
  modal: ReactNode
}

export default function CustomersMenuLayout({
  children,
  modal,
}: CustomersMenuLayoutProps) {
  return (
    <>
      {children}
      {modal}
    </>
  )
}
