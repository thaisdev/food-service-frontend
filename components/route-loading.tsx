export function RouteLoading() {
  return (
    <main className="min-h-[calc(100svh-73px)] bg-[image:var(--page-gradient)] px-6 py-10">
      <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-8">
        <section className="rounded-3xl border border-border/70 bg-card/80 p-8 shadow-sm">
          <div className="h-5 w-36 animate-pulse rounded-full bg-muted" />
          <div className="mt-5 h-10 w-full max-w-xl animate-pulse rounded-lg bg-muted" />
          <div className="mt-4 h-4 w-full max-w-2xl animate-pulse rounded bg-muted" />
          <div className="mt-2 h-4 w-full max-w-lg animate-pulse rounded bg-muted" />
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm"
            >
              <div className="h-4 w-28 animate-pulse rounded bg-muted" />
              <div className="mt-4 h-8 w-20 animate-pulse rounded bg-muted" />
              <div className="mt-3 h-4 w-40 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </section>

        <section className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
          <div className="h-6 w-48 animate-pulse rounded bg-muted" />
          <div className="mt-6 space-y-4">
            {[0, 1, 2, 3].map((item) => (
              <div
                key={item}
                className="grid gap-4 md:grid-cols-[1fr_2fr_1fr_1fr]"
              >
                <div className="h-5 animate-pulse rounded bg-muted" />
                <div className="h-5 animate-pulse rounded bg-muted" />
                <div className="h-5 animate-pulse rounded bg-muted" />
                <div className="h-5 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
