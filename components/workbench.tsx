"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  Check,
  CircleAlert,
  CircleDot,
  Link as LinkIcon,
  LoaderCircle,
  Lock,
  Sparkles,
  WandSparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DistributionCard,
  EmptyCards,
  NarrativeCard,
  SkeletonCards,
  SourceCard,
} from "@/components/result-cards";
import { composeArticleMarkdown } from "@/lib/markdown";
import type { AgentResult, PublishedPost } from "@/lib/types";
import { cn, parsePublicHttpUrl } from "@/lib/utils";

const SAMPLES = [
  { label: "AYANA Bali", url: "https://www.ayana.com/bali/" },
  { label: "Four Seasons Sayan", url: "https://www.fourseasons.com/sayan/" },
  { label: "Bulgari Resort", url: "https://www.bulgarihotels.com/en_US/bali" },
  { label: "Potato Head", url: "https://www.potatohead.co/" },
];

const STEPS = [
  { label: "Read", detail: "Firecrawl", icon: CircleDot },
  { label: "Compose", detail: "OpenRouter", icon: Sparkles },
  { label: "Render", detail: "Pollinations", icon: WandSparkles },
  { label: "Publish", detail: "Dev.to", icon: ArrowUpRight },
];

type StepState = "idle" | "active" | "done";

export function Workbench() {
  const reduceMotion = useReducedMotion();
  const resultsRef = useRef<HTMLElement | null>(null);

  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<AgentResult | null>(null);
  const [runError, setRunError] = useState("");

  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState("");
  const [article, setArticle] = useState<PublishedPost | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isLoading) return;

    const first = window.setTimeout(() => setLoadingStep(1), 7_000);
    const second = window.setTimeout(() => setLoadingStep(2), 18_000);

    return () => {
      window.clearTimeout(first);
      window.clearTimeout(second);
    };
  }, [isLoading]);

  async function handleRun(nextUrl?: string) {
    const target = (nextUrl ?? url).trim();
    setRunError("");

    if (!target) {
      const message = "Paste the URL of an official hotel page first.";
      setRunError(message);
      toast.error("Hotel URL required", { description: message });
      return;
    }

    if (!parsePublicHttpUrl(target)) {
      const message =
        "That does not look like a valid public http(s) URL. Try the property's official page.";
      setRunError(message);
      toast.error("Invalid hotel URL", { description: message });
      return;
    }

    setUrl(target);
    setIsLoading(true);
    setLoadingStep(0);
    setResult(null);
    setArticle(null);
    setPublishError("");
    setCopied(false);

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: target }),
      });
      const payload = (await response.json().catch(() => null)) as
        | (AgentResult & { error?: string })
        | null;

      if (!response.ok || !payload || payload.error) {
        throw new Error(payload?.error || "The agent could not finish this run.");
      }

      setResult(payload);
      toast.success("Draft ready", {
        description: `${payload.scraped.hotelName} is ready to review.`,
      });
      window.setTimeout(() => {
        resultsRef.current?.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "start",
        });
      }, 140);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "The agent could not finish this run.";
      setRunError(message);
      toast.error("Agent run failed", { description: message });
    } finally {
      setIsLoading(false);
    }
  }

  async function handlePublish() {
    if (!result) return;

    setIsPublishing(true);
    setPublishError("");

    try {
      const response = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: result.publishToken }),
      });
      const payload = (await response.json().catch(() => null)) as
        | { success?: boolean; article?: PublishedPost; error?: string }
        | null;

      if (!response.ok || !payload?.article) {
        throw new Error(payload?.error || "Dev.to rejected the article.");
      }

      const publishedUrl = payload.article.url;
      setArticle(payload.article);
      toast.success("Published to Dev.to", {
        description: publishedUrl,
        action: {
          label: "Open",
          onClick: () => window.open(publishedUrl, "_blank", "noopener,noreferrer"),
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Dev.to rejected the article.";
      setPublishError(message);
      toast.error("Publish failed", { description: message });
    } finally {
      setIsPublishing(false);
    }
  }

  async function handleCopy() {
    if (!result) return;

    const markdown = composeArticleMarkdown({
      hotelName: result.scraped.hotelName,
      location: result.scraped.location,
      excerpt: result.content.excerpt,
      blogText: result.content.blogText,
      sourceUrl: result.sourceUrl,
      imageUrl: result.imageUrl,
    });

    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2_200);
    } catch {
      const message = "Clipboard access was blocked by the browser.";
      setRunError(message);
      toast.error("Copy failed", { description: message });
    }
  }

  const stepState = (index: number): StepState => {
    if (article) return "done";
    if (isPublishing && index === 3) return "active";
    if (result) return index === 3 ? "idle" : "done";
    if (!isLoading) return "idle";
    if (index < loadingStep) return "done";
    if (index === loadingStep) return "active";
    return "idle";
  };

  const statusText = isPublishing
    ? "Sending the finished story to Dev.to…"
    : article
      ? "Published. The story is live and the next cron run is queued."
      : isLoading
        ? [
            "Reading the property page and extracting verified facts…",
            "Commissioning the editorial narrative…",
            "Rendering the hero image URL…",
          ][loadingStep]
        : result
          ? "Draft ready. Review the three panels, then publish."
          : "Idle. Paste a hotel URL or start from a reference below.";

  return (
    <div className="mx-auto w-full max-w-[1320px] px-5 sm:px-8">
      <section className="grid gap-10 pt-12 pb-9 lg:grid-cols-[1.12fr_0.88fr] lg:items-start lg:gap-16 lg:pt-16">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-gradient-to-r from-brass to-transparent" aria-hidden />
            <span className="eyebrow text-brass-soft/90">Track B · autonomous editorial agent</span>
          </div>

          <h1 className="display mt-6 text-[clamp(3rem,6.2vw,5.4rem)] leading-[0.96] text-bone">
            A hotel page in.
            <br />
            <span className="italic text-brass-soft">A published story</span> out.
          </h1>

          <p className="mt-6 max-w-xl text-[0.95rem] leading-[1.85] text-muted">
            Hotel Atelier reads a property&apos;s official page, writes a finished feature in
            Indonesian, renders its hero image, and publishes the whole package to Dev.to. Every two
            hours, a new story ships itself.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.64rem] uppercase tracking-[0.14em] text-muted/80">
            <span className="flex items-center gap-1.5">
              <CircleDot className="h-2.5 w-2.5 text-sage" aria-hidden />
              Stateless pipeline
            </span>
            <span className="flex items-center gap-1.5">
              <CircleDot className="h-2.5 w-2.5 text-sage" aria-hidden />
              No database
            </span>
            <span className="flex items-center gap-1.5">
              <CircleDot className="h-2.5 w-2.5 text-sage" aria-hidden />
              Signed publish tokens
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.12, ease: "easeOut" }}
        >
          <Card className="bg-panel/80">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brass/60 to-transparent" aria-hidden />
            <div className="flex items-center justify-between border-b border-line/80 px-5 py-4">
              <div>
                <p className="eyebrow text-brass">New commission</p>
                <p className="mt-1 text-sm text-bone">Send the agent to a hotel.</p>
              </div>
              <Badge variant="sage">ready</Badge>
            </div>

            <div className="p-5">
              <form
                noValidate
                onSubmit={(event) => {
                  event.preventDefault();
                  void handleRun();
                }}
              >
                <label
                  htmlFor="hotel-url"
                  className="text-[0.6rem] uppercase tracking-[0.16em] text-muted"
                >
                  Official hotel URL
                </label>
                <div className="relative mt-2">
                  <LinkIcon
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
                    aria-hidden
                  />
                  <Input
                    id="hotel-url"
                    name="url"
                    type="url"
                    inputMode="url"
                    autoComplete="url"
                    spellCheck={false}
                    placeholder="https://www.ayana.com/bali/"
                    className="pl-10"
                    value={url}
                    onChange={(event) => setUrl(event.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="mt-3 w-full"
                  disabled={isLoading}
                  aria-busy={isLoading}
                >
                  {isLoading ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    <WandSparkles className="h-4 w-4" aria-hidden />
                  )}
                  {isLoading ? "Processing..." : "Run Agent"}
                </Button>
              </form>

              <AnimatePresence>
                {runError ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div
                      role="alert"
                      className="mt-3 flex items-start gap-2 rounded-lg border border-ember/30 bg-ember/[0.07] px-3 py-2.5 text-[0.72rem] leading-relaxed text-ember"
                    >
                      <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                      <span className="flex-1">{runError}</span>
                      <button
                        type="button"
                        onClick={() => setRunError("")}
                        className="rounded p-0.5 transition-colors hover:bg-white/10"
                        aria-label="Dismiss error"
                      >
                        <X className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <div className="mt-5">
                <p className="text-[0.58rem] uppercase tracking-[0.16em] text-muted/70">
                  Or start from a reference
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {SAMPLES.map((sample) => (
                    <button
                      key={sample.url}
                      type="button"
                      onClick={() => void handleRun(sample.url)}
                      disabled={isLoading}
                      className="rounded-full border border-line bg-white/[0.02] px-3 py-1.5 text-[0.66rem] text-bone/70 transition-colors hover:border-brass/40 hover:bg-brass/[0.06] hover:text-bone disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {sample.label}
                    </button>
                  ))}
                </div>
              </div>

              <p className="mt-5 flex items-start gap-2 border-t border-line/70 pt-4 text-[0.64rem] leading-relaxed text-muted/80">
                <Lock className="mt-0.5 h-3 w-3 shrink-0 text-brass/70" aria-hidden />
                Generation happens server-side. The browser only receives a short-lived signed
                token, never the Dev.to key.
              </p>
            </div>
          </Card>
        </motion.div>
      </section>

      <section aria-label="Agent pipeline status">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-4">
          {STEPS.map((step, index) => {
            const state = stepState(index);
            const Icon = step.icon;

            return (
              <div key={step.label} className="flex items-center gap-3 bg-panel/90 px-4 py-3.5">
                <span
                  className={cn(
                    "grid h-7 w-7 shrink-0 place-items-center rounded-full border text-[0.6rem] transition-colors",
                    state === "done" && "border-sage/40 bg-sage/10 text-sage",
                    state === "active" && "border-brass/50 bg-brass/10 text-brass-soft",
                    state === "idle" && "border-line bg-white/[0.02] text-muted/60",
                  )}
                >
                  {state === "done" ? (
                    <Check className="h-3.5 w-3.5" aria-hidden />
                  ) : state === "active" ? (
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brass" aria-hidden />
                  ) : (
                    <Icon className="h-3.5 w-3.5" aria-hidden />
                  )}
                </span>
                <div className="min-w-0">
                  <p
                    className={cn(
                      "text-[0.72rem] font-medium",
                      state === "idle" ? "text-muted/70" : "text-bone",
                    )}
                  >
                    {step.label}
                  </p>
                  <p className="truncate text-[0.58rem] uppercase tracking-[0.14em] text-muted/60">
                    {step.detail}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        <p
          role="status"
          aria-live="polite"
          className="mt-3 flex items-center gap-2 text-[0.68rem] text-muted"
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              isLoading || isPublishing
                ? "animate-pulse bg-brass"
                : article
                  ? "bg-sage"
                  : "bg-muted/40",
            )}
            aria-hidden
          />
          {statusText}
        </p>
      </section>

      <section ref={resultsRef} className="mt-11 scroll-mt-6">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-muted/70">The dispatch</p>
            <h2 className="display mt-1.5 text-[2.1rem] leading-none text-bone sm:text-[2.5rem]">
              Source. Story. Signal.
            </h2>
          </div>
          {result ? (
            <p className="hidden text-right text-[0.62rem] uppercase tracking-[0.14em] text-muted/70 sm:block">
              Draft generated
              <br />
              <span className="text-bone/60">
                {new Date(result.generatedAt).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </p>
          ) : (
            <p className="hidden text-right text-[0.62rem] uppercase tracking-[0.14em] text-muted/60 sm:block">
              Three panels
              <br />
              <span className="text-bone/50">one dispatch</span>
            </p>
          )}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {isLoading ? (
            <SkeletonCards />
          ) : result ? (
            <>
              {[0, 1, 2].map((index) => (
                <motion.div
                  key={index}
                  initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
                  className="min-w-0"
                >
                  {index === 0 ? <SourceCard result={result} /> : null}
                  {index === 1 ? (
                    <NarrativeCard result={result} copied={copied} onCopy={() => void handleCopy()} />
                  ) : null}
                  {index === 2 ? (
                    <DistributionCard
                      result={result}
                      article={article}
                      isPublishing={isPublishing}
                      error={publishError}
                      onPublish={() => void handlePublish()}
                    />
                  ) : null}
                </motion.div>
              ))}
            </>
          ) : (
            <EmptyCards />
          )}
        </div>
      </section>

      <p className="mt-8 flex items-center justify-center gap-2 text-center text-[0.62rem] text-muted/50">
        <Sparkles className="h-3 w-3" aria-hidden />
        Drafts expire after two hours. Nothing is stored between requests.
      </p>
    </div>
  );
}
