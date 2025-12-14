import React from 'react';
import { EmptyState } from '../common/EmptyState';
import { BarChart2 } from 'lucide-react';

export const PleadingAnalytics: React.FC = () => {
    return (
        <div className="h-full flex items-center justify-center p-8">
            <EmptyState 
                icon={BarChart2}
                title="Analytics Coming Soon"
                description="Insights on motion success rates, drafting time, and clause usage will be available here."
            />
        </div>
    );
};
