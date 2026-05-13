import { OrderStatus } from "@/lib/data-schema"

export const ORDER_STATUS_FLOW = [
  OrderStatus.Waiting,
  OrderStatus.Preparing,
  OrderStatus.Ready,
  OrderStatus.Finished,
] as const

function getOrderStatusIndex(status: OrderStatus) {
  const index = ORDER_STATUS_FLOW.findIndex(
    (currentStatus) => currentStatus === status
  )

  return index >= 0 ? index : null
}

export function canCancelOrder(status: OrderStatus) {
  const currentIndex = getOrderStatusIndex(status)
  const readyIndex = getOrderStatusIndex(OrderStatus.Ready) ?? 0

  return currentIndex !== null && currentIndex < readyIndex
}

export function canUpdateOrderStatus(
  currentStatus: OrderStatus,
  nextStatus: OrderStatus
) {
  if (currentStatus === nextStatus) {
    return true
  }

  if (nextStatus === OrderStatus.Canceled) {
    return canCancelOrder(currentStatus)
  }

  const currentIndex = getOrderStatusIndex(currentStatus)
  const nextIndex = getOrderStatusIndex(nextStatus)

  return currentIndex !== null && nextIndex !== null && nextIndex > currentIndex
}

export function getEditableOrderStatuses(status: OrderStatus) {
  const currentIndex = getOrderStatusIndex(status)

  if (currentIndex === null) {
    return [status]
  }

  return ORDER_STATUS_FLOW.slice(currentIndex)
}
