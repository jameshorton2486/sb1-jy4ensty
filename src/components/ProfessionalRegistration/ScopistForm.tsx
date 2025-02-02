import React, { useState } from 'react';
import { Save, Phone } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../lib/database.types';

type ScopistDetails = {
  software_proficiency: string[];
  specializations: string[];
  experience_years: number;
  average_turnaround_time: string;
  rush_availability: boolean;
  proofreading_offered: boolean;
  medical_terminology_certified: boolean;
  legal_terminology_certified: boolean;
  technical_terminology_certified: boolean;
  standard_rates: Record<string, number>;
  rush_rates: Record<string, number>;
  minimum_page_rate: number;
  preferred_file_formats: string[];
};

export const ScopistForm: React.FC = () => {
  const [formData, setFormData] = useState({
    // Personal Information
    first_name: '',
    middle_name: '',
    last_name: '',
    email: '',
    phone_country: '+1', // Default to US
    phone_number: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'United States',
    
    // Emergency Contact
    emergency_contact: {
      name: '',
      relationship: '',
      phone_country: '+1',
      phone: ''
    },

    // Professional Details
    software_proficiency: [''],
    specializations: [''],
    experience_years: '',
    average_turnaround_time: '',
    rush_availability: true,
    proofreading_offered: true,
    medical_terminology_certified: false,
    legal_terminology_certified: false,
    technical_terminology_certified: false,
    standard_rates: {
      regular: '',
      medical: '',
      technical: ''
    },
    rush_rates: {
      regular: '',
      medical: '',
      technical: ''
    },
    minimum_page_rate: '',
    preferred_file_formats: [''],
    
    // Additional Information
    languages: [''],
    time_zone: '',
    availability: {
      weekdays: true,
      weekends: false,
      holidays: false
    },
    terms_accepted: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No authenticated user found');
      }

      // Create professional record
      const professionalData = {
        user_id: user.id,
        type: 'scopist' as const,
        first_name: formData.first_name,
        middle_name: formData.middle_name || null,
        last_name: formData.last_name,
        email: formData.email,
        phone_mobile: `${formData.phone_country}${formData.phone_number}`,
        emergency_contact_info: {
          name: formData.emergency_contact.name,
          relationship: formData.emergency_contact.relationship,
          phone: `${formData.emergency_contact.phone_country}${formData.emergency_contact.phone}`
        }
      };

      const { data: professional, error: professionalError } = await supabase
        .from('legal_professionals')
        .insert(professionalData)
        .select()
        .single();

      if (professionalError) throw professionalError;

      // Create scopist profile
      const scopistDetails: ScopistDetails = {
        software_proficiency: formData.software_proficiency.filter(Boolean),
        specializations: formData.specializations.filter(Boolean),
        experience_years: parseInt(formData.experience_years),
        average_turnaround_time: formData.average_turnaround_time,
        rush_availability: formData.rush_availability,
        proofreading_offered: formData.proofreading_offered,
        medical_terminology_certified: formData.medical_terminology_certified,
        legal_terminology_certified: formData.legal_terminology_certified,
        technical_terminology_certified: formData.technical_terminology_certified,
        standard_rates: {
          regular: parseFloat(formData.standard_rates.regular),
          medical: parseFloat(formData.standard_rates.medical),
          technical: parseFloat(formData.standard_rates.technical)
        },
        rush_rates: {
          regular: parseFloat(formData.rush_rates.regular),
          medical: parseFloat(formData.rush_rates.medical),
          technical: parseFloat(formData.rush_rates.technical)
        },
        minimum_page_rate: parseFloat(formData.minimum_page_rate),
        preferred_file_formats: formData.preferred_file_formats.filter(Boolean)
      };

      const { error: detailsError } = await supabase
        .from('scopist_profiles')
        .insert({
          professional_id: professional.id,
          ...scopistDetails
        });

      if (detailsError) throw detailsError;

      // Reset form
      setFormData({
        first_name: '',
        middle_name: '',
        last_name: '',
        email: '',
        phone_country: '+1',
        phone_number: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'United States',
        emergency_contact: {
          name: '',
          relationship: '',
          phone_country: '+1',
          phone: ''
        },
        software_proficiency: [''],
        specializations: [''],
        experience_years: '',
        average_turnaround_time: '',
        rush_availability: true,
        proofreading_offered: true,
        medical_terminology_certified: false,
        legal_terminology_certified: false,
        technical_terminology_certified: false,
        standard_rates: {
          regular: '',
          medical: '',
          technical: ''
        },
        rush_rates: {
          regular: '',
          medical: '',
          technical: ''
        },
        minimum_page_rate: '',
        preferred_file_formats: [''],
        languages: [''],
        time_zone: '',
        availability: {
          weekdays: true,
          weekends: false,
          holidays: false
        },
        terms_accepted: false
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during registration');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArrayChange = (field: 'software_proficiency' | 'specializations' | 'preferred_file_formats' | 'languages', index: number, value: string) => {
    setFormData(prev => {
      const newArray = [...prev[field]];
      newArray[index] = value;
      return { ...prev, [field]: newArray };
    });
  };

  const addArrayItem = (field: 'software_proficiency' | 'specializations' | 'preferred_file_formats' | 'languages') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Personal Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.first_name}
              onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Middle Name
            </label>
            <input
              type="text"
              value={formData.middle_name}
              onChange={(e) => setFormData(prev => ({ ...prev, middle_name: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.last_name}
              onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 flex">
              <select
                value={formData.phone_country}
                onChange={(e) => setFormData(prev => ({ ...prev, phone_country: e.target.value }))}
                className="rounded-l-md border-r-0 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="+1">+1 (US/CA)</option>
                <option value="+44">+44 (UK)</option>
                <option value="+61">+61 (AU)</option>
                <option value="+64">+64 (NZ)</option>
                {/* Add more country codes as needed */}
              </select>
              <input
                type="tel"
                required
                value={formData.phone_number}
                onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                className="flex-1 rounded-r-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="(555) 123-4567"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Address Line 1 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.address_line1}
              onChange={(e) => setFormData(prev => ({ ...prev, address_line1: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Address Line 2
            </label>
            <input
              type="text"
              value={formData.address_line2}
              onChange={(e) => setFormData(prev => ({ ...prev, address_line2: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                State/Province <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.state}
                onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Postal Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.postal_code}
                onChange={(e) => setFormData(prev => ({ ...prev, postal_code: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Country <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.country}
                onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="United States">United States</option>
                <option value="Canada">Canada</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Australia">Australia</option>
                <option value="New Zealand">New Zealand</option>
                {/* Add more countries as needed */}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900">Professional Information</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Software Proficiency <span className="text-red-500">*</span>
          </label>
          {formData.software_proficiency.map((software, index) => (
            <div key={index} className="mt-1 flex space-x-2">
              <input
                type="text"
                required
                value={software}
                onChange={(e) => handleArrayChange('software_proficiency', index, e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., Case CATalyst, Eclipse"
              />
              {index === formData.software_proficiency.length - 1 && (
                <button
                  type="button"
                  onClick={() => addArrayItem('software_proficiency')}
                  className="px-3 py-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
                >
                  +
                </button>
              )}
            </div>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Specializations <span className="text-red-500">*</span>
          </label>
          {formData.specializations.map((specialization, index) => (
            <div key={index} className="mt-1 flex space-x-2">
              <input
                type="text"
                required
                value={specialization}
                onChange={(e) => handleArrayChange('specializations', index, e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., Medical, Legal, Technical"
              />
              {index === formData.specializations.length - 1 && (
                <button
                  type="button"
                  onClick={() => addArrayItem('specializations')}
                  className="px-3 py-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
                >
                  +
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Years of Experience <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              min="0"
              value={formData.experience_years}
              onChange={(e) => setFormData(prev => ({ ...prev, experience_years: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Average Turnaround Time <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.average_turnaround_time}
              onChange={(e) => setFormData(prev => ({ ...prev, average_turnaround_time: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g., 24 hours"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.rush_availability}
              onChange={(e) => setFormData(prev => ({ ...prev, rush_availability: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Available for Rush Jobs
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.proofreading_offered}
              onChange={(e) => setFormData(prev => ({ ...prev, proofreading_offered: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Proofreading Services
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.medical_terminology_certified}
              onChange={(e) => setFormData(prev => ({ ...prev, medical_terminology_certified: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Medical Terminology Certified
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.legal_terminology_certified}
              onChange={(e) => setFormData(prev => ({ ...prev, legal_terminology_certified: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Legal Terminology Certified
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.technical_terminology_certified}
              onChange={(e) => setFormData(prev => ({ ...prev, technical_terminology_certified: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Technical Terminology Certified
            </label>
          </div>
        </div>
      </div>

      {/* Rates Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900">Rates Information</h3>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700">Standard Rates (per page)</h4>
            
            <div>
              <label className="block text-sm text-gray-600">Regular</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.standard_rates.regular}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    standard_rates: { ...prev.standard_rates, regular: e.target.value }
                  }))}
                  className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600">Medical</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.standard_rates.medical}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    standard_rates: { ...prev.standard_rates, medical: e.target.value }
                  }))}
                  className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600">Technical</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.standard_rates.technical}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    standard_rates: { ...prev.standard_rates, technical: e.target.value }
                  }))}
                  className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700">Rush Rates (per page)</h4>
            
            <div>
              <label className="block text-sm text-gray-600">Regular</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.rush_rates.regular}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    rush_rates: { ...prev.rush_rates, regular: e.target.value }
                  }))}
                  className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600">Medical</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.rush_rates.medical}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    rush_rates: { ...prev.rush_rates, medical: e.target.value }
                  }))}
                  className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600">Technical</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.rush_rates.technical}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    rush_rates: { ...prev.rush_rates, technical: e.target.value }
                  }))}
                  className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Minimum Page Rate <span className="text-red-500">*</span>
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              step="0.01"
              required
              value={formData.minimum_page_rate}
              onChange={(e) => setFormData(prev => ({ ...prev, minimum_page_rate: e.target.value }))}
              className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* File Formats */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900">Preferred File Formats</h3>

        {formData.preferred_file_formats.map((format, index) => (
          <div key={index} className="mt-1 flex space-x-2">
            <input
              type="text"
              required
              value={format}
              onChange={(e) => handleArrayChange('preferred_file_formats', index, e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g., ASCII, RTF, PDF"
            />
            {index === formData.preferred_file_formats.length - 1 && (
              <button
                type="button"
                onClick={() => addArrayItem('preferred_file_formats')}
                className="px-3 py-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
              >
                +
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Languages */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900">Languages</h3>

        {formData.languages.map((language, index) => (
          <div key={index} className="mt-1 flex space-x-2">
            <input
              type="text"
              value={language}
              onChange={(e) => handleArrayChange('languages', index, e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g., English, Spanish"
            />
            {index === formData.languages.length - 1 && (
              <button
                type="button"
                onClick={() => addArrayItem('languages')}
                className="px-3 py-2 bg-blue-100 text-blue-600 className="px-3 py-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
              >
                +
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Availability */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900">Availability</h3>

        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.availability.weekdays}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                availability: { ...prev.availability, weekdays: e.target.checked }
              }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Available on Weekdays
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.availability.weekends}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                availability: { ...prev.availability, weekends: e.target.checked }
              }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Available on Weekends
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.availability.holidays}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                availability: { ...prev.availability, holidays: e.target.checked }
              }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Available on Holidays
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Time Zone <span className="text-red-500">*</span>
          </label>
          <select
            required
            value={formData.time_zone}
            onChange={(e) => setFormData(prev => ({ ...prev, time_zone: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select Time Zone</option>
            <option value="America/New_York">Eastern Time (ET)</option>
            <option value="America/Chicago">Central Time (CT)</option>
            <option value="America/Denver">Mountain Time (MT)</option>
            <option value="America/Los_Angeles">Pacific Time (PT)</option>
            <option value="America/Anchorage">Alaska Time (AKT)</option>
            <option value="Pacific/Honolulu">Hawaii Time (HT)</option>
          </select>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="space-y-4">
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              type="checkbox"
              required
              checked={formData.terms_accepted}
              onChange={(e) => setFormData(prev => ({ ...prev, terms_accepted: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label className="font-medium text-gray-700">
              I accept the terms and conditions <span className="text-red-500">*</span>
            </label>
            <p className="text-gray-500">
              By selecting this, you agree to our{' '}
              <a href="#" className="text-blue-600 hover:text-blue-500">
                Privacy Policy
              </a>{' '}
              and{' '}
              <a href="#" className="text-blue-600 hover:text-blue-500">
                Terms of Service
              </a>
              .
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400">❌</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" />
              Register as Scopist
            </>
          )}
        </button>
      </div>
    </form>
  );
};