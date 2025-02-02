import React from 'react';
import { TemplateField, DataMapping } from '../types';

interface MappingConfigProps {
  csvColumns: string[];
  templateFields: TemplateField[];
  mappings: DataMapping[];
  onMappingChange: (mappings: DataMapping[]) => void;
}

export const MappingConfig: React.FC<MappingConfigProps> = ({
  csvColumns,
  templateFields,
  mappings,
  onMappingChange,
}) => {
  const handleMappingChange = (templateFieldId: string, csvColumn: string) => {
    const newMappings = [...mappings];
    const existingIndex = newMappings.findIndex(
      (m) => m.templateField === templateFieldId
    );

    if (existingIndex >= 0) {
      newMappings[existingIndex].csvColumn = csvColumn;
    } else {
      newMappings.push({
        templateField: templateFieldId,
        csvColumn,
      });
    }

    onMappingChange(newMappings);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Map CSV Columns to Template Fields</h3>
      {templateFields.map((field) => (
        <div key={field.id} className="flex items-center space-x-4">
          <span className="w-1/3">{field.name}</span>
          <select
            className="flex-1 p-2 border rounded-md"
            value={
              mappings.find((m) => m.templateField === field.id)?.csvColumn || ''
            }
            onChange={(e) => handleMappingChange(field.id, e.target.value)}
          >
            <option value="">Select CSV column</option>
            {csvColumns.map((column) => (
              <option key={column} value={column}>
                {column}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
};