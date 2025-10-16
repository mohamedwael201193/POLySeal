import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { scannerBase } from '@/lib/env';
import { createAttestation } from '@/services/api';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, FileText, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAccount } from 'wagmi';

// Real schemas (using proper 32-byte schema UIDs)
const mockSchemas = [
  { 
    id: '0x27d06e3659317e9a4f8154d1e849eb53d43d91fb4f219884d1684f86d797804a', 
    name: 'POLySeal General', 
    description: 'General purpose attestation schema' 
  },
  { 
    id: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef', 
    name: 'Skill Attestation', 
    description: 'Attest to user skills and certifications' 
  },
  { 
    id: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890', 
    name: 'Event Attendance', 
    description: 'Proof of event attendance and participation' 
  },
];

export default function CreateAttestation() {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    schema: '',
    recipient: '',
    data: {} as Record<string, any>,
  });

  const handleSubmit = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createAttestation({
        schema: formData.schema,
        recipient: formData.recipient,
        data: formData.data,
      });

      setTxHash(result.txHash);
      setStep(4); // Success step

      toast.success('Attestation created successfully!');
    } catch (error) {
      console.error('Failed to create attestation:', error);
      toast.error('Failed to create attestation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2">
          <FileText className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold text-gradient-purple">Create Attestation</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Follow the wizard to create a verifiable on-chain attestation
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center">
            <Badge
              variant={step >= s ? 'default' : 'outline'}
              className={step >= s ? 'bg-primary' : ''}
            >
              {s}
            </Badge>
            {s < 4 && (
              <ArrowRight className={`h-4 w-4 mx-1 ${step > s ? 'text-primary' : 'text-muted-foreground'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Form Steps */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>
            {step === 1 && 'Select Schema'}
            {step === 2 && 'Recipient Details'}
            {step === 3 && 'Attestation Data'}
            {step === 4 && 'Success!'}
          </CardTitle>
          <CardDescription>
            {step === 1 && 'Choose the schema for your attestation'}
            {step === 2 && 'Enter the recipient address'}
            {step === 3 && 'Provide attestation details'}
            {step === 4 && 'Your attestation has been created'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Schema Selection */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label>Schema</Label>
                <Select
                  value={formData.schema}
                  onValueChange={(value) => setFormData({ ...formData, schema: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a schema" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockSchemas.map((schema) => (
                      <SelectItem key={schema.id} value={schema.id}>
                        <div>
                          <p className="font-medium">{schema.name}</p>
                          <p className="text-xs text-muted-foreground">{schema.description}</p>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="neon"
                onClick={() => setStep(2)}
                disabled={!formData.schema}
                className="w-full"
              >
                Next
                <ArrowRight />
              </Button>
            </motion.div>
          )}

          {/* Step 2: Recipient */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label>Recipient Address</Label>
                <Input
                  placeholder="0x..."
                  value={formData.recipient}
                  onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                  className="font-mono"
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button
                  variant="neon"
                  onClick={() => setStep(3)}
                  disabled={!formData.recipient}
                  className="flex-1"
                >
                  Next
                  <ArrowRight />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Data */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label>Attestation Data</Label>
                <Input
                  placeholder="Key"
                  value={formData.data.key || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      data: { ...formData.data, key: e.target.value },
                    })
                  }
                />
                <Input
                  placeholder="Value"
                  value={formData.data.value || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      data: { ...formData.data, value: e.target.value },
                    })
                  }
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Back
                </Button>
                <Button
                  variant="neon"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !formData.data.key || !formData.data.value}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Create Attestation
                      <CheckCircle2 />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Success */}
          {step === 4 && txHash && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <CheckCircle2 className="h-16 w-16 text-success mx-auto animate-scale-in" />
              
              <div>
                <h3 className="text-2xl font-bold mb-2">Attestation Created!</h3>
                <p className="text-muted-foreground">
                  Your attestation has been successfully recorded on-chain.
                </p>
              </div>

              <div className="space-y-2">
                <Button
                  variant="outline"
                  asChild
                  className="w-full"
                >
                  <a
                    href={`${scannerBase}/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on Polygonscan
                  </a>
                </Button>
                <Button
                  variant="neon"
                  onClick={() => {
                    setStep(1);
                    setFormData({ schema: '', recipient: '', data: {} });
                    setTxHash(null);
                  }}
                  className="w-full"
                >
                  Create Another
                </Button>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
