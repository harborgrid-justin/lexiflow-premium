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
import { Shield, Plus, Edit, Trash2, AlertCircle, Activity } from 'lucide-react';

interface EthicalWall {
  id: string;
  name: string;
  description: string;
  restrictedUsers: string[];
  restrictedEntities: Array<{
    entityType: string;
    entityId: string;
    entityName: string;
  }>;
  status: string;
  createdAt: Date;
  createdByName: string;
}

export const EthicalWallManager: React.FC = () => {
  const [walls, setWalls] = useState<EthicalWall[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedWall, setSelectedWall] = useState<EthicalWall | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    reason: '',
    restrictedUsers: '',
    restrictedEntities: [] as Array<{ entityType: string; entityId: string; entityName: string }>,
  });
  const [metrics, setMetrics] = useState<any[]>([]);
  const [breaches, setBreaches] = useState<any[]>([]);

  useEffect(() => {
    loadWalls();
    loadMetrics();
    loadBreaches();
  }, []);

  const loadWalls = async () => {
    setLoading(true);
    try {
      const response = await complianceService.getEthicalWalls({});
      setWalls(response.data);
    } catch (error) {
      console.error('Failed to load ethical walls:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMetrics = async () => {
    try {
      const data = await complianceService.getWallMetrics('default');
      setMetrics(data);
    } catch (error) {
      console.error('Failed to load metrics:', error);
    }
  };

  const loadBreaches = async () => {
    try {
      const data = await complianceService.getWallBreaches();
      setBreaches(data);
    } catch (error) {
      console.error('Failed to load breaches:', error);
    }
  };

  const handleCreate = async () => {
    try {
      await complianceService.createEthicalWall({
        name: formData.name,
        description: formData.description,
        reason: formData.reason,
        restrictedUsers: formData.restrictedUsers.split(',').map(u => u.trim()),
        restrictedEntities: formData.restrictedEntities,
        createdBy: 'current-user',
        createdByName: 'Current User',
        organizationId: 'default',
      });

      loadWalls();
      setShowCreateDialog(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create ethical wall:', error);
    }
  };

  const handleUpdate = async () => {
    if (!selectedWall) return;

    try {
      await complianceService.updateEthicalWall(selectedWall.id, {
        name: formData.name,
        description: formData.description,
        restrictedUsers: formData.restrictedUsers.split(',').map(u => u.trim()),
        restrictedEntities: formData.restrictedEntities,
      });

      loadWalls();
      setShowEditDialog(false);
      setSelectedWall(null);
      resetForm();
    } catch (error) {
      console.error('Failed to update ethical wall:', error);
    }
  };

  const handleDelete = async (wallId: string) => {
    if (!confirm('Are you sure you want to delete this ethical wall?')) return;

    try {
      await complianceService.deleteEthicalWall(wallId);
      loadWalls();
    } catch (error) {
      console.error('Failed to delete ethical wall:', error);
    }
  };

  const openEditDialog = (wall: EthicalWall) => {
    setSelectedWall(wall);
    setFormData({
      name: wall.name,
      description: wall.description,
      reason: '',
      restrictedUsers: wall.restrictedUsers.join(', '),
      restrictedEntities: wall.restrictedEntities,
    });
    setShowEditDialog(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      reason: '',
      restrictedUsers: '',
      restrictedEntities: [],
    });
  };

  const addEntity = () => {
    setFormData(prev => ({
      ...prev,
      restrictedEntities: [
        ...prev.restrictedEntities,
        { entityType: 'Case', entityId: '', entityName: '' },
      ],
    }));
  };

  const updateEntity = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      restrictedEntities: prev.restrictedEntities.map((e, i) =>
        i === index ? { ...e, [field]: value } : e
      ),
    }));
  };

  const removeEntity = (index: number) => {
    setFormData(prev => ({
      ...prev,
      restrictedEntities: prev.restrictedEntities.filter((_, i) => i !== index),
    }));
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      ACTIVE: 'bg-green-500',
      INACTIVE: 'bg-gray-500',
      EXPIRED: 'bg-red-500',
    };
    return <Badge className={colors[status as keyof typeof colors]}>{status}</Badge>;
  };

  const getEffectivenessColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Metrics Overview */}
      {metrics.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Walls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{walls.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Walls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {walls.filter(w => w.status === 'ACTIVE').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Recent Breaches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {breaches.filter(b => !b.resolved).length}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Ethical Walls Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Ethical Walls
              </CardTitle>
              <CardDescription>
                Manage information barriers and access restrictions
              </CardDescription>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Wall
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Restricted Users</TableHead>
                  <TableHead>Restricted Entities</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Loading ethical walls...
                    </TableCell>
                  </TableRow>
                ) : walls.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No ethical walls configured
                    </TableCell>
                  </TableRow>
                ) : (
                  walls.map((wall) => (
                    <TableRow key={wall.id}>
                      <TableCell className="font-medium">{wall.name}</TableCell>
                      <TableCell>
                        <div className="max-w-[300px] truncate" title={wall.description}>
                          {wall.description}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(wall.status)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{wall.restrictedUsers.length} users</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{wall.restrictedEntities.length} entities</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {new Date(wall.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => openEditDialog(wall)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDelete(wall.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Wall Effectiveness Metrics */}
      {metrics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Wall Effectiveness
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Wall Name</TableHead>
                    <TableHead>Days Active</TableHead>
                    <TableHead>Access Attempts</TableHead>
                    <TableHead>Blocked</TableHead>
                    <TableHead>Breaches</TableHead>
                    <TableHead>Effectiveness</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.map((metric) => (
                    <TableRow key={metric.wallId}>
                      <TableCell className="font-medium">{metric.wallName}</TableCell>
                      <TableCell>{metric.daysActive}</TableCell>
                      <TableCell>{metric.accessAttempts}</TableCell>
                      <TableCell>{metric.blockedAttempts}</TableCell>
                      <TableCell>
                        {metric.breachAttempts > 0 ? (
                          <Badge className="bg-red-500">{metric.breachAttempts}</Badge>
                        ) : (
                          <Badge className="bg-green-500">0</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className={`font-bold ${getEffectivenessColor(metric.effectivenessScore)}`}>
                          {metric.effectivenessScore}%
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Breaches */}
      {breaches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Recent Breaches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Wall</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Attempted Action</TableHead>
                    <TableHead>Detected</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {breaches.slice(0, 10).map((breach) => (
                    <TableRow key={breach.id}>
                      <TableCell>{breach.wallName}</TableCell>
                      <TableCell>{breach.userName}</TableCell>
                      <TableCell>{`${breach.entityType} ${breach.entityId}`}</TableCell>
                      <TableCell>{breach.attemptedAction}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {new Date(breach.detectedAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {breach.resolved ? (
                          <Badge className="bg-green-500">Resolved</Badge>
                        ) : (
                          <Badge className="bg-red-500">Unresolved</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Wall Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Ethical Wall</DialogTitle>
            <DialogDescription>
              Create a new information barrier to restrict access
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Wall Name</Label>
              <Input
                placeholder="e.g., Project Alpha Confidentiality"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Describe the purpose of this wall..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Reason for Wall</Label>
              <Textarea
                placeholder="Explain why this wall is necessary..."
                value={formData.reason}
                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Restricted Users (comma-separated IDs)</Label>
              <Input
                placeholder="user1, user2, user3"
                value={formData.restrictedUsers}
                onChange={(e) => setFormData(prev => ({ ...prev, restrictedUsers: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Restricted Entities</Label>
                <Button variant="outline" size="sm" onClick={addEntity}>
                  Add Entity
                </Button>
              </div>

              <div className="space-y-2">
                {formData.restrictedEntities.map((entity, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="Entity Type"
                      value={entity.entityType}
                      onChange={(e) => updateEntity(index, 'entityType', e.target.value)}
                      className="w-[150px]"
                    />
                    <Input
                      placeholder="Entity ID"
                      value={entity.entityId}
                      onChange={(e) => updateEntity(index, 'entityId', e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      placeholder="Entity Name"
                      value={entity.entityName}
                      onChange={(e) => updateEntity(index, 'entityName', e.target.value)}
                      className="flex-1"
                    />
                    <Button variant="outline" size="icon" onClick={() => removeEntity(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>
              Create Wall
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Wall Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Ethical Wall</DialogTitle>
            <DialogDescription>
              Update wall configuration
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Wall Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Restricted Users (comma-separated IDs)</Label>
              <Input
                value={formData.restrictedUsers}
                onChange={(e) => setFormData(prev => ({ ...prev, restrictedUsers: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>
              Update Wall
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
