import { Button } from '@/components/ui/atoms/Button/Button';
import { EmptyState } from '@/components/ui/molecules/EmptyState/EmptyState';
import { Cpu } from 'lucide-react';

export function BatchProcessingView() {
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
}
