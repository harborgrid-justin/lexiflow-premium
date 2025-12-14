import React from 'react';
import { EmptyState } from '../common/EmptyState';
import { Send } from 'lucide-react';

export const PleadingFilingQueue: React.FC = () => {
    return (
        <div className="h-full flex items-center justify-center p-8">
            <EmptyState 
                icon={Send}
                title="Filing Queue is Empty"
                description="Finalized pleadings ready for e-filing with integrated court systems will appear here."
            />
        </div>
    );
};
