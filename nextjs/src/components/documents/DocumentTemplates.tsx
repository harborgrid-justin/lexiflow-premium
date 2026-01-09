'use client';

import { DraftingApiService, DraftingTemplate } from '@/api/domains/drafting.api';
import { Button } from '@/components/ui/shadcn/button';
import { Card, CardContent } from "@/components/ui/shadcn/card";
import { Badge } from "@/components/ui/shadcn/badge";
import { AdaptiveLoader } from '@/components/ui/molecules/AdaptiveLoader/AdaptiveLoader';
import { ArrowRight, FileText, Wand2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Template {
  id: string;
  title: string;
  category: string;
  popular: boolean;
}

export function DocumentTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTemplates() {
      try {
        const api = DraftingApiService.getInstance();
        const data = await api.getTemplates(6);

        const mappedTemplates: Template[] = data.map((t: DraftingTemplate) => ({
          id: t.id,
          title: t.name,
          category: t.category,
          popular: t.usageCount > 50,
        }));

        setTemplates(mappedTemplates);
      } catch (error) {
        console.error('Failed to load templates:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTemplates();
  }, []);

  if (isLoading) return <AdaptiveLoader contentType="dashboard" itemCount={6} shimmer />;

  return (
    <div className="space-y-6 animate-in fade-in">
      <Card className="bg-muted/40 border-dashed shadow-none">
        <CardContent className="p-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold flex items-center">
              <Wand2 className="h-5 w-5 mr-2 text-primary" /> Automated Drafting
            </h3>
            <p className="text-sm text-muted-foreground">Select a template to launch the AI-assisted document assembly wizard.</p>
          </div>
          <Button>Create New Template</Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(tpl => (
          <Card
            key={tpl.id}
            className="group cursor-pointer hover:shadow-md transition-all hover:border-primary/50"
          >
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-3">
                <div className="p-2 rounded-lg bg-accent">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                {tpl.popular && (
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-400 hover:bg-emerald-100">
                    Popular
                  </Badge>
                )}
              </div>
              <h4 className="font-semibold text-sm mb-1">{tpl.title}</h4>
              <p className="text-xs text-muted-foreground mb-4">{tpl.category}</p>

              <div className="pt-3 border-t flex justify-between items-center">
                <span className="text-xs font-medium text-muted-foreground">v2.4</span>
                <span className="text-xs font-semibold flex items-center text-primary group-hover:translate-x-1 transition-transform">
                  Start Draft <ArrowRight className="h-3 w-3 ml-1" />
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
