
import React, { useState } from 'react';
import { Download, Eye, MoreVertical, Clock, CheckSquare, ShieldCheck, Tag, Book } from 'lucide-react';
import { LegalDocument } from '../../types.ts';
import { Badge } from '../common/Badge.tsx';
import { Modal } from '../common/Modal.tsx';
import { RuleSelector } from '../common/RuleSelector.tsx';
import { Button } from '../common/Button.tsx';
import { FileIcon, TagList } from '../common/Primitives.tsx';
import { TableSkeleton } from '../common/Table.tsx';

interface DocumentTableProps {
  documents: LegalDocument[];
  selectedDocs: string[];
  toggleSelection: (id: string) => void;
  selectAll: () => void;
  isAllSelected: boolean;
  isSelected: (id: string) => boolean;
  setSelectedDocForHistory: (doc: LegalDocument) => void;
  setTaggingDoc: (doc: LegalDocument) => void;
  onRowClick?: (doc: LegalDocument) => void;
  isLoading?: boolean;
}

export const DocumentTable: React.FC<DocumentTableProps> = ({ 
  documents, selectedDocs, toggleSelection, selectAll, isAllSelected, isSelected, setSelectedDocForHistory, setTaggingDoc, onRowClick, isLoading = false 
}) => {
  const [ruleModalDoc, setRuleModalDoc] = useState<LegalDocument | null>(null);

  const handleUpdateRules = (newRules: string[]) => {
    if (!ruleModalDoc) return;
    ruleModalDoc.linkedRules = newRules;
    setRuleModalDoc(null);
  };

  return (
    <div className="flex-1 overflow-auto bg-white">
        {ruleModalDoc && (
          <Modal isOpen={true} onClose={() => setRuleModalDoc(null)} title="Link Legal Rules" size="sm">
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-500">Associate Federal or Local rules with <strong>{ruleModalDoc.title}</strong>.</p>
              <RuleSelector 
                selectedRules={ruleModalDoc.linkedRules || []} 
                onRulesChange={handleUpdateRules}
              />
              <div className="flex justify-end pt-4">
                <Button onClick={() => setRuleModalDoc(null)}>Done</Button>
              </div>
            </div>
          </Modal>
        )}

        {/* DOC-05: High-Density Enterprise Table Implementation */}
        <div className="hidden md:block">
            <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50 sticky top-0 z-10">
                <tr>
                <th className="w-12 px-4 py-3">
                  <input 
                    type="checkbox" 
                    onChange={selectAll} 
                    checked={isAllSelected} 
                    className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4 border-slate-300"
                  />
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.1em]">Document Identifier</th>
                <th className="px-4 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.1em]">Origin</th>
                <th className="px-4 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.1em]">Workflow Status</th>
                <th className="px-4 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.1em]">Regulatory Links</th>
                <th className="px-4 py-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.1em]">Encryption</th>
                <th className="px-4 py-3 text-right text-[10px] font-black text-slate-500 uppercase tracking-[0.1em]">Operations</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
                {isLoading ? (
                    <TableSkeleton rows={10} cols={7} rowClassName="h-16" cellClassName="px-4 py-3" />
                ) : documents.map((doc) => {
                  const checked = isSelected(doc.id);
                  return (
                    /* DOC-06: Selected Row Highlighting Pattern */
                    <tr 
                        key={doc.id} 
                        className={`hover:bg-blue-50/20 cursor-pointer group transition-colors ${checked ? 'bg-blue-50/50' : ''}`} 
                        onClick={() => onRowClick ? onRowClick(doc) : toggleSelection(doc.id)}
                    >
                        <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <input 
                            type="checkbox" 
                            checked={checked} 
                            onChange={() => toggleSelection(doc.id)} 
                            className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4 border-slate-300"
                          />
                        </td>
                        <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-50 rounded-lg border border-slate-200 shadow-inner group-hover:bg-white group-hover:shadow-sm transition-all shrink-0">
                              <FileIcon type={doc.type} className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                            <div className="text-xs font-black text-slate-900 group-hover:text-blue-700 transition-colors truncate leading-tight mb-0.5">{doc.title}</div>
                            <div className="flex gap-2 items-center">
                                <TagList tags={doc.tags} limit={1} />
                                <span className="text-[9px] text-slate-400 font-mono uppercase font-bold">{doc.fileSize} • {doc.uploadDate}</span>
                            </div>
                            </div>
                        </div>
                        </td>
                        <td className="px-4 py-3">
                            <Badge variant={doc.sourceModule === 'Evidence' ? 'warning' : doc.sourceModule === 'Discovery' ? 'info' : 'neutral'} className="text-[8px] px-1.5 py-0">
                                {doc.sourceModule?.toUpperCase()}
                            </Badge>
                        </td>
                        <td className="px-4 py-3">
                                {doc.status === 'Signed' ? (
                                    <span className="flex items-center text-[10px] text-green-700 font-black tracking-tight uppercase"><CheckSquare className="h-3 w-3 mr-1"/> Validated</span>
                                ) : doc.status === 'Draft' ? (
                                <span className="flex items-center text-[10px] text-amber-600 font-black tracking-tight uppercase"><Clock className="h-3 w-3 mr-1"/> Pending</span>
                                ) : (
                                <span className="flex items-center text-[10px] text-blue-600 font-black tracking-tight uppercase">Master</span>
                                )}
                        </td>
                        <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1 items-center">
                                {doc.linkedRules?.slice(0, 1).map(r => (
                                    <span key={r} className="text-[9px] bg-slate-900 text-white px-1.5 py-0.5 rounded-sm font-bold shadow-sm">{r}</span>
                                ))}
                                {doc.linkedRules && doc.linkedRules.length > 1 && <span className="text-[9px] text-slate-400 font-bold">+{doc.linkedRules.length - 1}</span>}
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setRuleModalDoc(doc); }} 
                                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-all"
                                    title="Link Rules"
                                >
                                    <Book className="h-3.5 w-3.5"/>
                                </button>
                            </div>
                        </td>
                        <td className="px-4 py-3">
                            {doc.isEncrypted && <div className="flex items-center text-[10px] font-bold text-slate-500" title="AES-256 Encrypted"><ShieldCheck className="h-3 w-3 mr-1 text-green-500 fill-green-50"/> Encrypted</div>}
                        </td>
                        <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                            <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"><Download size={14}/></button>
                            <button onClick={() => setSelectedDocForHistory(doc)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="View History"><Eye size={14}/></button>
                            <button className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"><MoreVertical size={14}/></button>
                        </div>
                        </td>
                    </tr>
                  );
                })}
            </tbody>
            </table>
        </div>

        {/* Mobile View - High Density Card Stack */}
        <div className="md:hidden p-4 space-y-3 bg-slate-50">
            {isLoading ? (
                 Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm animate-pulse">
                         <div className="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
                         <div className="h-8 bg-slate-200 rounded w-3/4 mb-4"></div>
                         <div className="flex justify-between">
                            <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                            <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                         </div>
                    </div>
                 ))
            ) : (
                documents.map(doc => {
                    const checked = isSelected(doc.id);
                    return (
                    <div key={doc.id} className={`bg-white rounded-2xl border transition-all ${checked ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200'} p-4 shadow-sm active:scale-[0.98]`} onClick={() => onRowClick ? onRowClick(doc) : toggleSelection(doc.id)}>
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <input 
                                    type="checkbox" 
                                    className="rounded text-blue-600 w-4 h-4"
                                    checked={checked} 
                                    onChange={() => toggleSelection(doc.id)} 
                                    onClick={(e) => e.stopPropagation()}
                                />
                                <Badge variant={doc.sourceModule === 'Evidence' ? 'warning' : doc.sourceModule === 'Discovery' ? 'info' : 'neutral'} className="text-[8px] uppercase font-black">
                                    {doc.sourceModule}
                                </Badge>
                            </div>
                            {doc.isEncrypted && <ShieldCheck className="h-4 w-4 text-green-500" />}
                        </div>
                        
                        <div className="flex items-start gap-4 mb-4">
                            <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 shadow-inner shrink-0">
                            <FileIcon type={doc.type} className="h-7 w-7" />
                            </div>
                            <div className="min-w-0">
                                <h4 className="font-black text-sm text-slate-900 leading-tight mb-1 truncate">{doc.title}</h4>
                                <div className="flex gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                                    <span>{doc.fileSize}</span>
                                    <span className="opacity-30">•</span>
                                    <span>{doc.uploadDate}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                            <div className="flex items-center text-[10px] font-black uppercase tracking-widest">
                                {doc.status === 'Signed' ? (
                                    <span className="text-green-700">Validated</span>
                                ) : (
                                    <span className="text-slate-400">{doc.status}</span>
                                )}
                            </div>
                            <div className="flex gap-4" onClick={(e) => e.stopPropagation()}>
                                <button onClick={() => setSelectedDocForHistory(doc)} className="text-slate-400 active:text-blue-600"><Eye size={18}/></button>
                                <button className="text-slate-400 active:text-blue-600"><Download size={18}/></button>
                                <button className="text-slate-400 active:text-blue-600"><MoreVertical size={18}/></button>
                            </div>
                        </div>
                    </div>
                )})
            )}
        </div>
    </div>
  );
};
