import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[0.65rem] font-medium tracking-[0.08em] uppercase",
  {
    variants: {
      variant: {
        default: "border-line bg-white/[0.03] text-muted",
        brass: "border-brass/30 bg-brass/10 text-brass-soft",
        sage: "border-sage/30 bg-sage/10 text-sage",
        ember: "border-ember/30 bg-ember/10 text-ember",
        outline: "border-line bg-transparent text-bone/70",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export type BadgeProps = ComponentProps<"span"> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
