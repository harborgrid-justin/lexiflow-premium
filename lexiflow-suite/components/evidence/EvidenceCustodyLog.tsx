
import React, { useState, useDeferredValue, useMemo } from 'react';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../common/Table.tsx';
import { Search, Filter, Download } from 'lucide-react';
import { Button } from '../common/Button.tsx';
import { EvidenceItem } from '../../types.ts';
import { MOCK_EVIDENCE } from '../../data/mockEvidence.ts';

interface EvidenceCustodyLogProps {
    items?: EvidenceItem[];
}

export const EvidenceCustodyLog: React.FC<EvidenceCustodyLogProps> = ({ items }) => {
  const sourceItems = items || MOCK_EVIDENCE;
  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearchTerm = useDeferredValue(searchTerm);

  // Flatten all custody events dynamically from the passed items
  const allEvents = useMemo(() => sourceItems.flatMap(item => 
    (item.chainOfCustody || []).map(event => ({
      ...event,
      itemId: item.id,
      itemTitle: item.title,
      caseId: item.caseId
    }))
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [sourceItems]);

  const filteredEvents = useMemo(() => {
    const term = deferredSearchTerm.toLowerCase();
    return allEvents.filter(e => 
        e.itemTitle.toLowerCase().includes(term) || 
        e.actor.toLowerCase().includes(term) ||
        e.action.toLowerCase().includes(term) ||
        e.itemId.toLowerCase().includes(term)
    );
  }, [allEvents, deferredSearchTerm]);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <div>
           <h3 className="font-bold text-slate-900">Master Chain of Custody</h3>
           <p className="text-sm text-slate-500">Audit trail for all evidence transfers across the firm.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"/>
                <input 
                    className="w-full pl-9 pr-4 py-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Search logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Button variant="secondary" icon={Filter}>Filter</Button>
            <Button variant="outline" icon={Download}>Export</Button>
        </div>
      </div>

      <TableContainer>
        <TableHeader>
            <TableHead>Date / Time</TableHead>
            <TableHead>Evidence Item</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Actor</TableHead>
            <TableHead>Case Ref</TableHead>
            <TableHead>Notes</TableHead>
        </TableHeader>
        <TableBody>
            {filteredEvents.map((evt, idx) => (
                <TableRow key={`${evt.id}-${idx}`}>
                    <TableCell className="font-mono text-xs text-slate-500">{new Date(evt.date).toLocaleString()}</TableCell>
                    <TableCell>
                        <div className="flex flex-col">
                            <span className="font-medium text-slate-900">{evt.itemTitle}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{evt.itemId}</span>
                        </div>
                    </TableCell>
                    <TableCell>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                            evt.action.includes('Collected') ? 'bg-green-100 text-green-700' : 
                            evt.action.includes('Transfer') ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                            {evt.action}
                        </span>
                    </TableCell>
                    <TableCell>{evt.actor}</TableCell>
                    <TableCell className="text-xs text-blue-600 font-mono">{evt.caseId}</TableCell>
                    <TableCell className="text-xs text-slate-500 italic truncate max-w-xs" title={evt.notes}>{evt.notes || '-'}</TableCell>
                </TableRow>
            ))}
            {filteredEvents.length === 0 && (
                <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-slate-400">No events found.</TableCell>
                </TableRow>
            )}
        </TableBody>
      </TableContainer>
    </div>
  );
};
