import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';

interface FileUploadZoneProps {
  onDrop: (files: File[]) => void;
  accept: Record<string, string[]>;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({ onDrop, accept }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple: true
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
        transition-colors duration-200 ease-in-out
        ${isDragActive 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-300 hover:border-blue-400'
        }
      `}
    >
      <input {...getInputProps()} />
      <Upload className="mx-auto h-12 w-12 text-gray-400" />
      <p className="mt-4 text-lg font-medium text-gray-900">
        {isDragActive ? 'Drop files here' : 'Drag and drop files here'}
      </p>
      <p className="mt-2 text-sm text-gray-500">
        or click to select files from your computer
      </p>
      <p className="mt-1 text-xs text-gray-400">
        Supported formats: PDF, DOC, DOCX, TXT, RTF
      </p>
    </div>
  );
};