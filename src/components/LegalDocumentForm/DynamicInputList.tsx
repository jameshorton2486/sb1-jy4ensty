import React from 'react';
import { Plus } from 'lucide-react';

interface DynamicInputListProps {
  label: string;
  values: string[];
  onChange: (index: number, value: string) => void;
  onAdd: () => void;
}

export const DynamicInputList: React.FC<DynamicInputListProps> = ({
  label,
  values,
  onChange,
  onAdd,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {values.map((value, index) => (
        <div key={index} className="mt-1 flex space-x-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(index, e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {index === values.length - 1 && (
            <button
              type="button"
              onClick={onAdd}
              className="p-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};