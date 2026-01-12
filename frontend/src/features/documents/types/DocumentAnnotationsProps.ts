export interface Annotation {
  id: string;
  documentId: string;
  page: number;
  text: string;
  author: string;
  createdAt: string;
  x?: number;
  y?: number;
  color?: string;
}

export interface DocumentAnnotationsProps {
  documentId: string;
  annotations: Annotation[];
  onAdd?: (annotation: Omit<Annotation, 'id' | 'createdAt'>) => void;
  onDelete?: (id: string) => void;
  currentPage?: number;
}
