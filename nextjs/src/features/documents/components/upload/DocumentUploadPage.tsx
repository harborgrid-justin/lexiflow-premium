'use client';

import { Button } from '@/components/ui/atoms/Button';
import { Card } from '@/components/ui/molecules/Card/Card';
import { FileUploadZone } from '@/components/ui/molecules/FileUploadZone/FileUploadZone';
import React, { useState } from 'react';

export default function DocumentUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processStage, setProcessStage] = useState('');
  const [generatedHash, setGeneratedHash] = useState<string | undefined>(undefined);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      // Simulate processing
      setProcessing(true);
      setProcessStage('Calculating Hash...');
      setTimeout(() => {
        setGeneratedHash('simulated-hash-12345');
        setProcessStage('Ready to Upload');
        setProcessing(false);
      }, 1500);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Upload Document</h1>
      <Card>
        <div className="p-6">
          <FileUploadZone
            file={file}
            processing={processing}
            processStage={processStage}
            onFileSelect={handleFileSelect}
            generatedHash={generatedHash}
          />

          {file && !processing && (
            <div className="mt-4 flex justify-end">
              <Button onClick={() => console.log('Upload clicked')}>
                Upload {file.name}
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
