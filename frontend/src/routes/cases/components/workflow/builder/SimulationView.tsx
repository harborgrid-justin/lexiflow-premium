import { Terminal, PlayCircle } from 'lucide-react';
import { Button } from '@/components/atoms/Button';

export function SimulationView() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-slate-400">
        <Terminal className="h-16 w-16 mb-4 opacity-50"/>
        <h3 className="text-xl font-bold">Workflow Simulator</h3>
        <p className="max-w-md text-center mt-2">Run test instances of your workflow to verify logic paths and SLA triggers.</p>
        <Button variant="primary" className="mt-6" icon={PlayCircle}>Start Simulation</Button>
    </div>
  );
}

SimulationView.displayName = 'SimulationView';
