"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ArrowUpRight,
  Check,
  CircleAlert,
  Clock3,
  Copy,
  ExternalLink,
  Image as ImageIcon,
  MapPin,
  Quote,
  Send,
  Sparkles,
  Star,
  WandSparkles,
} from "lucide-react";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { AgentResult, PublishedPost } from "@/lib/types";
import { cn, hostnameLabel } from "@/lib/utils";

type BadgeVariant = BadgeProps["variant"];

function CardHeading({
  index,
  title,
  badge,
  badgeVariant,
}: {
  index: string;
  title: string;
  badge: string;
  badgeVariant?: BadgeVariant;
}) {
  return (
    <CardHeader className="border-b border-line/80 px-5 py-3.5">
      <div className="flex items-center gap-2.5">
        <span className="font-mono text-[0.62rem] tracking-[0.14em] text-brass/80">{index}</span>
        <CardTitle>{title}</CardTitle>
      </div>
      <Badge variant={badgeVariant}>{badge}</Badge>
    </CardHeader>
  );
}

function CardTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-muted">
      {children}
    </h3>
  );
}

function SmartImage({
  src,
  alt,
  className,
  sizes = "(min-width: 1024px) 33vw, 100vw",
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={cn("relative overflow-hidden bg-panel-2", className)}>
      {failed || !src ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[radial-gradient(120%_100%_at_20%_0%,rgba(214,167,86,0.16),transparent_55%),radial-gradient(100%_100%_at_90%_100%,rgba(140,168,150,0.13),transparent_60%)] text-muted">
          <ImageIcon className="h-6 w-6" aria-hidden />
          <span className="text-[0.62rem] uppercase tracking-[0.16em]">Visual unavailable</span>
        </div>
      ) : (
        <>
          {!loaded ? <Skeleton className="absolute inset-0 rounded-none" aria-hidden /> : null}
          <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes}
            unoptimized
            priority={priority}
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
            className={cn(
              "object-cover transition-opacity duration-700",
              loaded ? "opacity-100" : "opacity-0",
            )}
          />
        </>
      )}
    </div>
  );
}

export function SourceCard({ result }: { result: AgentResult }) {
  const { scraped } = result;
  const facts = [
    scraped.starRating
      ? {
          label: "Star rating",
          value: `${"★".repeat(Math.min(5, Math.round(scraped.starRating)))} ${scraped.starRating.toFixed(0)}`,
        }
      : null,
    scraped.rating ? { label: "Guest score", value: `${scraped.rating.toFixed(1)}/10` } : null,
    scraped.pricePerNight
      ? {
          label: "From",
          value: [scraped.currency, scraped.pricePerNight].filter(Boolean).join(" "),
        }
      : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  return (
    <Card className="flex h-full flex-col">
      <CardHeading index="01" title="Source intelligence" badge="Firecrawl" badgeVariant="brass" />

      <div className="relative">
        <SmartImage
          src={scraped.imageUrl}
          alt={`${scraped.hotelName} — ${scraped.location}`}
          className="aspect-[4/3] w-full"
          sizes="(min-width: 1024px) 32vw, 100vw"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent px-5 pb-4 pt-14">
          <p className="flex items-center gap-1.5 text-[0.66rem] uppercase tracking-[0.14em] text-brass-soft/90">
            <MapPin className="h-3 w-3" aria-hidden />
            {scraped.location}
          </p>
          <h3 className="display mt-1 text-[1.75rem] leading-tight text-bone">
            {scraped.hotelName}
          </h3>
        </div>
      </div>

      <CardContent className="flex flex-1 flex-col gap-4 pt-4">
        <p className="line-clamp-4 text-[0.82rem] leading-relaxed text-bone/70">
          {scraped.description}
        </p>

        {facts.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {facts.map((fact) => (
              <div
                key={fact.label}
                className="rounded-lg border border-line/80 bg-white/[0.015] px-3 py-2"
              >
                <p className="text-[0.58rem] uppercase tracking-[0.14em] text-muted">
                  {fact.label}
                </p>
                <p className="mt-0.5 truncate text-[0.78rem] text-bone/90">{fact.value}</p>
              </div>
            ))}
          </div>
        ) : null}

        {scraped.facilities.length > 0 ? (
          <div>
            <p className="text-[0.58rem] uppercase tracking-[0.14em] text-muted">Facilities</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {scraped.facilities.slice(0, 6).map((facility) => (
                <span
                  key={facility}
                  className="rounded-full border border-line bg-white/[0.02] px-2.5 py-1 text-[0.66rem] text-bone/70"
                >
                  {facility}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {scraped.roomTypes.length > 0 ? (
          <p className="text-[0.68rem] leading-relaxed text-muted">
            <span className="text-bone/50">Stays: </span>
            {scraped.roomTypes.slice(0, 4).join(" · ")}
          </p>
        ) : null}

        {scraped.address ? (
          <p className="text-[0.68rem] leading-relaxed text-muted">{scraped.address}</p>
        ) : null}
      </CardContent>

      <CardFooter className="mt-auto flex items-center justify-between gap-3">
        <a
          href={result.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-w-0 items-center gap-1.5 text-[0.7rem] text-brass-soft/90 transition-colors hover:text-brass-soft"
        >
          <span className="truncate">{hostnameLabel(result.sourceUrl)}</span>
          <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
        </a>
        <span className="shrink-0 text-[0.6rem] uppercase tracking-[0.14em] text-muted/70">
          verified read
        </span>
      </CardFooter>
    </Card>
  );
}

export function NarrativeCard({
  result,
  copied,
  onCopy,
}: {
  result: AgentResult;
  copied: boolean;
  onCopy: () => void;
}) {
  const words = result.content.blogText.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));

  return (
    <Card className="flex h-full flex-col">
      <CardHeading index="02" title="Generated narrative" badge="OpenRouter" badgeVariant="sage" />

      <div className="relative">
        <SmartImage
          src={result.imageUrl}
          alt={`AI-generated hero image for ${result.scraped.hotelName}`}
          className="aspect-[16/9] w-full border-b border-line/80"
          sizes="(min-width: 1024px) 33vw, 100vw"
        />
        <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/55 px-2 py-1 text-[0.55rem] uppercase tracking-[0.14em] text-white/80 backdrop-blur">
          <Sparkles className="h-2.5 w-2.5" aria-hidden />
          Pollinations · Flux
        </span>
      </div>

      <CardContent className="flex flex-1 flex-col pt-5">
        <h3 className="display text-[1.9rem] leading-[1.1] text-bone">{result.content.title}</h3>
        <p className="mt-3 text-[0.83rem] italic leading-relaxed text-muted">
          {result.content.excerpt}
        </p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {result.content.tags.map((tag) => (
            <Badge key={tag} variant="default" className="lowercase tracking-[0.04em]">
              #{tag}
            </Badge>
          ))}
        </div>

        <div className="my-5 h-px w-full bg-line" />

        <div className="article-preview max-h-[400px] overflow-y-auto pr-2 whitespace-pre-wrap">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({ href, children }) => (
                <a href={href} target="_blank" rel="noreferrer">
                  {children}
                </a>
              ),
            }}
          >
            {result.content.blogText}
          </ReactMarkdown>
        </div>
      </CardContent>

      <CardFooter className="mt-auto flex items-center justify-between gap-2">
        <span className="text-[0.66rem] tabular-nums text-muted">
          {words.toLocaleString("en-US")} words · {minutes} min read
        </span>
        <Button variant="ghost" size="sm" onClick={onCopy} aria-live="polite">
          {copied ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
          {copied ? "Copied" : "Copy markdown"}
        </Button>
      </CardFooter>
    </Card>
  );
}

export function DistributionCard({
  result,
  article,
  isPublishing,
  error,
  onPublish,
}: {
  result: AgentResult;
  article: PublishedPost | null;
  isPublishing: boolean;
  error: string;
  onPublish: () => void;
}) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeading index="03" title="Visual & distribution" badge="Dev.to" badgeVariant="sage" />

      <CardContent className="flex flex-1 flex-col gap-4 pt-4">
        <div>
          <div className="flex items-center justify-between text-[0.58rem] uppercase tracking-[0.14em] text-muted">
            <span>Image prompt</span>
            <WandSparkles className="h-3 w-3" aria-hidden />
          </div>
          <p className="mt-2 max-h-[74px] overflow-y-auto rounded-lg border border-line bg-black/20 p-2.5 text-[0.68rem] leading-relaxed text-muted">
            {result.content.imagePrompt}
          </p>
        </div>

        <div className="rounded-xl border border-line bg-white/[0.02] p-3">
          <Quote className="h-3.5 w-3.5 text-brass/70" aria-hidden />
          <p className="mt-1.5 text-[0.72rem] leading-relaxed text-bone/75">
            {result.content.socialCaption}
          </p>
        </div>

        {article ? (
          <div className="rounded-xl border border-sage/30 bg-sage/[0.07] p-3">
            <p className="flex items-center gap-1.5 text-[0.68rem] font-medium uppercase tracking-[0.12em] text-sage">
              <Check className="h-3.5 w-3.5" aria-hidden />
              Live on Dev.to
            </p>
            <a
              href={article.url}
              target="_blank"
              rel="noreferrer"
              className="mt-1.5 block truncate text-[0.78rem] text-brass-soft underline decoration-brass/40 underline-offset-4 hover:decoration-brass"
            >
              {article.url}
            </a>
            <p className="mt-1 text-[0.62rem] text-muted">
              {new Date(article.publishedAt).toLocaleString("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </div>
        ) : null}

        {error ? (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-ember/30 bg-ember/[0.07] px-3 py-2 text-[0.7rem] leading-relaxed text-ember"
          >
            <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            {error}
          </p>
        ) : null}
      </CardContent>

      <CardFooter className="mt-auto space-y-3">
        {article ? (
          <a
            href={article.url}
            target="_blank"
            rel="noreferrer"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full")}
          >
            Open published story
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </a>
        ) : (
          <Button size="lg" className="w-full" onClick={onPublish} disabled={isPublishing}>
            {isPublishing ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
            ) : (
              <Send className="h-4 w-4" aria-hidden />
            )}
            {isPublishing ? "Publishing…" : "Publish to Dev.to"}
          </Button>
        )}

        <p className="flex items-start gap-2 text-[0.62rem] leading-relaxed text-muted">
          <Clock3 className="mt-0.5 h-3 w-3 shrink-0 text-brass/70" aria-hidden />
          The cron-job.org loop revisits this pipeline every 2 hours. Signed draft valid for 2 hours.
        </p>
      </CardFooter>
    </Card>
  );
}

export function EmptyCards() {
  const cards = [
    {
      index: "01",
      title: "Source intelligence",
      badge: "Firecrawl",
      variant: "brass" as const,
      icon: MapPin,
      text: "The property's official page is read and reduced to verified facts — name, location, facilities, imagery.",
    },
    {
      index: "02",
      title: "Generated narrative",
      badge: "OpenRouter",
      variant: "sage" as const,
      icon: Star,
      text: "A senior-editor prompt turns those facts into an 800-word Indonesian feature, title and tags included.",
    },
    {
      index: "03",
      title: "Visual & distribution",
      badge: "Dev.to",
      variant: "sage" as const,
      icon: Send,
      text: "A hero image is rendered, then the whole package is published under your Dev.to account.",
    },
  ];

  return (
    <>
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.index} className="flex min-h-[430px] flex-col border-dashed bg-panel/40">
            <CardHeading
              index={card.index}
              title={card.title}
              badge={card.badge}
              badgeVariant={card.variant}
            />
            <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-full border border-line bg-white/[0.02] text-muted">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <p className="text-[0.7rem] uppercase tracking-[0.16em] text-muted/80">
                Awaiting commission
              </p>
              <p className="max-w-[240px] text-[0.76rem] leading-relaxed text-muted/70">
                {card.text}
              </p>
            </div>
          </Card>
        );
      })}
    </>
  );
}

export function SkeletonCards() {
  return (
    <>
      {[0, 1, 2].map((index) => (
        <Card key={index} className="flex min-h-[430px] flex-col">
          <div className="flex items-center justify-between border-b border-line/80 px-5 py-4">
            <Skeleton className="h-2.5 w-28 rounded-full" />
            <Skeleton className="h-4 w-16 rounded-full" />
          </div>
          <div className="flex flex-1 flex-col gap-4 p-5">
            <Skeleton className="aspect-[4/3] w-full rounded-xl" />
            {index === 1 ? (
              <>
                <Skeleton className="h-6 w-11/12 rounded-md" />
                <Skeleton className="h-6 w-8/12 rounded-md" />
                <Skeleton className="h-3 w-full rounded-full" />
                <Skeleton className="h-3 w-full rounded-full" />
                <Skeleton className="h-3 w-9/12 rounded-full" />
                <div className="mt-2 space-y-2">
                  <Skeleton className="h-2.5 w-full rounded-full" />
                  <Skeleton className="h-2.5 w-full rounded-full" />
                  <Skeleton className="h-2.5 w-10/12 rounded-full" />
                </div>
              </>
            ) : (
              <>
                <Skeleton className="h-4 w-3/4 rounded-full" />
                <Skeleton className="h-3 w-full rounded-full" />
                <Skeleton className="h-3 w-5/6 rounded-full" />
                <div className="mt-auto grid grid-cols-2 gap-2">
                  <Skeleton className="h-12 rounded-lg" />
                  <Skeleton className="h-12 rounded-lg" />
                </div>
              </>
            )}
          </div>
        </Card>
      ))}
    </>
  );
}
