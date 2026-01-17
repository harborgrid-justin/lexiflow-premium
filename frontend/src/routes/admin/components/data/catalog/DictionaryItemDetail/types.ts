import { type DataDictionaryItem } from '@/types';

export interface DictionaryItemDetailProps {
  item: DataDictionaryItem;
  onClose: () => void;
}

export interface CardSectionProps {
  formData: DataDictionaryItem;
  setFormData: React.Dispatch<React.SetStateAction<DataDictionaryItem>>;
}

export interface DefinitionCardProps extends CardSectionProps {
  onAISuggestion: () => void;
  isGenerating: boolean;
}
