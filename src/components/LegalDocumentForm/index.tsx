import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { FormSection } from './FormSection';
import { FormInput } from './FormInput';
import type { Database } from '../../lib/database.types';
import { supabase } from '../../lib/supabase';

type Attorney = Database['public']['Tables']['attorneys']['Row'];
type DepositionInsert = Database['public']['Tables']['depositions']['Insert'];

interface LegalDocumentFormProps {
  attorney: Attorney | null;
}

export const LegalDocumentForm: React.FC<LegalDocumentFormProps> = ({ attorney }) => {
  const [formData, setFormData] = useState<Omit<DepositionInsert, 'attorney_id'>>({
    cause_number: '',
    case_name: '',
    deponent_name: '',
    deposition_date: '',
    deposition_time: '',
    deposition_location: '',
    deposition_type: 'in-person'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleDepositionChange = <K extends keyof typeof formData>(
    field: K,
    value: typeof formData[K]
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attorney) {
      setError('No attorney information available');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const { error: insertError } = await supabase
        .from('depositions')
        .insert({
          ...formData,
          attorney_id: attorney.id
        });

      if (insertError) throw insertError;

      setSuccess(true);
      setFormData({
        cause_number: '',
        case_name: '',
        deponent_name: '',
        deposition_date: '',
        deposition_time: '',
        deposition_location: '',
        deposition_type: 'in-person'
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to schedule deposition');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!attorney) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-yellow-400">⚠️</span>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              Please sign in to access the deposition scheduling form.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-lg shadow-lg">
      <FormSection title="Attorney and Law Firm Details">
        <div className="grid grid-cols-1 gap-4 bg-gray-50 p-4 rounded-md">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">Attorney Name</span>
            <span className="text-sm text-gray-900">{attorney.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">Email</span>
            <span className="text-sm text-gray-900">{attorney.email}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">Law Firm</span>
            <span className="text-sm text-gray-900">{attorney.firm_name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">Firm Address</span>
            <span className="text-sm text-gray-900">{attorney.firm_address}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">Contact Number</span>
            <span className="text-sm text-gray-900">{attorney.firm_contact}</span>
          </div>
        </div>
      </FormSection>

      <FormSection title="Deposition Details">
        <div className="space-y-4">
          <FormInput
            label="Cause Number"
            value={formData.cause_number}
            onChange={(value) => handleDepositionChange('cause_number', value)}
            placeholder="e.g., 153-343987-23312175_Amended NOD"
            required
          />
          
          <FormInput
            label="Case Name"
            value={formData.case_name}
            onChange={(value) => handleDepositionChange('case_name', value)}
            placeholder="e.g., Jack Emil Massad v. Quang Triet Ly312279_Def NOD"
            required
          />

          <FormInput
            label="Deponent's Name"
            value={formData.deponent_name}
            onChange={(value) => handleDepositionChange('deponent_name', value)}
            placeholder="Full name of the person being deposed"
            required
          />

          <FormInput
            label="Date of Deposition"
            type="date"
            value={formData.deposition_date}
            onChange={(value) => handleDepositionChange('deposition_date', value)}
            required
          />

          <FormInput
            label="Time of Deposition"
            type="time"
            value={formData.deposition_time}
            onChange={(value) => handleDepositionChange('deposition_time', value)}
            required
          />

          <FormInput
            label="Deposition Location"
            value={formData.deposition_location}
            onChange={(value) => handleDepositionChange('deposition_location', value)}
            placeholder="Physical address or 'Zoom Meeting'"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type of Deposition
            </label>
            <select
              value={formData.deposition_type}
              onChange={(e) => handleDepositionChange('deposition_type', e.target.value as DepositionInsert['deposition_type'])}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="in-person">In-person</option>
              <option value="virtual">Virtual (Zoom)</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
        </div>
      </FormSection>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400">❌</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-green-400">✓</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                Deposition scheduled successfully!
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="pt-6">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center items-center space-x-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>Schedule Deposition</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};