
import React from 'react';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../common/Table';
import { Badge } from '../../common/Badge';
import { Button } from '../../common/Button';
import { SearchInputBar, ActionRow, MetricTile } from '../../common/RefactoredCommon';
import { Building, User, AlertTriangle, ShieldCheck, Network } from 'lucide-react';
import { LegalEntity } from '../../../types';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';

interface UboRegisterProps {
  entities: LegalEntity[];
  onSelect: (e: LegalEntity) => void;
}

export const UboRegister: React.FC<UboRegisterProps> = ({ entities, onSelect }) => {
  const { theme } = useTheme();
  
  // Filter for Corporations
  const corporations = entities.filter(e => e.type === 'Corporation');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricTile 
              label="Entities Tracked" 
              value={corporations.length} 
              icon={Building} 
              className="border-l-4 border-l-blue-600"
          />
          <MetricTile 
              label="UBOs Identified" 
              value={124} 
              icon={User} 
              className="border-l-4 border-l-purple-600"
          />
          <MetricTile 
              label="Verification Pending" 
              value="8" 
              icon={AlertTriangle} 
              trend="High Priority"
              trendUp={false}
              className="border-l-4 border-l-amber-500"
          />
      </div>

      <ActionRow title="Beneficial Ownership Register" subtitle="Track equity holders >25% and controlling persons per CTA requirements.">
         <Button variant="outline">Export FinCEN Report</Button>
         <Button variant="primary">Add UBO Entry</Button>
      </ActionRow>

      <TableContainer>
          <TableHeader>
              <TableHead>Legal Entity</TableHead>
              <TableHead>Beneficial Owner</TableHead>
              <TableHead>Control Type</TableHead>
              <TableHead>Ownership %</TableHead>
              <TableHead>Verification</TableHead>
              <TableHead className="text-right">Actions</TableHead>
          </TableHeader>
          <TableBody>
              {corporations.map(corp => (
                  <TableRow key={corp.id} onClick={() => onSelect(corp)} className="cursor-pointer">
                      <TableCell className={cn("font-bold", theme.text.primary)}>
                          <div className="flex items-center gap-2">
                              <Building className="h-4 w-4 text-blue-500"/> {corp.name}
                          </div>
                      </TableCell>
                      <TableCell>
                           {/* Mock UBO Data based on corp ID to simulate relations */}
                           <div className="flex items-center gap-2">
                               <User className={cn("h-4 w-4", theme.text.tertiary)}/> 
                               {corp.id.length % 2 === 0 ? "John Doe (Trustee)" : "Jane Smith (CEO)"}
                           </div>
                      </TableCell>
                      <TableCell>
                          <span className={cn("text-xs font-mono px-2 py-1 rounded border", theme.surfaceHighlight, theme.border.default)}>
                             {corp.id.length % 2 === 0 ? "Equity Interest" : "Senior Officer"}
                          </span>
                      </TableCell>
                      <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <div className="bg-green-500 h-full" style={{ width: `${corp.id.length % 2 === 0 ? 35 : 0}%` }}></div>
                            </div>
                            <span className="text-xs font-bold">{corp.id.length % 2 === 0 ? "35%" : "0% (Control)"}</span>
                          </div>
                      </TableCell>
                      <TableCell>
                          {corp.riskScore < 20 ? (
                              <Badge variant="success" className="flex items-center w-fit gap-1"><ShieldCheck className="h-3 w-3"/> Verified</Badge>
                          ) : (
                              <Badge variant="warning" className="flex items-center w-fit gap-1"><AlertTriangle className="h-3 w-3"/> Pending Docs</Badge>
                          )}
                      </TableCell>
                      <TableCell className="text-right">
                          <Button size="sm" variant="ghost" icon={Network}>Graph</Button>
                      </TableCell>
                  </TableRow>
              ))}
          </TableBody>
      </TableContainer>
    </div>
  );
};
