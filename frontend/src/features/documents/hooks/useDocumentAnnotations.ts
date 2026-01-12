import { useState } from 'react';
import { Annotation } from '../types/DocumentAnnotationsProps';

interface UseDocumentAnnotationsProps {
  documentId: string;
  annotations: Annotation[];
  onAdd?: (annotation: Omit<Annotation, 'id' | 'createdAt'>) => void;
  currentPage?: number;
}

export const useDocumentAnnotations = ({
  documentId,
  annotations,
  onAdd,
  currentPage = 1
}: UseDocumentAnnotationsProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newAnnotation, setNewAnnotation] = useState({
    page: currentPage,
    text: '',
    author: 'Current User',
    color: '#FCD34D'
  });

  const filteredAnnotations = currentPage
    ? annotations.filter(a => a.page === currentPage)
    : annotations;

  const handleAdd = () => {
    if (newAnnotation.text.trim()) {
      onAdd?.({
        documentId,
        page: newAnnotation.page,
        text: newAnnotation.text,
        author: newAnnotation.author,
        color: newAnnotation.color
      });
      setNewAnnotation({ page: currentPage, text: '', author: 'Current User', color: '#FCD34D' });
      setIsAdding(false);
    }
  };

  const colors = [
    { value: '#FCD34D', name: 'Yellow' },
    { value: '#34D399', name: 'Green' },
    { value: '#60A5FA', name: 'Blue' },
    { value: '#F87171', name: 'Red' },
    { value: '#A78BFA', name: 'Purple' },
  ];

  return {
    isAdding,
    setIsAdding,
    newAnnotation,
    setNewAnnotation,
    filteredAnnotations,
    handleAdd,
    colors
  };
};
