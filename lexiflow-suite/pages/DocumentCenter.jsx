
import React from "react";
import { useDocs } from "../logic/useDocs.js";
import { FileText, Wand2, Trash2, Download, Search, MoreVertical } from "lucide-react";
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/common/Table.tsx";
import { Button } from "../components/common/Button.tsx";
import { Badge } from "../components/common/Badge.tsx";
import { GeminiService } from "../services/geminiService.ts";

const DocumentCenter = () => {
  const { docs, analyzeDoc, deleteDoc, loading, setSelectedId } = useDocs();

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Document Repository</h1>
          <p className="text-sm text-slate-500 font-medium">Enterprise DMS with neural semantic indexing.</p>
        </div>
        <div className="flex gap-2">
            <div className="relative">
                <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
                <input className="pl-10 pr-4 py-2 border rounded-xl text-sm bg-white" placeholder="Search index..." />
            </div>
            <Button variant="primary">Secure Upload</Button>
        </div>
      </div>

      <TableContainer>
        <TableHeader>
          <TableHead>Filename</TableHead>
          <TableHead>Class</TableHead>
          <TableHead>Uploaded</TableHead>
          <TableHead>Risk</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableHeader>
        <TableBody>
          {docs.map(doc => (
            <TableRow key={doc.id} onClick={() => setSelectedId(doc.id)} className="cursor-pointer">
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><FileText size={16}/></div>
                  <span className="font-bold text-slate-800 text-sm">{doc.title}</span>
                </div>
              </TableCell>
              <TableCell><Badge variant="neutral">{doc.type}</Badge></TableCell>
              <TableCell className="text-xs text-slate-500 font-mono">{doc.uploadDate}</TableCell>
              <TableCell>
                {doc.riskScore !== undefined ? (
                  <Badge variant={doc.riskScore > 50 ? 'error' : 'success'}>
                    Score: {doc.riskScore}
                  </Badge>
                ) : (
                  <span className="text-[10px] text-slate-400 italic">Not analyzed</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1" onClick={e => e.stopPropagation()}>
                  <button 
                    onClick={() => analyzeDoc(doc.id)}
                    disabled={loading}
                    className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-colors"
                  >
                    {loading ? <RefreshCw className="h-4 w-4 animate-spin"/> : <Wand2 size={16}/>}
                  </button>
                  <button className="p-2 hover:bg-slate-100 text-slate-400 rounded-lg"><Download size={16}/></button>
                  <button onClick={() => deleteDoc(doc.id)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg"><Trash2 size={16}/></button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableContainer>
    </div>
  );
};

const RefreshCw = (props) => (
  <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
);

export default DocumentCenter;
