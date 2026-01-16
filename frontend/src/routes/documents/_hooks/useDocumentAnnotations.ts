import { DocumentsApiService } from "@/api/admin/documents-api";
import { queryClient, useMutation, useQuery } from "@/hooks/useQueryHooks";
import { queryKeys } from "@/utils/queryKeys";
import { useState } from "react";
import { Annotation } from "../types/DocumentAnnotationsProps";

const documentsApi = new DocumentsApiService();

interface UseDocumentAnnotationsProps {
  documentId: string;
  annotations: Annotation[];
  onAdd?: (annotation: Omit<Annotation, "id" | "createdAt">) => void;
  currentPage?: number;
}

export const useDocumentAnnotations = ({
  documentId,
  annotations: propAnnotations,
  onAdd,
  currentPage = 1,
}: UseDocumentAnnotationsProps) => {
  // Fetch annotations from backend
  const { data: backendAnnotations = [] } = useQuery(
    queryKeys.documents.annotations(documentId),
    async () => {
      try {
        return await documentsApi.getAnnotations(documentId);
      } catch (error) {
        console.error("Error fetching annotations:", error);
        return propAnnotations || [];
      }
    }
  );

  // Use backend annotations if available, otherwise fall back to props
  const annotations =
    backendAnnotations.length > 0 ? backendAnnotations : propAnnotations;

  // Add annotation mutation
  const { mutate: addAnnotationMutation } = useMutation(
    async (annotation: Omit<Annotation, "id" | "createdAt">) => {
      return await documentsApi.addAnnotation(documentId, annotation);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(
          queryKeys.documents.annotations(documentId)
        );
      },
    }
  );
  const [isAdding, setIsAdding] = useState(false);
  const [newAnnotation, setNewAnnotation] = useState({
    page: currentPage,
    text: "",
    author: "Current User",
    color: "#FCD34D",
  });

  const filteredAnnotations = currentPage
    ? annotations.filter((a) => a.page === currentPage)
    : annotations;

  const handleAdd = () => {
    if (newAnnotation.text.trim()) {
      const annotationToAdd = {
        documentId,
        page: newAnnotation.page,
        text: newAnnotation.text,
        author: newAnnotation.author,
        color: newAnnotation.color,
      };
      // Use backend mutation first, fallback to prop callback
      addAnnotationMutation(annotationToAdd);
      onAdd?.(annotationToAdd);

      setNewAnnotation({
        page: currentPage,
        text: "",
        author: "Current User",
        color: "#FCD34D",
      });
      setIsAdding(false);
    }
  };

  const colors = [
    { value: "#FCD34D", name: "Yellow" },
    { value: "#34D399", name: "Green" },
    { value: "#60A5FA", name: "Blue" },
    { value: "#F87171", name: "Red" },
    { value: "#A78BFA", name: "Purple" },
  ];

  return {
    isAdding,
    setIsAdding,
    newAnnotation,
    setNewAnnotation,
    filteredAnnotations,
    handleAdd,
    colors,
  };
};
