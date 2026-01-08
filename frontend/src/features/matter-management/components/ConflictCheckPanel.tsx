import React, { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  AlertTriangle,
  CheckCircle,
  Shield,
  AlertCircle,
  FileWarning,
  Users,
} from 'lucide-react';
import { ConflictCheckResult } from '../types';

interface ConflictCheckPanelProps {
  matterId?: string;
  onConflictCheckComplete?: (result: ConflictCheckResult) => void;
}

export const ConflictCheckPanel: React.FC<ConflictCheckPanelProps> = ({
  matterId,
  onConflictCheckComplete,
}) => {
  const [step, setStep] = useState<'input' | 'checking' | 'results'>('input');
  const [clientName, setClientName] = useState('');
  const [matterDescription, setMatterDescription] = useState('');
  const [partiesInvolved, setPartiesInvolved] = useState('');
  const [opposingParties, setOpposingParties] = useState('');
  const [checkProgress, setCheckProgress] = useState(0);
  const [result, setResult] = useState<ConflictCheckResult | null>(null);

  const handleRunCheck = async () => {
    setStep('checking');
    setCheckProgress(0);

    // Simulate checking progress
    const progressInterval = setInterval(() => {
      setCheckProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    try {
      // API call would go here
      // const response = await fetch('/api/conflict-checks/perform', {
      //   method: 'POST',
      //   body: JSON.stringify({
      //     matterId,
      //     potentialClientName: clientName,
      //     matterDescription,
      //     partiesInvolved: partiesInvolved.split('\n'),
      //     opposingParties: opposingParties.split('\n'),
      //   }),
      // });
      // const data = await response.json();
      // setResult(data);

      // Mock result for demonstration
      setTimeout(() => {
        const mockResult: ConflictCheckResult = {
          hasConflict: opposingParties.includes('ABC Corp'),
          conflictSeverity: opposingParties.includes('ABC Corp') ? 'high' : undefined,
          conflictType: opposingParties.includes('ABC Corp')
            ? 'adverse_interest'
            : undefined,
          conflictingCases: opposingParties.includes('ABC Corp')
            ? [
                {
                  caseId: 'case-1',
                  caseNumber: 'CV-2025-0123',
                  title: 'ABC Corp v. XYZ Inc.',
                  conflictReason: 'ABC Corp is a current client in an active case',
                },
              ]
            : [],
          conflictingClients: opposingParties.includes('ABC Corp')
            ? [
                {
                  clientId: 'client-1',
                  clientName: 'ABC Corp',
                  conflictReason: 'ABC Corp is a current client',
                },
              ]
            : [],
          recommendations: opposingParties.includes('ABC Corp')
            ? [
                'HIGH: Significant conflict detected.',
                'Obtain written waiver from all affected parties before proceeding.',
                'Consider implementing ethical walls if representation proceeds.',
              ]
            : ['No conflicts identified. Matter can proceed.'],
          requiresWaiver: opposingParties.includes('ABC Corp'),
        };
        setResult(mockResult);
        setStep('results');
        onConflictCheckComplete?.(mockResult);
      }, 2500);
    } catch (error) {
      console.error('Failed to perform conflict check:', error);
      clearInterval(progressInterval);
      setStep('input');
    }
  };

  const getSeverityIcon = (severity?: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'high':
        return <AlertCircle className="h-5 w-5 text-orange-600" />;
      case 'medium':
        return <FileWarning className="h-5 w-5 text-yellow-600" />;
      case 'low':
        return <AlertCircle className="h-5 w-5 text-blue-600" />;
      default:
        return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-green-500';
    }
  };

  const renderInputForm = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="clientName">Potential Client Name</Label>
        <Input
          id="clientName"
          placeholder="Enter client name..."
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="matterDescription">Matter Description</Label>
        <Textarea
          id="matterDescription"
          placeholder="Brief description of the matter..."
          value={matterDescription}
          onChange={(e) => setMatterDescription(e.target.value)}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="partiesInvolved">Parties Involved</Label>
        <Textarea
          id="partiesInvolved"
          placeholder="Enter party names (one per line)..."
          value={partiesInvolved}
          onChange={(e) => setPartiesInvolved(e.target.value)}
          rows={4}
        />
        <p className="text-xs text-muted-foreground">
          Enter names of all parties your client is representing or associated with
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="opposingParties">Opposing Parties</Label>
        <Textarea
          id="opposingParties"
          placeholder="Enter opposing party names (one per line)..."
          value={opposingParties}
          onChange={(e) => setOpposingParties(e.target.value)}
          rows={4}
        />
        <p className="text-xs text-muted-foreground">
          Enter names of all opposing parties or adverse interests
        </p>
      </div>

      <Button
        onClick={handleRunCheck}
        disabled={!clientName || !matterDescription}
        className="w-full"
      >
        <Shield className="mr-2 h-4 w-4" />
        Run Conflict Check
      </Button>
    </div>
  );

  const renderChecking = () => (
    <div className="space-y-6 py-8">
      <div className="flex justify-center">
        <Shield className="h-16 w-16 text-primary animate-pulse" />
      </div>
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Running Conflict Check</h3>
        <p className="text-sm text-muted-foreground">
          Analyzing parties, clients, and active cases...
        </p>
      </div>
      <Progress value={checkProgress} className="w-full" />
      <p className="text-center text-xs text-muted-foreground">
        {checkProgress}% complete
      </p>
    </div>
  );

  const renderResults = () => {
    if (!result) return null;

    return (
      <div className="space-y-6">
        {/* Overall Result */}
        <Alert
          className={
            result.hasConflict
              ? 'border-red-500 bg-red-50'
              : 'border-green-500 bg-green-50'
          }
        >
          <div className="flex items-start gap-3">
            {getSeverityIcon(result.conflictSeverity)}
            <div className="flex-1">
              <AlertTitle className={result.hasConflict ? 'text-red-900' : 'text-green-900'}>
                {result.hasConflict ? 'Conflict Detected' : 'No Conflicts Found'}
              </AlertTitle>
              <AlertDescription className={result.hasConflict ? 'text-red-800' : 'text-green-800'}>
                {result.hasConflict
                  ? `${result.conflictSeverity?.toUpperCase()} severity conflict detected. Review details below.`
                  : 'No conflicts of interest identified. Matter can proceed.'}
              </AlertDescription>
            </div>
            {result.conflictSeverity && (
              <Badge className={getSeverityColor(result.conflictSeverity)}>
                {result.conflictSeverity}
              </Badge>
            )}
          </div>
        </Alert>

        {/* Conflicting Cases */}
        {result.conflictingCases && result.conflictingCases.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileWarning className="h-4 w-4" />
                Conflicting Cases ({result.conflictingCases.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {result.conflictingCases.map((conflict) => (
                  <div
                    key={conflict.caseId}
                    className="p-3 border rounded-lg space-y-1"
                  >
                    <div className="font-medium">{conflict.title}</div>
                    <div className="text-sm text-muted-foreground">
                      Case No: {conflict.caseNumber}
                    </div>
                    <div className="text-sm text-orange-600">
                      {conflict.conflictReason}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Conflicting Clients */}
        {result.conflictingClients && result.conflictingClients.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Conflicting Clients ({result.conflictingClients.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {result.conflictingClients.map((conflict) => (
                  <div
                    key={conflict.clientId}
                    className="p-3 border rounded-lg space-y-1"
                  >
                    <div className="font-medium">{conflict.clientName}</div>
                    <div className="text-sm text-orange-600">
                      {conflict.conflictReason}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommendations */}
        {result.recommendations && result.recommendations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-primary">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Waiver Required */}
        {result.requiresWaiver && (
          <Alert className="border-orange-500 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertTitle className="text-orange-900">Waiver Required</AlertTitle>
            <AlertDescription className="text-orange-800">
              This conflict requires a written waiver from all affected parties before
              proceeding with representation.
            </AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button onClick={() => setStep('input')} variant="outline" className="flex-1">
            Run Another Check
          </Button>
          {result.hasConflict && (
            <Button variant="outline" className="flex-1">
              Request Waiver
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Conflict Check
        </CardTitle>
        <CardDescription>
          Perform conflict of interest checks before accepting new matters
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === 'input' && renderInputForm()}
        {step === 'checking' && renderChecking()}
        {step === 'results' && renderResults()}
      </CardContent>
    </Card>
  );
};

export default ConflictCheckPanel;
