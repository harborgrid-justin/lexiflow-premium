import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/cn';
import { Book, Briefcase, Building, Database, FileText, Users } from 'lucide-react';

export type Category = 'users' | 'cases' | 'clients' | 'clauses' | 'documents';

interface EntitySidebarProps {
  activeCategory: Category;
  setActiveCategory: (cat: Category) => void;
  counts: Record<Category, number>;
}

export function EntitySidebar({ activeCategory, setActiveCategory, counts }: EntitySidebarProps) {
  const { theme } = useTheme();
  const categories = [
    { id: 'users', label: 'Users', icon: Users },
    { id: 'cases', label: 'Cases', icon: Briefcase },
    { id: 'clients', label: 'Clients', icon: Building },
    { id: 'clauses', label: 'Clauses', icon: Book },
    { id: 'documents', label: 'Docs', icon: FileText },
  ];

  return (
    <div className={cn("w-full md:w-64 border-b md:border-b-0 md:border-r flex flex-col", theme.surface.default, theme.border.default)}>
      <div className={cn("p-4 border-b hidden md:block", theme.border.subtle)}>
        <h3 className={cn("font-bold flex items-center text-sm uppercase tracking-wide", theme.text.primary)}>
          <Database className="h-4 w-4 mr-2 text-blue-600" /> Data Entities
        </h3>
      </div>
      <nav className="flex md:flex-col overflow-x-auto md:overflow-y-auto p-2 space-x-2 md:space-x-0 md:space-y-1">
        {categories.map(cat => {
          const Icon = cat.icon;
          const count = counts[cat.id as Category];
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as Category)}
              className={cn(
                "flex-shrink-0 w-auto md:w-full flex items-center justify-between px-3 py-3 rounded-lg text-sm font-medium transition-all border",
                activeCategory === cat.id
                  ? cn(theme.primary.light, theme.primary.text, "shadow-sm", theme.primary.border)
                  : cn("border-transparent", theme.text.secondary, `hover:${theme.surface.highlight}`, `hover:${theme.text.primary}`)
              )}
            >
              <div className="flex items-center">
                <Icon className={cn("h-4 w-4 mr-2 md:mr-3", activeCategory === cat.id ? "text-blue-600" : theme.text.tertiary)} />
                {cat.label}
              </div>
              <span className={cn("hidden md:inline-block px-2 py-0.5 rounded-full text-xs border shadow-sm", theme.surface.default, theme.border.default, theme.text.secondary)}>{count}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
