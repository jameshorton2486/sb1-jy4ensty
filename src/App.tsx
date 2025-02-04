import React from 'react';
import { FileText } from 'lucide-react';
import { LegalDocumentForm } from './components/LegalDocumentForm';
import { DocumentUpload } from './components/DocumentUpload';
import { AudioTranscription } from './components/AudioTranscription';
import { useAttorney } from './lib/hooks';

function App() {
  const { attorney, loading, error } = useAttorney();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <FileText className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Legal Document Management</h1>
          <p className="mt-2 text-sm text-gray-600">
            Upload documents, manage deposition schedules, and transcribe audio
          </p>
        </div>

        <div className="grid gap-8">
          <div>
            <DocumentUpload />
          </div>
          <div>
            <AudioTranscription />
          </div>
          <div>
            <LegalDocumentForm attorney={attorney} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;