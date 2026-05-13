import { ReactNode } from "react"

type AdminCategoriesLayoutProps = {
  children: ReactNode
  modal: ReactNode
}

export default function AdminCategoriesLayout({
  children,
  modal,
}: AdminCategoriesLayoutProps) {
  return (
    <>
      {children}
      {modal}
    </>
  )
}
