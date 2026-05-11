export function formatDatetime(datetime: string) {
  const date = new Date(datetime)

  if (Number.isNaN(date.getTime())) {
    return datetime
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date)
}
