'use client' // Error boundaries must be Client Components

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Log to your error service
    console.error(error)
  }, [error])

  const details = useMemo(() => {
    const payload = {
      message: error?.message ?? 'Unknown error',
      digest: error?.digest,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      time: new Date().toISOString(),
    }
    return JSON.stringify(payload, null, 2)
  }, [error])

  const copy = async () => {
    try {
      await navigator.clipboard?.writeText(details)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <main
      className="
        relative isolate min-h-[100dvh] overflow-hidden
        bg-white dark:bg-slate-950
        [--spot:34rem] sm:[--spot:40rem] lg:[--spot:46rem]
      "
    >
      {/* Soft spotlights (background) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="
            absolute -top-[calc(var(--spot)/2)] -left-[calc(var(--spot)/2)]
            h-[var(--spot)] w-[var(--spot)] rounded-full
            bg-rose-200/60 blur-3xl dark:bg-rose-900/40
          "
        />
        <div
          className="
            absolute -bottom-[calc(var(--spot)/2)] -right-[calc(var(--spot)/2)]
            h-[var(--spot)] w-[var(--spot)] rounded-full
            bg-orange-200/60 blur-3xl dark:bg-orange-900/40
          "
        />
      </div>

      {/* Content */}
      <section className="mx-auto flex min-h-[100dvh] max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
        <p className="mb-3 text-sm tracking-widest text-rose-600/90 dark:text-rose-400/90">500</p>

        <h1 className="text-[clamp(2rem,8vw,4.5rem)] font-semibold leading-tight tracking-tight text-slate-900 dark:text-slate-100">
          Something went wrong
        </h1>

        <p role="alert" className="mt-3 max-w-prose text-sm sm:text-base text-slate-600 dark:text-slate-400">
          An unexpected error occurred. You can try again, go back, or return home.
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center rounded-full px-4 py-2 text-sm font-medium
                       text-white bg-slate-900 hover:bg-slate-700
                       dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
          >
            Try again
          </button>

          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center rounded-full px-4 py-2 text-sm font-medium
                       text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50
                       dark:text-slate-100 dark:ring-slate-700 dark:hover:bg-slate-900"
          >
            Go back
          </button>

          <Link
            href="/"
            className="inline-flex items-center rounded-full px-4 py-2 text-sm font-medium
                       text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50
                       dark:text-slate-100 dark:ring-slate-700 dark:hover:bg-slate-900"
          >
            Home
          </Link>
        </div>

        <details className="mt-8 w-full max-w-xl rounded-xl border border-slate-200 p-4 text-left text-sm dark:border-slate-800">
          <summary className="cursor-pointer select-none text-slate-700 dark:text-slate-300">
            Error details
          </summary>
          <pre className="mt-3 overflow-auto rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-slate-700 dark:bg-slate-900 dark:text-slate-200">
{details}
          </pre>
          <div className="mt-3 flex gap-3">
            <button
              type="button"
              onClick={copy}
              className="inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium
                         ring-1 ring-slate-300 hover:bg-slate-50
                         dark:text-slate-100 dark:ring-slate-700 dark:hover:bg-slate-900"
            >
              {copied ? 'Copied!' : 'Copy details'}
            </button>

            <a
              href={`mailto:support@example.com?subject=App%20Error%20${encodeURIComponent(error?.digest ?? '')}&body=${encodeURIComponent(details)}`}
              className="inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium
                         ring-1 ring-slate-300 hover:bg-slate-50
                         dark:text-slate-100 dark:ring-slate-700 dark:hover:bg-slate-900"
            >
              Report issue
            </a>
          </div>
        </details>

        {/* Decorative line */}
        <div aria-hidden className="mt-10 h-px w-24 sm:w-32 bg-gradient-to-r from-transparent via-slate-300 to-transparent dark:via-slate-700" />
      </section>
    </main>
  )
}