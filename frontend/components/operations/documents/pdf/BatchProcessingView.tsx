
import React from 'react';
import { Cpu } from 'lucide-react';
import { EmptyState } from '../../../common/EmptyState';
import { Button } from '../../../common/Button';

export const BatchProcessingView: React.FC = () => {
    return (
        <div className="h-full flex items-center justify-center p-8">
            <EmptyState 
                icon={Cpu}
                title="Batch Processing Engine"
                description="Perform enterprise-grade operations like bulk OCR, Bates stamping, format conversion, and automated redaction across thousands of documents."
                action={<Button>Configure Batch Job</Button>}
            />
        </div>
    );
};
