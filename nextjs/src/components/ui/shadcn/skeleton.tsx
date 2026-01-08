"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Enterprise Skeleton Component
 * Loading placeholder with pulse animation
 * Used to show content loading states with professional animation
 */

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export { Skeleton };
