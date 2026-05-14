import Link from "next/link"
import { RiCloseLine } from "@remixicon/react"

import { Button } from "@/components/ui/button"
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type AdminOrderFormModalHeaderProps = {
  closeHref: string
  isEditing: boolean
}

export function AdminOrderFormModalHeader({
  closeHref,
  isEditing,
}: AdminOrderFormModalHeaderProps) {
  return (
    <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-info/15 bg-info-muted/45 p-6">
      <div>
        <CardTitle className="text-lg font-semibold">
          {isEditing ? "Editar pedido" : "Novo pedido"}
        </CardTitle>
        <CardDescription className="text-sm">
          As alterações são enviadas para a API e gravadas no Firestore.
        </CardDescription>
      </div>
      <Button asChild size="icon-sm" title="Fechar modal" variant="ghost">
        <Link href={closeHref}>
          <RiCloseLine aria-hidden />
        </Link>
      </Button>
    </CardHeader>
  )
}
