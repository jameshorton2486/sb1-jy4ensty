import React from 'react';
import { FileText } from 'lucide-react';

interface DocumentPreviewProps {
  file: File;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({ file }) => {
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="flex items-start space-x-4">
        <div className="p-2 bg-white rounded-md shadow-sm">
          <FileText className="w-8 h-8 text-blue-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {file.name}
          </p>
          <p className="text-sm text-gray-500">
            {file.type || 'Unknown type'} • {Math.round(file.size / 1024)} KB
          </p>
        </div>
      </div>
    </div>
  );
};