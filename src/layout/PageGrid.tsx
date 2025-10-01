import * as React from "react";
import { cn } from "@/lib/utils";

type PageGridProps = React.PropsWithChildren<{
  /** default column count (CSS var --cols). Can be overridden with utility like lg:[--cols:4] */
  cols?: number;
  className?: string;
  as?: keyof JSX.IntrinsicElements; // e.g., 'section' | 'div' | 'main'
}>;

/**
 * Structural grid that consumes the global tokens:
 *  --rowHpx  -> grid-auto-rows
 *  --gappx   -> gap
 *  --cols    -> grid-template-columns (fallbacks to `cols` prop then 12)
 */
export function PageGrid({ cols = 12, className, as = "div", children }: PageGridProps) {
  const Comp = as as React.ElementType;
  return (
    <Comp
      className={cn("page-grid", className)}
      style={{ ["--cols" as any]: String(cols) }}
    >
      {children}
    </Comp>
  );
}
