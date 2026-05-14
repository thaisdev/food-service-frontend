import Link from "next/link"
import { RiAddLine, RiCloseLine, RiSaveLine } from "@remixicon/react"

import { Button } from "@/components/ui/button"

type OrderFormActionsProps = {
  closeHref: string
  isEditing: boolean
  isPending: boolean
}

export function OrderFormActions({
  closeHref,
  isEditing,
  isPending,
}: OrderFormActionsProps) {
  return (
    <div className="flex flex-wrap justify-end gap-2 pt-2">
      {isEditing ? (
        <Button
          className="bg-success text-success-foreground hover:bg-success/90"
          disabled={isPending}
          type="submit"
        >
          <RiSaveLine aria-hidden />
          Salvar
        </Button>
      ) : (
        <>
          <Button asChild variant="outline">
            <Link href={closeHref}>
              <RiCloseLine aria-hidden />
              Cancelar
            </Link>
          </Button>
          <Button
            disabled={isPending}
            name="submitAction"
            type="submit"
            value="continue"
          >
            <RiAddLine aria-hidden />
            Cadastrar mais pedidos
          </Button>
          <Button
            className="bg-success text-success-foreground hover:bg-success/90"
            disabled={isPending}
            name="submitAction"
            type="submit"
            value="close"
          >
            <RiSaveLine aria-hidden />
            Salvar e fechar
          </Button>
        </>
      )}
    </div>
  )
}
