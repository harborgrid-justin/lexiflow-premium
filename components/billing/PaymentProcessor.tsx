import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CreditCard,
  Building2,
  Shield,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { paymentService } from '@/services/paymentService';

interface PaymentProcessorProps {
  invoiceId?: string;
  amount: number;
  currency?: string;
  onSuccess?: (paymentId: string) => void;
  onError?: (error: string) => void;
}

interface CardDetails {
  number: string;
  name: string;
  expiry: string;
  cvv: string;
  zip: string;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account';
  last4: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

const PaymentProcessor: React.FC<PaymentProcessorProps> = ({
  invoiceId,
  amount,
  currency = 'USD',
  onSuccess,
  onError,
}) => {
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'saved'>('card');
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
    zip: '',
  });
  const [saveCard, setSaveCard] = useState(false);
  const [savedMethods, setSavedMethods] = useState<PaymentMethod[]>([]);
  const [selectedSavedMethod, setSelectedSavedMethod] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadSavedPaymentMethods();
  }, []);

  const loadSavedPaymentMethods = async () => {
    try {
      const methods = await paymentService.getPaymentMethods();
      setSavedMethods(methods);
    } catch (error) {
      console.error('Failed to load payment methods:', error);
    }
  };

  const handleCardInputChange = (field: keyof CardDetails, value: string) => {
    setCardDetails(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(' ') : cleaned;
  };

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const validateCardDetails = (): boolean => {
    if (!cardDetails.number || cardDetails.number.replace(/\s/g, '').length < 13) {
      setError('Please enter a valid card number');
      return false;
    }

    if (!cardDetails.name || cardDetails.name.trim().length < 3) {
      setError('Please enter the cardholder name');
      return false;
    }

    if (!cardDetails.expiry || !cardDetails.expiry.match(/^\d{2}\/\d{2}$/)) {
      setError('Please enter a valid expiry date (MM/YY)');
      return false;
    }

    if (!cardDetails.cvv || cardDetails.cvv.length < 3) {
      setError('Please enter a valid CVV');
      return false;
    }

    if (!cardDetails.zip || cardDetails.zip.length < 5) {
      setError('Please enter a valid ZIP code');
      return false;
    }

    return true;
  };

  const processPayment = async () => {
    setError('');
    setProcessing(true);

    try {
      let paymentId: string;

      if (paymentMethod === 'card') {
        if (!validateCardDetails()) {
          setProcessing(false);
          return;
        }

        const result = await paymentService.processCardPayment({
          amount,
          currency,
          cardDetails: {
            number: cardDetails.number.replace(/\s/g, ''),
            name: cardDetails.name,
            expMonth: cardDetails.expiry.split('/')[0],
            expYear: `20${cardDetails.expiry.split('/')[1]}`,
            cvv: cardDetails.cvv,
            zip: cardDetails.zip,
          },
          invoiceId,
          saveCard,
        });

        paymentId = result.paymentId;
      } else if (paymentMethod === 'paypal') {
        const result = await paymentService.processPayPalPayment({
          amount,
          currency,
          invoiceId,
        });

        paymentId = result.paymentId;
      } else {
        // Saved payment method
        if (!selectedSavedMethod) {
          setError('Please select a saved payment method');
          setProcessing(false);
          return;
        }

        const result = await paymentService.processSavedMethodPayment({
          amount,
          currency,
          paymentMethodId: selectedSavedMethod,
          invoiceId,
        });

        paymentId = result.paymentId;
      }

      setSuccess(true);
      onSuccess?.(paymentId);

      // Clear form
      setCardDetails({
        number: '',
        name: '',
        expiry: '',
        cvv: '',
        zip: '',
      });

      // Reload saved methods if card was saved
      if (saveCard) {
        await loadSavedPaymentMethods();
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Payment failed';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Payment Details</CardTitle>
        <CardDescription>
          Complete your payment of {currency} {amount.toFixed(2)}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="card">
              <CreditCard className="mr-2 h-4 w-4" />
              Card
            </TabsTrigger>
            <TabsTrigger value="paypal">
              <Building2 className="mr-2 h-4 w-4" />
              PayPal
            </TabsTrigger>
            {savedMethods.length > 0 && (
              <TabsTrigger value="saved">
                <Shield className="mr-2 h-4 w-4" />
                Saved
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="card" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={formatCardNumber(cardDetails.number)}
                onChange={(e) =>
                  handleCardInputChange('number', e.target.value.replace(/\s/g, ''))
                }
                maxLength={19}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardName">Cardholder Name</Label>
              <Input
                id="cardName"
                placeholder="John Doe"
                value={cardDetails.name}
                onChange={(e) => handleCardInputChange('name', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Expiry</Label>
                <Input
                  id="expiry"
                  placeholder="MM/YY"
                  value={formatExpiry(cardDetails.expiry)}
                  onChange={(e) =>
                    handleCardInputChange('expiry', e.target.value.replace(/\D/g, ''))
                  }
                  maxLength={5}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  type="password"
                  placeholder="123"
                  value={cardDetails.cvv}
                  onChange={(e) =>
                    handleCardInputChange('cvv', e.target.value.replace(/\D/g, ''))
                  }
                  maxLength={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="zip">ZIP Code</Label>
                <Input
                  id="zip"
                  placeholder="12345"
                  value={cardDetails.zip}
                  onChange={(e) => handleCardInputChange('zip', e.target.value)}
                  maxLength={10}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="saveCard"
                checked={saveCard}
                onChange={(e) => setSaveCard(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="saveCard" className="text-sm">
                Save card for future payments
              </Label>
            </div>
          </TabsContent>

          <TabsContent value="paypal" className="mt-4">
            <Alert>
              <Building2 className="h-4 w-4" />
              <AlertDescription>
                You will be redirected to PayPal to complete your payment securely.
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="saved" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Select Payment Method</Label>
              <Select value={selectedSavedMethod} onValueChange={setSelectedSavedMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a saved payment method" />
                </SelectTrigger>
                <SelectContent>
                  {savedMethods.map((method) => (
                    <SelectItem key={method.id} value={method.id}>
                      <div className="flex items-center gap-2">
                        {method.type === 'card' && method.brand && (
                          <span className="font-medium">{method.brand}</span>
                        )}
                        <span>•••• {method.last4}</span>
                        {method.expiryMonth && method.expiryYear && (
                          <span className="text-xs text-muted-foreground">
                            {method.expiryMonth}/{method.expiryYear}
                          </span>
                        )}
                        {method.isDefault && (
                          <Badge variant="secondary" className="ml-2">
                            Default
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
        </Tabs>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mt-4">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>Payment processed successfully!</AlertDescription>
          </Alert>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <div className="flex items-center text-sm text-muted-foreground">
          <Shield className="mr-2 h-4 w-4" />
          Secure payment processing
        </div>

        <Button
          onClick={processPayment}
          disabled={processing || success}
          size="lg"
        >
          {processing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>Pay {currency} {amount.toFixed(2)}</>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PaymentProcessor;
