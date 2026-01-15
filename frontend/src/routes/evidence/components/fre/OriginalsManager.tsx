/**
 * @module OriginalsManager
 * @category Evidence
 * @description Tracks original documents vs. duplicates under FRE 1002/1003.
 * Logs justifications for admissibility of duplicates.
 */

import { Copy, Plus } from 'lucide-react';
// Common Components
import { TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '@/components/organisms/Table/Table';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';

// Context & Utils
import { useTheme } from "@/hooks/useTheme";
import { cn } from '@/lib/cn';

// Services & Types
import { useQuery } from '@/hooks/useQueryHooks';
import { DataService } from '@/services/data/data-service.service';
// ✅ Migrated to backend API (2025-12-21)
import { EvidenceItem } from '@/types';
import React from "react";

export const OriginalsManager: React.FC = () => {
    const { theme } = useTheme();
    const { data: evidence = [] } = useQuery<EvidenceItem[]>(
        ['evidence', 'all'],
        () => DataService.evidence.getAll()
    );

    return (
        <div className="space-y-6">
            <div className={cn("p-4 rounded-lg border flex items-start gap-3", theme.surface.default, theme.border.default)}>
                <Copy className={cn("h-5 w-5 mt-0.5 shrink-0", theme.text.secondary)} />
                <div>
                    <h4 className="font-bold text-sm">FRE 1002: Requirement of the Original</h4>
                    <p className="text-xs mt-1">Track original documents vs. duplicates and log justifications for admissibility under FRE 1003 & 1004.</p>
                </div>
            </div>

            <TableContainer>
                <TableHeader>
                    <TableHead>Evidence</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Admissibility Justification</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                </TableHeader>
                <TableBody>
                    {evidence.map(item => (
                        <TableRow key={item.id}>
                            <TableCell className={cn("font-medium", theme.text.primary)}>{item.title}</TableCell>
                            <TableCell>
                                <Badge variant={item.isOriginal ? 'success' : 'warning'}>
                                    {item.isOriginal ? 'Original' : 'Duplicate'}
                                </Badge>
                            </TableCell>
                            <TableCell className={cn("text-xs italic", theme.text.secondary)}>
                                {!item.isOriginal && 'Original lost not in bad faith.'}
                            </TableCell>
                            <TableCell className="text-right">
                                {!item.isOriginal && <Button variant="ghost" size="sm" icon={Plus}>Log Justification</Button>}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </TableContainer>
        </div>
    );
};
