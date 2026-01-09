'use client';

import { Card, CardContent } from "@/components/ui/shadcn/card";
import { Network } from "lucide-react";

export const StrategyCanvas = () => {
  return (
    <Card className="h-full border-dashed">
      <CardContent className="h-full flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
        <Network className="h-10 w-10 mb-4 opacity-20" />
        <p className="text-lg font-medium mb-2">Strategy Canvas</p>
        <p className="text-sm max-w-sm mx-auto">
          Visual strategy builder is under development. Map out case arguments, facts, and legal theories visually.
        </p>
      </CardContent>
    </Card>
  );
};
