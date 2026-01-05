
import React from 'react';
import { DiffViewer } from '../common/DiffViewer.tsx';
import { Card } from '../common/Card.tsx';

export const ContractComparison: React.FC = () => {
    const v1 = `12. INDEMNIFICATION.
    
12.1 General. Seller shall indemnify, defend and hold harmless Buyer and its affiliates from and against any and all losses, damages, liabilities, costs and expenses (including reasonable attorneys' fees) arising out of or resulting from any third-party claim alleging: (a) breach of any representation or warranty made by Seller hereunder; or (b) negligence or willful misconduct of Seller.`;

    const v2 = `12. INDEMNIFICATION.
    
12.1 General. Seller shall indemnify, defend and hold harmless Buyer, its affiliates, and their respective officers and directors from and against any and all losses, damages, liabilities, costs and expenses (including reasonable attorneys' fees) arising out of or resulting from any claim alleging: (a) breach of any representation, warranty or covenant made by Seller hereunder; (b) negligence, gross negligence or willful misconduct of Seller; or (c) any violation of applicable law.`;

    return (
        <div className="h-[600px] flex flex-col">
            <div className="mb-4 flex justify-between items-center">
                <h2 className="text-lg font-bold">Contract Version Compare</h2>
                <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-100 border border-red-300"></div> Deleted</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-100 border border-green-300"></div> Added</div>
                </div>
            </div>
            <div className="flex-1 min-h-0">
                <DiffViewer oldText={v1} newText={v2} oldLabel="Version 1.0 (Draft)" newLabel="Version 1.1 (Redline)" />
            </div>
        </div>
    );
};
