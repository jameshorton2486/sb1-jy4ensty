import React, { useState } from 'react';
import { Upload, FileType, X, Plus, FileCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { FileUploadZone } from './FileUploadZone';
import { DocumentPreview } from './DocumentPreview';
import { FieldMapping } from './FieldMapping';
import { AIDocumentProcessor } from './AIDocumentProcessor';
import type { FormField } from '../../services/documentProcessor';

const ACCEPTED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/plain': ['.txt'],
  'application/rtf': ['.rtf']
};

export const DocumentUpload: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [extractedFields, setExtractedFields] = useState<FormField[]>([]);
  const [mappedFields, setMappedFields] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileDrop = (acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
    setError(null);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleFieldsExtracted = (fields: FormField[]) => {
    setExtractedFields(fields);
  };

  const handleProcessingError = (error: string) => {
    setError(error);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please select at least one file to upload');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `documents/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('legal-documents')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Store document metadata and extracted fields
        const { error: metadataError } = await supabase
          .from('document_metadata')
          .insert({
            file_name: file.name,
            file_path: filePath,
            file_type: file.type,
            extracted_fields: extractedFields,
            field_mappings: mappedFields,
            status: 'processed'
          });

        if (metadataError) throw metadataError;
      }

      setSuccess(true);
      setFiles([]);
      setExtractedFields([]);
      setMappedFields({});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error uploading documents');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800">Document Upload</h2>
          <p className="mt-2 text-gray-600">
            Upload legal documents for AI-powered field extraction
          </p>
        </div>

        <div className="p-6 space-y-6">
          <FileUploadZone
            onDrop={handleFileDrop}
            accept={ACCEPTED_FILE_TYPES}
          />

          {files.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Documents</h3>
              <div className="grid gap-4">
                {files.map((file, index) => (
                  <div key={index} className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FileType className="w-6 h-6 text-blue-500" />
                        <span className="text-sm font-medium text-gray-900">
                          {file.name}
                        </span>
                        <span className="text-sm text-gray-500">
                          ({Math.round(file.size / 1024)} KB)
                        </span>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <AIDocumentProcessor
                      file={file}
                      onProcessed={handleFieldsExtracted}
                      onError={handleProcessingError}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {extractedFields.length > 0 && (
            <FieldMapping
              onFieldsMapped={setMappedFields}
              extractedFields={extractedFields}
            />
          )}

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <X className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FileCheck className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    Documents processed and uploaded successfully!
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={handleUpload}
              disabled={uploading || files.length === 0}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {uploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  <span>Upload Documents</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};