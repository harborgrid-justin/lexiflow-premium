'use client';

import { DraftingApiService, DraftingTemplate } from '@/api/domains/drafting.api';
import { Button } from '@/components/ui/atoms/Button/Button';
import { AdaptiveLoader } from '@/components/ui/molecules/AdaptiveLoader/AdaptiveLoader';
import { cn } from '@/lib/utils';
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
          category: t.category, // Enum to string works generally
          popular: t.usageCount > 50, // Arbitrary threshold for 'popular'
        }));

        setTemplates(mappedTemplates);
      } catch (error) {
        console.error('Failed to load templates:', error);
        // Fallback or empty state could be handled here
      } finally {
        setIsLoading(false);
      }
    }
    fetchTemplates();
  }, []);

  if (isLoading) return <AdaptiveLoader contentType="dashboard" itemCount={6} shimmer />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className={cn(
        "p-6 rounded-lg shadow-sm border flex justify-between items-center",
        "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
      )}>
        <div>
          <h3 className={cn("text-lg font-bold flex items-center", "text-gray-900 dark:text-gray-100")}>
            <Wand2 className="h-5 w-5 mr-2 text-purple-600" /> Automated Drafting
          </h3>
          <p className={cn("text-sm", "text-gray-500 dark:text-gray-400")}>Select a template to launch the AI-assisted document assembly wizard.</p>
        </div>
        <Button variant="primary">Create New Template</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(tpl => (
          <div
            key={tpl.id}
            className={cn(
              "group p-5 rounded-xl border shadow-sm transition-all cursor-pointer hover:shadow-md",
              "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800",
              "hover:border-blue-200 dark:hover:border-blue-800"
            )}
          >
            <div className="flex justify-between items-start mb-3">
              <div className={cn("p-2 rounded-lg", "bg-gray-50 dark:bg-gray-800")}>
                <FileText className={cn("h-6 w-6", "text-blue-600 dark:text-blue-400")} />
              </div>
              {tpl.popular && (
                <span className={cn(
                  "text-[10px] font-bold px-2 py-1 rounded-full uppercase",
                  "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                )}>Popular</span>
              )}
            </div>
            <h4 className={cn("font-bold text-sm mb-1", "text-gray-900 dark:text-gray-100")}>{tpl.title}</h4>
            <p className={cn("text-xs mb-4", "text-gray-500 dark:text-gray-400")}>{tpl.category}</p>

            <div className={cn("pt-3 border-t flex justify-between items-center", "border-gray-200 dark:border-gray-800")}>
              <span className={cn("text-xs font-medium", "text-gray-400 dark:text-gray-500")}>v2.4</span>
              <span className={cn(
                "text-xs font-bold flex items-center transition-colors",
                "text-blue-600 dark:text-blue-400",
                "group-hover:translate-x-1"
              )}>
                Start Draft <ArrowRight className="h-3 w-3 ml-1" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
