'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <main
      className="
        relative isolate min-h-screen overflow-hidden
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
            bg-blue-200/60 blur-3xl dark:bg-blue-900/40
          "
        />
        <div
          className="
            absolute -bottom-[calc(var(--spot)/2)] -right-[calc(var(--spot)/2)]
            h-[var(--spot)] w-[var(--spot)] rounded-full
            bg-indigo-200/60 blur-3xl dark:bg-indigo-900/40
          "
        />
      </div>

      {/* Content */}
      <section className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
        <p className="mb-3 text-sm tracking-widest text-blue-600/90 dark:text-blue-400/90">
          404
        </p>

        <h1
          className="font-semibold leading-tight tracking-tight text-slate-900 dark:text-slate-100
                     text-[clamp(2rem,8vw,4.5rem)]"
        >
          Page not found
        </h1>

        <p className="mt-3 max-w-prose text-sm sm:text-base text-slate-600 dark:text-slate-400">
          The page you’re looking for can’t be found or may have been moved.
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center rounded-full px-4 py-2 text-sm font-medium
                       ring-1 ring-slate-300 hover:bg-slate-50
                       text-slate-800 dark:text-slate-100 dark:ring-slate-700 dark:hover:bg-slate-900"
          >
            Go Home
          </Link>

          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center rounded-full px-4 py-2 text-sm font-medium
                       text-slate-600 hover:text-slate-900
                       dark:text-slate-400 dark:hover:text-white"
          >
            Go Back
          </button>
        </div>

        {/* Decorative line */}
        <div
          aria-hidden
          className="mt-10 h-px w-24 sm:w-32 bg-gradient-to-r from-transparent via-slate-300 to-transparent dark:via-slate-700"
        />
      </section>
    </main>
  );
}