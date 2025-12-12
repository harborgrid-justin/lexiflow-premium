import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { complianceService } from '@/services/complianceService';
import { Search, AlertTriangle, CheckCircle, XCircle, FileText } from 'lucide-react';

interface ConflictCheck {
  id: string;
  targetName: string;
  checkType: string;
  status: string;
  conflicts: ConflictResult[];
  createdAt: Date;
  requestedByName: string;
}

interface ConflictResult {
  conflictType: string;
  matchedEntity: string;
  matchScore: number;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export const ConflictChecker: React.FC = () => {
  const [checks, setChecks] = useState<ConflictCheck[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkMode, setCheckMode] = useState<'single' | 'batch' | 'party'>('single');
  const [formData, setFormData] = useState({
    targetName: '',
    checkType: 'CLIENT_VS_CLIENT',
    additionalNames: '',
    parties: [] as Array<{ name: string; role: string }>,
  });
  const [selectedCheck, setSelectedCheck] = useState<ConflictCheck | null>(null);
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [showWaiveDialog, setShowWaiveDialog] = useState(false);
  const [resolutionData, setResolutionData] = useState({
    resolutionMethod: '',
    notes: '',
    reason: '',
  });
  const [statistics, setStatistics] = useState<any>(null);

  useEffect(() => {
    loadConflictChecks();
    loadStatistics();
  }, []);

  const loadConflictChecks = async () => {
    setLoading(true);
    try {
      const response = await complianceService.getConflictChecks({});
      setChecks(response.data);
    } catch (error) {
      console.error('Failed to load conflict checks:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await complianceService.getConflictStatistics('default');
      setStatistics(stats);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  };

  const handleRunCheck = async () => {
    setLoading(true);
    try {
      let result;

      if (checkMode === 'single') {
        result = await complianceService.runConflictCheck({
          targetName: formData.targetName,
          checkType: formData.checkType,
          requestedBy: 'current-user',
          requestedByName: 'Current User',
          organizationId: 'default',
        });
      } else if (checkMode === 'batch') {
        const targets = formData.additionalNames.split('\n').filter(n => n.trim());
        result = await complianceService.runBatchConflictCheck({
          requestedBy: 'current-user',
          requestedByName: 'Current User',
          checkType: formData.checkType,
          targets: targets.map(name => ({ name: name.trim() })),
          organizationId: 'default',
        });
      } else {
        result = await complianceService.checkPartyConflicts({
          parties: formData.parties,
          requestedBy: 'current-user',
          requestedByName: 'Current User',
          organizationId: 'default',
        });
      }

      loadConflictChecks();
      loadStatistics();

      // Reset form
      setFormData({
        targetName: '',
        checkType: 'CLIENT_VS_CLIENT',
        additionalNames: '',
        parties: [],
      });
    } catch (error) {
      console.error('Failed to run conflict check:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!selectedCheck) return;

    try {
      await complianceService.resolveConflict(selectedCheck.id, {
        resolvedBy: 'current-user',
        resolvedByName: 'Current User',
        resolutionMethod: resolutionData.resolutionMethod,
        notes: resolutionData.notes,
      });

      loadConflictChecks();
      setShowResolveDialog(false);
      setSelectedCheck(null);
      setResolutionData({ resolutionMethod: '', notes: '', reason: '' });
    } catch (error) {
      console.error('Failed to resolve conflict:', error);
    }
  };

  const handleWaive = async () => {
    if (!selectedCheck) return;

    try {
      await complianceService.waiveConflict(selectedCheck.id, {
        waivedBy: 'current-user',
        waivedByName: 'Current User',
        reason: resolutionData.reason,
      });

      loadConflictChecks();
      setShowWaiveDialog(false);
      setSelectedCheck(null);
      setResolutionData({ resolutionMethod: '', notes: '', reason: '' });
    } catch (error) {
      console.error('Failed to waive conflict:', error);
    }
  };

  const addParty = () => {
    setFormData(prev => ({
      ...prev,
      parties: [...prev.parties, { name: '', role: 'plaintiff' }],
    }));
  };

  const updateParty = (index: number, field: 'name' | 'role', value: string) => {
    setFormData(prev => ({
      ...prev,
      parties: prev.parties.map((p, i) =>
        i === index ? { ...p, [field]: value } : p
      ),
    }));
  };

  const removeParty = (index: number) => {
    setFormData(prev => ({
      ...prev,
      parties: prev.parties.filter((_, i) => i !== index),
    }));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CLEAR':
        return <Badge className="bg-green-500"><CheckCircle className="mr-1 h-3 w-3" /> Clear</Badge>;
      case 'CONFLICT_FOUND':
        return <Badge className="bg-red-500"><AlertTriangle className="mr-1 h-3 w-3" /> Conflict</Badge>;
      case 'RESOLVED':
        return <Badge className="bg-blue-500"><CheckCircle className="mr-1 h-3 w-3" /> Resolved</Badge>;
      case 'WAIVED':
        return <Badge className="bg-yellow-500">Waived</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const colors = {
      low: 'bg-gray-500',
      medium: 'bg-yellow-500',
      high: 'bg-orange-500',
      critical: 'bg-red-500',
    };
    return <Badge className={colors[severity as keyof typeof colors]}>{severity.toUpperCase()}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Checks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalChecks}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Conflicts Found</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{statistics.conflictsFound}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{statistics.resolved}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Waived</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{statistics.waived}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Resolution Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.averageResolutionTime}h</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Run Conflict Check */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Run Conflict Check
          </CardTitle>
          <CardDescription>
            Check for potential conflicts of interest
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Check Mode</Label>
            <Select value={checkMode} onValueChange={(value: any) => setCheckMode(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single Name Check</SelectItem>
                <SelectItem value="batch">Batch Check (Multiple Names)</SelectItem>
                <SelectItem value="party">Party Conflict Check</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {checkMode === 'single' && (
            <>
              <div className="space-y-2">
                <Label>Name to Check</Label>
                <Input
                  placeholder="Enter client or party name"
                  value={formData.targetName}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetName: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Check Type</Label>
                <Select value={formData.checkType} onValueChange={(value) => setFormData(prev => ({ ...prev, checkType: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CLIENT_VS_CLIENT">Client vs Client</SelectItem>
                    <SelectItem value="CLIENT_VS_OPPOSING">Client vs Opposing Party</SelectItem>
                    <SelectItem value="MATTER_OVERLAP">Matter Overlap</SelectItem>
                    <SelectItem value="PRIOR_REPRESENTATION">Prior Representation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {checkMode === 'batch' && (
            <>
              <div className="space-y-2">
                <Label>Names to Check (one per line)</Label>
                <Textarea
                  placeholder="Enter names, one per line..."
                  value={formData.additionalNames}
                  onChange={(e) => setFormData(prev => ({ ...prev, additionalNames: e.target.value }))}
                  rows={5}
                />
              </div>

              <div className="space-y-2">
                <Label>Check Type</Label>
                <Select value={formData.checkType} onValueChange={(value) => setFormData(prev => ({ ...prev, checkType: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CLIENT_VS_CLIENT">Client vs Client</SelectItem>
                    <SelectItem value="CLIENT_VS_OPPOSING">Client vs Opposing Party</SelectItem>
                    <SelectItem value="PRIOR_REPRESENTATION">Prior Representation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {checkMode === 'party' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Case Parties</Label>
                <Button variant="outline" size="sm" onClick={addParty}>
                  Add Party
                </Button>
              </div>

              <div className="space-y-2">
                {formData.parties.map((party, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Party name"
                      value={party.name}
                      onChange={(e) => updateParty(index, 'name', e.target.value)}
                      className="flex-1"
                    />
                    <Select value={party.role} onValueChange={(value) => updateParty(index, 'role', value)}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="plaintiff">Plaintiff</SelectItem>
                        <SelectItem value="defendant">Defendant</SelectItem>
                        <SelectItem value="witness">Witness</SelectItem>
                        <SelectItem value="attorney">Attorney</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon" onClick={() => removeParty(index)}>
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button onClick={handleRunCheck} disabled={loading} className="w-full">
            <Search className="mr-2 h-4 w-4" />
            Run Conflict Check
          </Button>
        </CardContent>
      </Card>

      {/* Conflict Checks Results */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Conflict Checks</CardTitle>
          <CardDescription>
            {checks.length} conflict checks performed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Conflicts</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {checks.map((check) => (
                  <TableRow key={check.id}>
                    <TableCell className="font-mono text-sm">
                      {new Date(check.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{check.targetName}</TableCell>
                    <TableCell>{check.checkType}</TableCell>
                    <TableCell>{getStatusBadge(check.status)}</TableCell>
                    <TableCell>
                      {check.conflicts.length > 0 ? (
                        <div className="space-y-1">
                          {check.conflicts.map((conflict, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              {getSeverityBadge(conflict.severity)}
                              <span className="text-sm">{conflict.matchedEntity}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500">None</span>
                      )}
                    </TableCell>
                    <TableCell>{check.requestedByName}</TableCell>
                    <TableCell>
                      {check.status === 'CONFLICT_FOUND' && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedCheck(check);
                              setShowResolveDialog(true);
                            }}
                          >
                            Resolve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedCheck(check);
                              setShowWaiveDialog(true);
                            }}
                          >
                            Waive
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Resolve Dialog */}
      <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Conflict</DialogTitle>
            <DialogDescription>
              Resolve the conflict for {selectedCheck?.targetName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Resolution Method</Label>
              <Input
                placeholder="e.g., Client consent obtained"
                value={resolutionData.resolutionMethod}
                onChange={(e) => setResolutionData(prev => ({ ...prev, resolutionMethod: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                placeholder="Additional notes..."
                value={resolutionData.notes}
                onChange={(e) => setResolutionData(prev => ({ ...prev, notes: e.target.value }))}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResolveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleResolve}>
              Resolve Conflict
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Waive Dialog */}
      <Dialog open={showWaiveDialog} onOpenChange={setShowWaiveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Waive Conflict</DialogTitle>
            <DialogDescription>
              Waive the conflict for {selectedCheck?.targetName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Reason for Waiver</Label>
              <Textarea
                placeholder="Explain why this conflict can be waived..."
                value={resolutionData.reason}
                onChange={(e) => setResolutionData(prev => ({ ...prev, reason: e.target.value }))}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWaiveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleWaive}>
              Waive Conflict
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
