import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, type = "text", ...props }: ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "h-12 w-full min-w-0 rounded-xl border border-line bg-black/25 px-4 text-sm text-bone shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset] outline-none transition-colors placeholder:text-muted/60 hover:border-white/20 focus:border-brass/60 focus:ring-2 focus:ring-brass/15 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}
