type OrderFormMessageProps = {
  isError: boolean
  message: string | null
}

export function OrderFormMessage({ isError, message }: OrderFormMessageProps) {
  if (!message) {
    return null
  }

  return (
    <p
      className={
        isError
          ? "rounded-md border border-destructive/20 bg-destructive-muted/40 px-3 py-2 text-xs text-destructive"
          : "rounded-md border border-info/20 bg-info-muted/40 px-3 py-2 text-xs text-muted-foreground"
      }
    >
      {message}
    </p>
  )
}
