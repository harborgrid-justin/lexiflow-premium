import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/shadcn/card';
import { Input } from '@/components/ui/shadcn/input';
import { Label } from '@/components/ui/shadcn/label';
import { Button } from '@/components/ui/shadcn/button';
import { Textarea } from '@/components/ui/shadcn/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/shadcn/select';
import { DataService } from '@/services/data/dataService';
import { Loader2, Plus } from 'lucide-react';

export const CaseIntake: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    clientName: '',
    caseType: '',
    description: '',
    contactEmail: '',
    priority: 'Normal'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create client contact in CRM
      // 2. Create potential case/matter
      // For now, we'll route to cases.create with status 'Intake'

      await DataService.cases.add({
        title: `${formData.clientName} - ${formData.caseType}`,
        status: 'Intake',
        description: formData.description,
        type: formData.caseType,
        priority: formData.priority,
        client: { name: formData.clientName, email: formData.contactEmail }
      });

      setFormData({
        clientName: '',
        caseType: '',
        description: '',
        contactEmail: '',
        priority: 'Normal'
      });

      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Intake failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Case Intake Form</CardTitle>
        <CardDescription>Enter details for new matter evaluation</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name</Label>
              <Input
                id="clientName"
                required
                value={formData.clientName}
                onChange={e => setFormData({ ...formData, clientName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                required
                value={formData.contactEmail}
                onChange={e => setFormData({ ...formData, contactEmail: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="caseType">Case Type</Label>
              <Select
                value={formData.caseType}
                onValueChange={v => setFormData({ ...formData, caseType: v })}
              >
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Civil Litigation">Civil Litigation</SelectItem>
                  <SelectItem value="Corporate">Corporate</SelectItem>
                  <SelectItem value="IP">Intellectual Property</SelectItem>
                  <SelectItem value="Employment">Employment</SelectItem>
                  <SelectItem value="Criminal">Criminal Defense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={v => setFormData({ ...formData, priority: v })}
              >
                <SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Normal">Normal</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Case Description</Label>
            <Textarea
              id="description"
              className="resize-none min-h-25"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Intake
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
