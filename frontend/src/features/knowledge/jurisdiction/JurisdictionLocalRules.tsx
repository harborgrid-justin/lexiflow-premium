import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Book } from 'lucide-react';
import { TableContainer, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/organisms/Table/Table';
import { Button } from '@/components/ui/atoms/Button/Button';
import { Modal } from '@/components/ui/molecules/Modal/Modal';
import { Input } from '@/components/ui/atoms/Input/Input';
import { TextArea } from '@/components/ui/atoms/TextArea/TextArea';
import { SearchToolbar } from '@/components/organisms/SearchToolbar';
import { DataService } from '@/services/data/dataService';
import { ConfirmDialog } from '@/components/ui/molecules/ConfirmDialog/ConfirmDialog';
import { LegalRule } from '@/types';
import { Badge } from '@/components/ui/atoms/Badge/Badge';
import { useTheme } from '@/providers/ThemeContext';
import { cn } from '@/utils/cn';
import { useModalState } from '@/hooks/core';
import { useQuery, useMutation } from '@/hooks/useQueryHooks';
import { filterRules } from './utils';

export const JurisdictionLocalRules: React.FC = () => {
  const { theme } = useTheme();
  const [filter, setFilter] = useState('');
  const ruleModal = useModalState();
  const deleteModal = useModalState();
  const [editingRule, setEditingRule] = useState<Partial<LegalRule>>({});
  const [deleteRuleId, setDeleteRuleId] = useState<string | null>(null);

  const rulesService = DataService.rules as {
    getAll: () => Promise<LegalRule[]>;
    add: (rule: Omit<LegalRule, 'id'> & { id: string }) => Promise<LegalRule>;
    update: (id: string, rule: Partial<LegalRule>) => Promise<LegalRule>;
    delete: (id: string) => Promise<void>;
  };

  const { data: rules = [] } = useQuery<LegalRule[]>(
      ['rules', 'all'],
      rulesService.getAll
  );

  const { mutate: saveRule } = useMutation(
    async (rule: Partial<LegalRule>) => {
        if (rule.id) {
            return rulesService.update(rule.id, rule);
        } else {
            return rulesService.add({
                id: '',
                code: rule.code!,
                name: rule.name!,
                type: (rule.type as unknown as LegalRule['type']) || 'Local',
                summary: rule.summary || ''
            });
        }
    },
    {
        invalidateKeys: [['rules', 'all']],
        onSuccess: () => {
            ruleModal.close();
            setEditingRule({});
        }
    }
  );

  const { mutate: deleteRule } = useMutation(
      rulesService.delete,
      { invalidateKeys: [['rules', 'all']] }
  );

  const handleSave = () => {
    if (!editingRule.code || !editingRule.name) return;
    saveRule(editingRule);
  };

  const handleDelete = (id: string) => {
    setDeleteRuleId(id);
    deleteModal.open();
  };

  const confirmDelete = () => {
    if (deleteRuleId) {
      deleteRule(deleteRuleId);
      setDeleteRuleId(null);
    }
  };

  const openNew = () => {
    setEditingRule({ type: 'Local' });
    ruleModal.open();
  };

  const openEdit = (rule: LegalRule) => {
    setEditingRule(rule);
    ruleModal.open();
  };

  const filteredRules = filterRules(rules, filter);

  return (
    <div className="space-y-6">
      <SearchToolbar
        value={filter}
        onChange={setFilter}
        placeholder="Search rules (Code, Name, Type)..."
        actions={
            <Button variant="primary" icon={Plus} onClick={openNew}>Add Rule</Button>
        }
      />

      <TableContainer>
        <TableHeader>
          <TableHead>Rule Code</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Title / Description</TableHead>
          <TableHead>Summary</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableHeader>
        <TableBody>
          {filteredRules.map((r: LegalRule) => (
            <TableRow key={r.id}>
              <TableCell className={cn("font-bold whitespace-nowrap", theme.text.primary)}>{r.code}</TableCell>
              <TableCell>
                  <Badge variant={r.type === 'FRCP' ? 'neutral' : r.type === 'Local' ? 'info' : 'warning'}>{r.type}</Badge>
              </TableCell>
              <TableCell className={theme.primary.text}>
                <div className="flex items-center">
                    <Book className={cn("h-4 w-4 mr-2", theme.text.tertiary)}/>
                    {r.name}
                </div>
              </TableCell>
              <TableCell className={cn("text-xs max-w-sm truncate", theme.text.secondary)} title={r.summary}>{r.summary}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                    <button title="Edit rule" onClick={() => openEdit(r)} className={cn("p-1.5 rounded transition-colors", theme.text.secondary, `hover:${theme.primary.text}`, `hover:${theme.surface.highlight}`)}><Edit2 className="h-4 w-4"/></button>
                    <button title="Delete rule" onClick={() => handleDelete(r.id)} className={cn("p-1.5 rounded transition-colors", theme.text.secondary, `hover:${theme.status.error.text}`, `hover:${theme.status.error.bg}`)}><Trash2 className="h-4 w-4"/></button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {filteredRules.length === 0 && (
              <TableRow>
                  <TableCell colSpan={5} className={cn("text-center py-8", theme.text.tertiary)}>No rules match your search.</TableCell>
              </TableRow>
          )}
        </TableBody>
      </TableContainer>

      <Modal isOpen={ruleModal.isOpen} onClose={ruleModal.close} title={editingRule.id ? "Edit Rule" : "Add New Rule"}>
          <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Rule Code"
                    placeholder="e.g. L.R. 7-3"
                    value={editingRule.code || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingRule({...editingRule, code: e.target.value})}
                  />
                  <div>
                      <label className={cn("block text-xs font-semibold uppercase mb-1.5", theme.text.secondary)}>Jurisdiction Type</label>
                      <select
                        title="Select jurisdiction type"
                        className={cn("w-full px-3 py-2 border rounded-md text-sm", theme.surface.default, theme.border.default, theme.text.primary)}
                        value={editingRule.type || 'Local'}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setEditingRule({...editingRule, type: e.target.value as LegalRule['type']})}
                      >
                          <option value="FRCP">Federal (FRCP)</option>
                          <option value="FRAP">Appellate (FRAP)</option>
                          <option value="FRE">Evidence (FRE)</option>
                          <option value="Local">Local Court Rule</option>
                          <option value="State">State Code</option>
                      </select>
                  </div>
              </div>
              <Input
                label="Rule Name / Title"
                placeholder="e.g. Conference of the Parties"
                value={editingRule.name || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditingRule({...editingRule, name: e.target.value})}
              />
              <TextArea
                label="Summary / Requirements"
                rows={4}
                placeholder="Brief summary of the rule's requirement..."
                value={editingRule.summary || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditingRule({...editingRule, summary: e.target.value})}
              />
              <div className={cn("flex justify-end gap-2 pt-4 border-t mt-4", theme.border.default)}>
                  <Button variant="secondary" onClick={ruleModal.close}>Cancel</Button>
                  <Button variant="primary" onClick={handleSave}>Save Rule</Button>
              </div>
          </div>
      </Modal>

      <ConfirmDialog
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={confirmDelete}
        title="Delete Rule"
        message="Are you sure you want to delete this rule definition? This action cannot be undone."
        confirmText="Delete Rule"
        variant="danger"
      />
    </div>
  );
};

