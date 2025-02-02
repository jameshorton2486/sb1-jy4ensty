import React, { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';

interface FieldMappingProps {
  onFieldsMapped: (mappings: Record<string, string>) => void;
  documentTypes: string[];
}

const AVAILABLE_FIELDS = [
  { id: 'name', label: 'Full Name' },
  { id: 'email', label: 'Email Address' },
  { id: 'phone', label: 'Phone Number' },
  { id: 'address', label: 'Address' },
  { id: 'barNumber', label: 'Bar Number' },
  { id: 'firmName', label: 'Law Firm Name' },
  { id: 'practiceAreas', label: 'Practice Areas' },
  { id: 'courtLocations', label: 'Court Locations' }
];

export const FieldMapping: React.FC<FieldMappingProps> = ({
  onFieldsMapped,
  documentTypes
}) => {
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [extractedFields, setExtractedFields] = useState<string[]>([]);

  useEffect(() => {
    // Simulate field extraction based on document types
    // In a real application, this would analyze the documents
    const simulatedFields = ['Full Name', 'Email', 'Phone', 'Address'];
    setExtractedFields(simulatedFields);
  }, [documentTypes]);

  const handleMappingChange = (fieldId: string, extractedField: string) => {
    const newMappings = { ...mappings, [fieldId]: extractedField };
    setMappings(newMappings);
    onFieldsMapped(newMappings);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Settings className="w-5 h-5 text-gray-400" />
        <h3 className="text-lg font-medium text-gray-900">Field Mapping</h3>
      </div>

      <div className="grid gap-4">
        {AVAILABLE_FIELDS.map(field => (
          <div key={field.id} className="flex items-center space-x-4">
            <label className="w-1/3 text-sm font-medium text-gray-700">
              {field.label}
            </label>
            <select
              value={mappings[field.id] || ''}
              onChange={(e) => handleMappingChange(field.id, e.target.value)}
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select field</option>
              {extractedFields.map(extractedField => (
                <option key={extractedField} value={extractedField}>
                  {extractedField}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      <p className="text-sm text-gray-500">
        Map the extracted fields from your documents to the corresponding form fields
      </p>
    </div>
  );
};