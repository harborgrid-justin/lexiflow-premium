
import React, { useState, useMemo } from 'react';
import { Search, Filter, BookOpen, Clock, BarChart2, Plus, ArrowRight, Shield, Globe, CheckCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';
import { Button } from '../common/Button';
import { LITIGATION_PLAYBOOKS, Playbook } from '../../data/mockLitigationPlaybooks';
import { VirtualGrid } from '../common/VirtualGrid';
import { useWindow } from '../../context/WindowContext';
import { PlaybookDetail } from './PlaybookDetail';

export const PlaybookLibrary: React.FC = () => {
  const { theme } = useTheme();
  const { openWindow, closeWindow } = useWindow();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(LITIGATION_PLAYBOOKS.map(p => p.category)))];
  
  const filteredPlaybooks = useMemo(() => {
    return LITIGATION_PLAYBOOKS.filter(pb => {
        const matchesSearch = pb.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              pb.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = selectedCategory === 'All' || pb.category === selectedCategory;
        const matchesDifficulty = selectedDifficulty === 'All' || pb.difficulty === selectedDifficulty;
        return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [searchTerm, selectedCategory, selectedDifficulty]);

  const handleOpenPlaybook = (pb: Playbook) => {
      const winId = `playbook-${pb.id}`;
      openWindow(
          winId,
          `Strategy: ${pb.title}`,
          <PlaybookDetail playbook={pb} onClose={() => closeWindow(winId)} />
      );
  };

  const getDifficultyColor = (diff: string) => {
      switch(diff) {
          case 'Low': return 'text-green-600 bg-green-50 border-green-200';
          case 'Medium': return 'text-blue-600 bg-blue-50 border-blue-200';
          case 'High': return 'text-purple-600 bg-purple-50 border-purple-200';
          default: return 'text-slate-600';
      }
  };

  const renderPlaybookCard = (pb: Playbook) => (
      <div className="p-3 h-full">
        <div 
            className={cn(
                "group flex flex-col h-full rounded-xl border shadow-sm transition-all hover:shadow-lg cursor-pointer bg-white dark:bg-slate-900 relative overflow-hidden",
                theme.border.default
            )}
            onClick={() => handleOpenPlaybook(pb)}
        >
            <div className={cn("absolute top-0 left-0 w-1 h-full transition-colors", 
                pb.difficulty === 'High' ? 'bg-purple-500' : pb.difficulty === 'Medium' ? 'bg-blue-500' : 'bg-green-500'
            )}></div>
            
            <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-3">
                    <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border", theme.surfaceHighlight, theme.text.secondary)}>
                        {pb.category}
                    </span>
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded border", getDifficultyColor(pb.difficulty))}>
                        {pb.difficulty}
                    </span>
                </div>
                
                <h3 className={cn("font-bold text-lg mb-2 line-clamp-2", theme.text.primary)}>{pb.title}</h3>
                <p className={cn("text-sm line-clamp-3 mb-4 flex-1", theme.text.secondary)}>{pb.description}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                    {pb.tags.slice(0, 3).map(tag => (
                        <span key={tag} className={cn("text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400")}>#{tag}</span>
                    ))}
                </div>

                {/* Readiness Indicator */}
                {pb.readiness && (
                    <div className="mb-4">
                        <div className="flex justify-between items-center text-[10px] font-bold mb-1">
                            <span className="text-green-600 flex items-center gap-1"><CheckCircle className="h-3 w-3"/> {pb.status || 'Ready'}</span>
                            <span className={theme.text.primary}>{pb.readiness}%</span>
                        </div>
                        <div className={cn("w-full h-1.5 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800")}>
                            <div className="h-full bg-green-500" style={{ width: `${pb.readiness}%` }}></div>
                        </div>
                    </div>
                )}

                <div className={cn("flex items-center justify-between pt-4 border-t", theme.border.light)}>
                    <div className={cn("flex items-center gap-3 text-xs", theme.text.tertiary)}>
                        <span className="flex items-center"><Globe className="h-3 w-3 mr-1"/> {pb.jurisdiction}</span>
                        <span className="flex items-center"><LayersIcon className="h-3 w-3 mr-1"/> {pb.phases} Phs</span>
                    </div>
                </div>
            </div>

            <div className={cn("p-3 bg-slate-50 dark:bg-slate-800/50 border-t flex justify-between items-center group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors", theme.border.default)}>
                <span className={cn("text-xs font-medium", theme.text.secondary)}>View Strategy</span>
                <ArrowRight className={cn("h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors transform group-hover:translate-x-1")}/>
            </div>
        </div>
      </div>
  );

  return (
    <div className="flex flex-col h-full">
        {/* Filters Header */}
        <div className={cn("p-4 border-b space-y-4 shrink-0", theme.surface, theme.border.default)}>
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="relative flex-1">
                    <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5", theme.text.tertiary)} />
                    <input 
                        className={cn("w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500", theme.surfaceHighlight, theme.border.default, theme.text.primary)}
                        placeholder="Search 50+ litigation strategies..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                    <select 
                        className={cn("px-3 py-2 rounded-lg border text-sm outline-none min-w-[140px]", theme.surface, theme.border.default, theme.text.primary)}
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select 
                        className={cn("px-3 py-2 rounded-lg border text-sm outline-none min-w-[140px]", theme.surface, theme.border.default, theme.text.primary)}
                        value={selectedDifficulty}
                        onChange={(e) => setSelectedDifficulty(e.target.value)}
                    >
                        <option value="All">All Difficulties</option>
                        <option value="Low">Low Complexity</option>
                        <option value="Medium">Medium Complexity</option>
                        <option value="High">High Complexity</option>
                    </select>
                </div>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-bold">{filteredPlaybooks.length}</span> templates found
            </div>
        </div>

        {/* Content Grid */}
        <div className="flex-1 overflow-hidden p-4 bg-slate-50 dark:bg-black/20">
            <VirtualGrid 
                items={filteredPlaybooks}
                itemHeight={340} // Increased height for readiness bar
                itemWidth={320}
                height="100%"
                gap={16}
                renderItem={renderPlaybookCard}
                emptyMessage="No playbooks match your criteria."
            />
        </div>
    </div>
  );
};

const LayersIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/></svg>
);
