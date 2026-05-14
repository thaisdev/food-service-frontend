import { OrderStatus } from "@/lib/data-schema"

export function getStatusClasses(status: OrderStatus) {
  switch (status) {
    case OrderStatus.Ready:
      return "bg-success-muted text-success"
    case OrderStatus.Preparing:
      return "bg-warning-muted text-warning"
    case OrderStatus.Finished:
      return "bg-muted text-muted-foreground"
    case OrderStatus.Canceled:
      return "bg-destructive-muted text-destructive"
    case OrderStatus.Waiting:
      return "bg-destructive-muted text-destructive"
  }
}
