import React, { useState } from 'react';
import { FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { DocumentProcessor, ProcessedDocument, FormField } from '../../services/documentProcessor';

interface AIDocumentProcessorProps {
  file: File;
  onProcessed: (fields: FormField[]) => void;
  onError: (error: string) => void;
}

export const AIDocumentProcessor: React.FC<AIDocumentProcessorProps> = ({
  file,
  onProcessed,
  onError
}) => {
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);

  const processDocument = async () => {
    setProcessing(true);
    setStatus('processing');
    setProgress(0);

    const processor = new DocumentProcessor();

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const result = await processor.processDocument(file);
      
      clearInterval(progressInterval);
      setProgress(100);
      setStatus('success');
      onProcessed(result.fields);
    } catch (error) {
      setStatus('error');
      onError(error instanceof Error ? error.message : 'Failed to process document');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FileText className="w-6 h-6 text-blue-500" />
          <span className="font-medium text-gray-900">{file.name}</span>
        </div>
        <div className="flex items-center space-x-2">
          {status === 'processing' && (
            <div className="text-sm text-gray-500">
              Processing... {progress}%
            </div>
          )}
          {status === 'success' && (
            <CheckCircle className="w-5 h-5 text-green-500" />
          )}
          {status === 'error' && (
            <AlertCircle className="w-5 h-5 text-red-500" />
          )}
        </div>
      </div>

      <div className="relative pt-1">
        <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
          <div
            style={{ width: `${progress}%` }}
            className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
              status === 'error' ? 'bg-red-500' : 'bg-blue-500'
            } transition-all duration-300`}
          />
        </div>
      </div>

      {status === 'idle' && (
        <button
          onClick={processDocument}
          disabled={processing}
          className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Process Document
        </button>
      )}
    </div>
  );
};