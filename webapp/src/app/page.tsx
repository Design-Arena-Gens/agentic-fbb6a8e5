import { JobSearchAgent } from "@/components/JobSearchAgent";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-12 px-6 py-16 sm:px-10 lg:px-16">
        <header className="max-w-3xl space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1 text-xs font-medium uppercase tracking-[0.28em] text-indigo-600">
            Hiring radar
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
            Agentic Intelligence for finding HR & company contacts before you apply.
          </h1>
          <p className="text-lg leading-8 text-zinc-600">
            Discover recruiters, talent partners, and company snapshots for any job role
            in India or across the globe. Feed the agent a profile, get actionable leads
            with a single search.
          </p>
        </header>

        <JobSearchAgent />
      </main>

      <footer className="border-t border-zinc-200 bg-white/40">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-6 text-xs text-zinc-500 sm:px-10 lg:px-16">
          <p>Built for sourcing teams and ambitious candidates.</p>
          <p>
            Data powered by RapidAPI JSearch & Clearbit; always validate contacts before
            outreach.
          </p>
        </div>
      </footer>
    </div>
  );
}
