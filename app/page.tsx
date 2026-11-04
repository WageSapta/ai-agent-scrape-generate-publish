import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Workbench } from "@/components/workbench";

const PIPELINE = ["Firecrawl", "OpenRouter", "Pollinations", "Dev.to", "cron-job.org"];

export default function Home() {
  return (
    <div className="relative z-10 flex min-h-dvh flex-col">
      <header className="border-b border-line/70">
        <div className="mx-auto flex w-full max-w-[1320px] items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link href="/" className="group flex items-center gap-3">
            <span className="display grid h-9 w-9 place-items-center rounded-full border border-brass/40 bg-brass/10 text-brass-soft transition-colors group-hover:bg-brass/15">
              <Sparkles className="h-4 w-4" aria-hidden />
            </span>
            <span className="leading-tight">
              <span className="block text-[0.66rem] uppercase tracking-[0.2em] text-bone">
                Hotel AI Auto-Publisher
              </span>
              <span className="block text-[0.6rem] tracking-[0.08em] text-muted">
                Hotel Atelier · AI editorial desk
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-2 rounded-full border border-line px-3 py-1.5 text-[0.62rem] tracking-[0.04em] text-muted sm:inline-flex">
              <span className="relative flex h-1.5 w-1.5" aria-hidden>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sage opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-sage" />
              </span>
              cron-job.org · every 2h
            </span>
            <Badge variant="outline">Stateless</Badge>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Workbench />
      </main>

      <div className="mt-16 border-y border-line/70 bg-panel/30">
        <div className="mx-auto flex w-full max-w-[1320px] flex-wrap items-center justify-center gap-x-4 gap-y-2 px-5 py-3 text-[0.57rem] uppercase tracking-[0.2em] text-muted/60 sm:px-8">
          {PIPELINE.map((item, index) => (
            <span key={item} className="flex items-center gap-4">
              {index > 0 ? <ArrowRight className="h-2.5 w-2.5 text-brass/40" aria-hidden /> : null}
              {item}
            </span>
          ))}
        </div>
      </div>

      <footer>
        <div className="mx-auto w-full max-w-[1320px] px-5 py-9 sm:px-8">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-start">
            <div className="max-w-sm">
              <p className="display text-2xl text-bone">Hotel Atelier</p>
              <p className="mt-2 text-[0.72rem] leading-relaxed text-muted">
                An autonomous editorial desk for hospitality. A spec-driven build: no database, no
                stored drafts, no manual copywriting.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 text-[0.7rem] sm:grid-cols-3">
              <div>
                <p className="text-[0.56rem] uppercase tracking-[0.16em] text-muted/60">Pipeline</p>
                <ul className="mt-2 space-y-1 text-bone/65">
                  <li>Firecrawl</li>
                  <li>OpenRouter</li>
                  <li>Pollinations</li>
                  <li>Dev.to API</li>
                </ul>
              </div>
              <div>
                <p className="text-[0.56rem] uppercase tracking-[0.16em] text-muted/60">Scheduler</p>
                <ul className="mt-2 space-y-1 text-bone/65">
                  <li>cron-job.org</li>
                  <li>GET /api/cron</li>
                  <li>Every 2 hours</li>
                  <li>Bearer secret</li>
                </ul>
              </div>
              <div>
                <p className="text-[0.56rem] uppercase tracking-[0.16em] text-muted/60">Elsewhere</p>
                <ul className="mt-2 space-y-1">
                  <li>
                    <a
                      href="https://dev.to/wxgx"
                      target="_blank"
                      rel="noreferrer"
                      className="text-bone/65 underline decoration-line underline-offset-4 transition-colors hover:text-brass-soft hover:decoration-brass/50"
                    >
                      Dev.to / wxgx
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://cron-job.org"
                      target="_blank"
                      rel="noreferrer"
                      className="text-bone/65 underline decoration-line underline-offset-4 transition-colors hover:text-brass-soft hover:decoration-brass/50"
                    >
                      cron-job.org
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-2 border-t border-line/60 pt-5 text-[0.6rem] text-muted/55 sm:flex-row sm:items-center sm:justify-between">
            <span>Stateless by design — nothing is stored between requests.</span>
            <span>Firecrawl · OpenRouter · Pollinations · Dev.to</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
