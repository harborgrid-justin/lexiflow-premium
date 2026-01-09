'use client';

import { Card, CardContent } from "@/components/ui/shadcn/card";
import { Library } from "lucide-react";

export const PlaybookLibrary = () => {
  return (
    <Card className="h-full border-dashed">
      <CardContent className="h-full flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
        <Library className="h-10 w-10 mb-4 opacity-20" />
        <p className="text-lg font-medium mb-2">Playbook Library</p>
        <p className="text-sm max-w-sm mx-auto">
          Access standardized litigation strategies and templates here.
        </p>
      </CardContent>
    </Card>
  );
};
