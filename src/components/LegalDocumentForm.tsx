import React, { useState } from 'react';
import { Save } from 'lucide-react';

interface LegalDocumentData {
  caseNumber: string;
  caseStyle: string;
  court: string;
  causeNumber: string;
  deponentName: string;
  deponentType: 'plaintiff' | 'defendant' | 'witness' | 'expert';
  depositionDate: string;
  depositionTime: string;
  depositionLocation: string;
  attorneys: {
    plaintiffs: string[];
    defendants: string[];
  };
  witnesses: string[];
  courtReporter: string;
  notaryExpiration: string;
}

interface LegalDocumentFormProps {
  onSubmit: (data: LegalDocumentData) => void;
}

export const LegalDocumentForm: React.FC<LegalDocumentFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<LegalDocumentData>({
    caseNumber: '',
    caseStyle: '',
    court: '',
    causeNumber: '',
    deponentName: '',
    deponentType: 'witness',
    depositionDate: '',
    depositionTime: '',
    depositionLocation: '',
    attorneys: {
      plaintiffs: [''],
      defendants: ['']
    },
    witnesses: [''],
    courtReporter: '',
    notaryExpiration: ''
  });

  const handleChange = (field: keyof LegalDocumentData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: 'plaintiffs' | 'defendants' | 'witnesses', index: number, value: string) => {
    setFormData(prev => {
      if (field === 'witnesses') {
        const newWitnesses = [...prev.witnesses];
        newWitnesses[index] = value;
        return { ...prev, witnesses: newWitnesses };
      } else {
        const newAttorneys = { ...prev.attorneys };
        newAttorneys[field][index] = value;
        return { ...prev, attorneys: newAttorneys };
      }
    });
  };

  const addArrayItem = (field: 'plaintiffs' | 'defendants' | 'witnesses') => {
    setFormData(prev => {
      if (field === 'witnesses') {
        return { ...prev, witnesses: [...prev.witnesses, ''] };
      } else {
        return {
          ...prev,
          attorneys: {
            ...prev.attorneys,
            [field]: [...prev.attorneys[field], '']
          }
        };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Case Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Case Information</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Case Number</label>
            <input
              type="text"
              value={formData.caseNumber}
              onChange={(e) => handleChange('caseNumber', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Case Style</label>
            <input
              type="text"
              value={formData.caseStyle}
              onChange={(e) => handleChange('caseStyle', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Court</label>
            <input
              type="text"
              value={formData.court}
              onChange={(e) => handleChange('court', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Cause Number</label>
            <input
              type="text"
              value={formData.causeNumber}
              onChange={(e) => handleChange('causeNumber', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Deposition Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Deposition Information</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Deponent Name</label>
            <input
              type="text"
              value={formData.deponentName}
              onChange={(e) => handleChange('deponentName', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Deponent Type</label>
            <select
              value={formData.deponentType}
              onChange={(e) => handleChange('deponentType', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="plaintiff">Plaintiff</option>
              <option value="defendant">Defendant</option>
              <option value="witness">Witness</option>
              <option value="expert">Expert</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Deposition Date</label>
            <input
              type="date"
              value={formData.depositionDate}
              onChange={(e) => handleChange('depositionDate', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Deposition Time</label>
            <input
              type="time"
              value={formData.depositionTime}
              onChange={(e) => handleChange('depositionTime', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Deposition Location</label>
            <input
              type="text"
              value={formData.depositionLocation}
              onChange={(e) => handleChange('depositionLocation', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Attorneys */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Attorneys</h3>
        
        {/* Plaintiff Attorneys */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Plaintiff Attorneys</label>
          {formData.attorneys.plaintiffs.map((attorney, index) => (
            <div key={index} className="mt-1 flex space-x-2">
              <input
                type="text"
                value={attorney}
                onChange={(e) => handleArrayChange('plaintiffs', index, e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {index === formData.attorneys.plaintiffs.length - 1 && (
                <button
                  type="button"
                  onClick={() => addArrayItem('plaintiffs')}
                  className="px-3 py-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
                >
                  +
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Defendant Attorneys */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Defendant Attorneys</label>
          {formData.attorneys.defendants.map((attorney, index) => (
            <div key={index} className="mt-1 flex space-x-2">
              <input
                type="text"
                value={attorney}
                onChange={(e) => handleArrayChange('defendants', index, e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {index === formData.attorneys.defendants.length - 1 && (
                <button
                  type="button"
                  onClick={() => addArrayItem('defendants')}
                  className="px-3 py-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
                >
                  +
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Witnesses */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Witnesses</h3>
        {formData.witnesses.map((witness, index) => (
          <div key={index} className="mt-1 flex space-x-2">
            <input
              type="text"
              value={witness}
              onChange={(e) => handleArrayChange('witnesses', index, e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {index === formData.witnesses.length - 1 && (
              <button
                type="button"
                onClick={() => addArrayItem('witnesses')}
                className="px-3 py-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
              >
                +
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Court Reporter Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Court Reporter Information</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Court Reporter Name</label>
          <input
            type="text"
            value={formData.courtReporter}
            onChange={(e) => handleChange('courtReporter', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Notary Expiration Date</label>
          <input
            type="date"
            value={formData.notaryExpiration}
            onChange={(e) => handleChange('notaryExpiration', e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          className="w-full flex justify-center items-center space-x-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Save className="w-4 h-4" />
          <span>Save Document Information</span>
        </button>
      </div>
    </form>
  );
};