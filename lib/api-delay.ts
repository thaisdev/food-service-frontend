const DEFAULT_API_DELAY_MS = 800

export function delay(ms = DEFAULT_API_DELAY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
