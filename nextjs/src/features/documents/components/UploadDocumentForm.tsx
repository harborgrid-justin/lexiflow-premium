'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { uploadDocument } from '@/actions/document-actions';
import { Button } from '@/components/ui/button';
import { UploadCloudIcon } from 'lucide-react';
// import { toast } from 'sonner';

const initialState = {
  success: false,
  message: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Uploading...
        </>
      ) : (
        <>
          <UploadCloudIcon className="mr-2 h-4 w-4" />
          Upload Document
        </>
      )}
    </Button>
  );
}

export function UploadDocumentForm() {
  const [state, formAction] = useActionState(uploadDocument, initialState);

  // Simple feedback (could use Toast in real app)
  useEffect(() => {
    if (state.message) {
      if (state.success) {
        // alert("Upload successful: " + state.message);
        // In a real app, clear form or close modal
      } else {
        console.error(state.message);
        // alert("Error: " + state.message);
      }
    }
  }, [state]);

  return (
    <form action={formAction}>
      {/* Hidden file input trick or a styled label */}
      <div className="flex items-center gap-2">
        {/* For demo simplicity, just a standard file input and a button next to it
             In production, use a Dialog/Modal
         */}
        <input
          type="file"
          name="file"
          required
          className="text-sm text-slate-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
            "
        />
        <SubmitButton />
      </div>
      {state.message && !state.success && (
        <p className="mt-2 text-sm text-red-600">{state.message}</p>
      )}
    </form>
  );
}
