import { Button } from '@/components/atoms/Button/Button';
import { Input } from '@/components/atoms/Input/Input';
import { TextArea } from '@/components/atoms/TextArea/TextArea';
import { useTheme } from "@/hooks/useTheme";
import { cn } from '@/lib/cn';
import { Wand2 } from 'lucide-react';

interface FormData {
  recipient: string;
  date: string;
  mainPoint: string;
}

interface Step2FormConfigurationProps {
  template: string;
  formData: FormData;
  onFormDataChange: (data: FormData) => void;
  onGenerate: () => void;
}

export function Step2FormConfiguration({ template, formData, onFormDataChange, onGenerate }: Step2FormConfigurationProps) {
  const { theme } = useTheme();

  const handleChange = (field: keyof FormData, value: string) => {
    onFormDataChange({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-4">
      <h4 className={cn("text-lg font-semibold", theme.text.primary)}>Configure: {template}</h4>

      <Input
        label="Recipient Name"
        value={formData.recipient}
        onChange={(e) => handleChange('recipient', e.target.value)}
        placeholder="e.g. John Doe"
      />

      <Input
        label="Date"
        type="date"
        value={formData.date}
        onChange={(e) => handleChange('date', e.target.value)}
      />

      <TextArea
        label="Main Points / Arguments"
        value={formData.mainPoint}
        onChange={(e) => handleChange('mainPoint', e.target.value)}
        placeholder="List the key points to include..."
        rows={5}
      />

      <div className="pt-4">
        <Button variant="primary" onClick={onGenerate} icon={Wand2} className="w-full">
          Generate Draft
        </Button>
      </div>
    </div>
  );
}
