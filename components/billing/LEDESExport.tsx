import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { ledesService } from '@/services/ledesService';

interface LEDESExportProps {
  invoiceId: string;
}

const LEDESExport: React.FC<LEDESExportProps> = ({ invoiceId }) => {
  const [format, setFormat] = useState<'LEDES_1998B' | 'LEDES_2000'>('LEDES_1998B');
  const [platform, setPlatform] = useState<string>('COUNSELLINK');
  const [generating, setGenerating] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validation, setValidation] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const platforms = [
    { value: 'COUNSELLINK', label: 'CounselLink' },
    { value: 'TYMETRIX', label: 'Tymetrix 360' },
    { value: 'SERENGETI', label: 'Serengeti Tracker' },
    { value: 'LEGAL_TRACKER', label: 'Legal Tracker' },
    { value: 'BRIGHTFLAG', label: 'BrightFlag' },
    { value: 'APPERIO', label: 'Apperio' },
  ];

  const generateLEDES = async () => {
    setGenerating(true);
    setError('');
    try {
      const result = await ledesService.generateLEDES(invoiceId, format);

      // Create download
      const blob = new Blob([result.content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice_${invoiceId}_${format}.txt`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || 'Failed to generate LEDES file');
    } finally {
      setGenerating(false);
    }
  };

  const validateLEDES = async () => {
    setValidating(true);
    setError('');
    try {
      const result = await ledesService.validateLEDES(invoiceId, format);
      setValidation(result);
    } catch (err: any) {
      setError(err.message || 'Validation failed');
    } finally {
      setValidating(false);
    }
  };

  const submitToEBilling = async () => {
    setGenerating(true);
    setError('');
    try {
      await ledesService.submitToEBilling(invoiceId, platform);
      alert('Successfully submitted to e-billing platform');
    } catch (err: any) {
      setError(err.message || 'Submission failed');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>LEDES Export & E-Billing</CardTitle>
        <CardDescription>
          Generate LEDES files and submit to e-billing platforms
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">LEDES Format</label>
          <Select value={format} onValueChange={(v: any) => setFormat(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LEDES_1998B">LEDES 1998B (26 fields)</SelectItem>
              <SelectItem value="LEDES_2000">LEDES 2000 (Extended)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">E-Billing Platform</label>
          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {platforms.map(p => (
                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {validation && (
          <Alert variant={validation.isValid ? 'default' : 'destructive'}>
            {validation.isValid ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <AlertDescription>
              {validation.isValid ? 'LEDES file is valid' : `Validation errors: ${validation.errors.length}`}
              {validation.warnings?.length > 0 && ` (${validation.warnings.length} warnings)`}
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2 flex-wrap">
          <Button onClick={generateLEDES} disabled={generating || validating}>
            {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Generate & Download
          </Button>

          <Button variant="outline" onClick={validateLEDES} disabled={generating || validating}>
            {validating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
            Validate
          </Button>

          <Button variant="secondary" onClick={submitToEBilling} disabled={generating || validating}>
            Submit to {platforms.find(p => p.value === platform)?.label}
          </Button>
        </div>

        {validation && !validation.isValid && (
          <div className="mt-4 p-4 border rounded-md bg-muted">
            <h4 className="font-medium mb-2">Validation Errors:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {validation.errors.slice(0, 5).map((err: string, i: number) => (
                <li key={i} className="text-red-600">{err}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LEDESExport;
