
import React from 'react';
import { FileSignature } from 'lucide-react';
import { EmptyState } from '../../common/EmptyState';
import { Button } from '../../common/Button';

export const FormsSigningView: React.FC = () => {
    return (
        <div className="h-full flex items-center justify-center p-8">
            <EmptyState 
                icon={FileSignature}
                title="Forms & eSignature"
                description="Manage fillable PDF forms, create signature fields, and track document execution status. This module is currently under development."
                action={<Button>Request a Demo</Button>}
            />
        </div>
    );
};
