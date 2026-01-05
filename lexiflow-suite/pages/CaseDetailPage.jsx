
import React from "react";
import { useCaseDetail } from "../logic/useCaseDetail.js";
import { 
  ArrowLeft, LayoutDashboard, GitBranch, FolderOpen, 
  Gavel, Search, Shield, Users, MessageSquare, BookOpen, 
  Archive, PanelRightClose, PanelRightOpen, Plus
} from "lucide-react";
import { Badge } from "../components/common/Badge.tsx";
import { Button } from "../components/common/Button.tsx";

const CaseDetailPage = ({ onBack }) => {
  const { caseData, activeTab, setActiveTab, rightPanelOpen, setRightPanelOpen } = useCaseDetail();

  const tabs = [
    { id: 'Overview', icon: LayoutDashboard },
    { id: 'Workflow', icon: GitBranch },
    { id: 'Documents', icon: FolderOpen },
    { id: 'Motions', icon: Gavel },
    { id: 'Strategy', icon: BookOpen },
  ];

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">{caseData.title}</h1>
            <p className="text-xs text-slate-500 font-mono">{caseData.id}</p>
          </div>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" size="sm" onClick={() => setRightPanelOpen(!rightPanelOpen)}>
             {rightPanelOpen ? <PanelRightClose size={16}/> : <PanelRightOpen size={16}/>}
           </Button>
           <Button variant="primary" size="sm" icon={Plus}>Action</Button>
        </div>
      </header>

      <nav className="bg-white border-b border-slate-200 flex px-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === tab.id ? 'border-blue-600 text-blue-600 bg-blue-50/30' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            <tab.icon size={14} className="inline mr-2" />
            {tab.id}
          </button>
        ))}
      </nav>

      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 p-8 overflow-y-auto">
           <div className="max-w-4xl mx-auto bg-white p-12 rounded-3xl border border-slate-200 shadow-sm min-h-[500px]">
              <h2 className="text-2xl font-black mb-4">{activeTab}</h2>
              <p className="text-slate-500">Displaying logic for {activeTab} workspace...</p>
           </div>
        </main>
        
        {rightPanelOpen && (
          <aside className="w-80 bg-white border-l border-slate-200 p-6 animate-in slide-in-from-right duration-300">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Matter Intelligence</h3>
            <div className="space-y-6">
                <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-xl">
                    <p className="text-[10px] text-blue-400 font-bold uppercase mb-2">Win Probability</p>
                    <p className="text-4xl font-black tabular-nums">72%</p>
                </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default CaseDetailPage;
