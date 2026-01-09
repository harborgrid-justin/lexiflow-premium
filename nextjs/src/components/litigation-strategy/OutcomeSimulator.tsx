'use client';

import { Card, CardContent } from "@/components/ui/shadcn/card";
import { Activity } from "lucide-react";

export const OutcomeSimulator = () => {
  return (
    <Card className="h-full border-dashed">
      <CardContent className="h-full flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
        <Activity className="h-10 w-10 mb-4 opacity-20" />
        <p className="text-lg font-medium mb-2">Outcome Simulator</p>
        <p className="text-sm max-w-sm mx-auto">
          The Monte Carlo simulation engine is being initialized. This module will allow you to predict case outcomes based on historical data.
        </p>
      </CardContent>
    </Card>
  );
};
