
import React, { useState } from 'react';
import { MainAppProvider } from './logic/MainAppProvider.jsx';
import { Sidebar } from './components/Sidebar.tsx';
import MatterDashboard from './pages/MatterDashboard.jsx';
import DocumentCenter from './pages/DocumentCenter.jsx';
import BillingLedger from './pages/BillingLedger.jsx';
import WorkflowBoard from './pages/WorkflowBoard.jsx';
import ResearchHub from './pages/ResearchHub.jsx';

const App = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard': return <MatterDashboard />;
      case 'documents': return <DocumentCenter />;
      case 'billing': return <BillingLedger />;
      case 'workflows': return <WorkflowBoard />;
      case 'research': return <ResearchHub />;
      default: return <MatterDashboard />;
    }
  };

  return (
    <MainAppProvider>
      <div className="flex h-screen bg-[#F8FAFC]">
        <Sidebar 
          activeView={activeView} 
          setActiveView={setActiveView} 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
          currentUser={{ name: "Alexandra Hamilton", role: "Senior Partner" }}
          onSwitchUser={() => {}}
        />
        <main className="flex-1 overflow-y-auto min-h-0 relative">
          {renderContent()}
        </main>
      </div>
    </MainAppProvider>
  );
};

export default App;
