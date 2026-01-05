
import React from "react";
import { useBilling } from "../logic/useBilling.js";
import { DollarSign, Clock, FileText, Plus, Download } from "lucide-react";
import { Card } from "../components/common/Card.tsx";
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../components/common/Table.tsx";
import { Badge } from "../components/common/Badge.tsx";

const BillingLedger = () => {
  const { entries, stats, addEntry } = useBilling();

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Financial Ledger</h1>
          <p className="text-sm text-slate-500 font-medium">Global billable hours and realization metrics.</p>
        </div>
        <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border rounded-xl hover:bg-slate-50 transition-all font-bold text-xs uppercase tracking-widest text-slate-600">
                <Download size={14}/> Export LEDES
            </button>
            <button 
              onClick={() => addEntry({ caseId: 'GENERAL', date: '2024-03-22', duration: 60, description: 'Client Review', rate: 450, total: 450, status: 'Unbilled' })}
              className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg hover:bg-blue-700 transition-all"
            >
              Log Time
            </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-slate-900 text-white rounded-2xl shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><DollarSign size={80}/></div>
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-2">Total WIP</p>
            <p className="text-4xl font-mono font-bold">${stats.unbilled.toLocaleString()}</p>
        </div>
        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Realized Revenue</p>
            <p className="text-4xl font-mono font-bold text-slate-900">${(stats.total - stats.unbilled).toLocaleString()}</p>
        </div>
        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Hours Logged</p>
            <p className="text-4xl font-mono font-bold text-slate-900">{stats.count * 1.5}h</p>
        </div>
      </div>

      <TableContainer>
        <TableHeader>
          <TableHead>Date</TableHead>
          <TableHead>Matter</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead>Status</TableHead>
        </TableHeader>
        <TableBody>
          {entries.map(e => (
            <TableRow key={e.id}>
              <TableCell className="text-xs font-mono text-slate-400">{e.date}</TableCell>
              <TableCell className="font-bold text-blue-600 text-xs">{e.caseId}</TableCell>
              <TableCell className="text-sm text-slate-700">{e.description}</TableCell>
              <TableCell className="text-right font-mono font-bold">${e.total.toFixed(2)}</TableCell>
              <TableCell>
                <Badge variant={e.status === 'Billed' ? 'success' : 'warning'}>{e.status}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableContainer>
    </div>
  );
};

export default BillingLedger;
