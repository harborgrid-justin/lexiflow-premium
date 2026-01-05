
import React from "react";
import { useResearch } from "../logic/useResearch.js";
import { Search, Loader2, BookOpen, ExternalLink, Bot, Bookmark } from "lucide-react";
import { Card } from "../components/common/Card.tsx";
import { Badge } from "../components/common/Badge.tsx";

const ResearchHub = () => {
  const { query, setQuery, results, loading, performResearch, history } = useResearch();

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') performResearch(query);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-fade-in">
      <header className="text-center space-y-4">
        <div className="p-4 bg-slate-900 rounded-3xl w-fit mx-auto shadow-2xl shadow-blue-500/20 mb-6">
            <Bot size={48} className="text-blue-400" />
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter">AI Research Assistant</h1>
        <p className="text-slate-500 max-w-xl mx-auto font-medium">Grounded in real-time court records and statutory law via Google Search.</p>
      </header>

      <div className="relative group max-w-2xl mx-auto">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
        <input 
          className="w-full pl-14 pr-32 py-5 bg-white border-2 border-slate-200 rounded-3xl shadow-xl outline-none focus:border-blue-500 transition-all text-lg font-medium"
          placeholder="Ask a complex legal question..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <button 
          onClick={() => performResearch(query)}
          disabled={loading || !query.trim()}
          className="absolute right-3 top-2.5 bottom-2.5 bg-slate-900 text-white px-8 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 disabled:opacity-50 transition-all shadow-lg"
        >
          {loading ? <Loader2 className="animate-spin h-5 w-5"/> : 'ANALYZE'}
        </button>
      </div>

      {results && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
           <Card className="border-blue-200 shadow-2xl">
              <div className="p-6">
                 <div className="flex items-center gap-2 mb-4">
                    <Badge variant="purple">LEXIFLOW CORE-PRO</Badge>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Grounding Active</span>
                 </div>
                 <div className="prose prose-slate max-w-none font-serif text-lg leading-relaxed text-slate-800 whitespace-pre-line">
                    {results.response}
                 </div>
              </div>
           </Card>

           {results.sources.length > 0 && (
             <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                   <BookOpen size={14}/> Verified Authorities
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {results.sources.map((s, idx) => (
                      <div key={idx} className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-blue-400 transition-all group cursor-pointer" onClick={() => window.open(s.url, '_blank')}>
                         <div className="flex justify-between items-start mb-2">
                            <h5 className="font-bold text-sm text-slate-900 truncate group-hover:text-blue-600 transition-colors">{s.title}</h5>
                            <ExternalLink size={12} className="text-slate-300 group-hover:text-blue-500"/>
                         </div>
                         <p className="text-[10px] font-mono text-slate-400 truncate">{s.url}</p>
                      </div>
                   ))}
                </div>
             </div>
           )}
        </div>
      )}

      {history.length > 0 && !results && (
          <div className="space-y-4 pt-12 border-t border-slate-100">
             <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Research History</h4>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {history.slice(0, 6).map(h => (
                    <div key={h.id} className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md cursor-pointer transition-all">
                        <p className="font-bold text-sm text-slate-800 truncate">{h.query}</p>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">{h.timestamp}</p>
                    </div>
                ))}
             </div>
          </div>
      )}
    </div>
  );
};

export default ResearchHub;
