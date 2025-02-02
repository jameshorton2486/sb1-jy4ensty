import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../lib/database.types';

type AttorneyDetails = {
  bar_number: string;
  practice_areas: string[];
  years_experience: number;
  preferred_courts: string[];
};

export const AttorneyForm: React.FC = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    email: '',
    phone_office: '',
    phone_mobile: '',
    emergency_contact: {
      name: '',
      relationship: '',
      phone: ''
    },
    bar_number: '',
    law_firm: '',
    office_address: '',
    practice_areas: [''],
    years_experience: '',
    preferred_courts: [''],
    payment_methods: [''],
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

      const professionalData = {
        user_id: user.id,
        type: 'attorney' as const,
        first_name: formData.first_name,
        middle_name: formData.middle_name || null,
        last_name: formData.last_name,
        email: formData.email,
        phone_office: formData.phone_office || null,
        phone_mobile: formData.phone_mobile,
        emergency_contact_info: formData.emergency_contact,
        preferred_payment_methods: formData.payment_methods
      };

      const { data: professional, error: professionalError } = await supabase
        .from('legal_professionals')
        .insert(professionalData)
        .select()
        .single();

      if (professionalError) throw professionalError;

      const attorneyDetails: AttorneyDetails = {
        bar_number: formData.bar_number,
        practice_areas: formData.practice_areas.filter(Boolean),
        years_experience: parseInt(formData.years_experience),
        preferred_courts: formData.preferred_courts.filter(Boolean),
      };

      const { error: detailsError } = await supabase
        .from('professional_details')
        .insert({
          professional_id: professional.id,
          details: attorneyDetails
        });

      if (detailsError) throw detailsError;

      // Reset form
      setFormData({
        first_name: '',
        middle_name: '',
        last_name: '',
        email: '',
        phone_office: '',
        phone_mobile: '',
        emergency_contact: {
          name: '',
          relationship: '',
          phone: ''
        },
        bar_number: '',
        law_firm: '',
        office_address: '',
        practice_areas: [''],
        years_experience: '',
        preferred_courts: [''],
        payment_methods: [''],
        terms_accepted: false
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during registration');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArrayChange = (field: 'practice_areas' | 'preferred_courts' | 'payment_methods', index: number, value: string) => {
    setFormData(prev => {
      const newArray = [...prev[field]];
      newArray[index] = value;
      return { ...prev, [field]: newArray };
    });
  };

  const addArrayItem = (field: 'practice_areas' | 'preferred_courts' | 'payment_methods') => {
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
              Mobile Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={formData.phone_mobile}
              onChange={(e) => setFormData(prev => ({ ...prev, phone_mobile: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Professional Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900">Professional Information</h3>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              State Bar Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.bar_number}
              onChange={(e) => setFormData(prev => ({ ...prev, bar_number: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Years of Experience <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              min="0"
              value={formData.years_experience}
              onChange={(e) => setFormData(prev => ({ ...prev, years_experience: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Practice Areas <span className="text-red-500">*</span>
          </label>
          {formData.practice_areas.map((area, index) => (
            <div key={index} className="mt-1 flex space-x-2">
              <input
                type="text"
                required
                value={area}
                onChange={(e) => handleArrayChange('practice_areas', index, e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {index === formData.practice_areas.length - 1 && (
                <button
                  type="button"
                  onClick={() => addArrayItem('practice_areas')}
                  className="px-3 py-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
                >
                  +
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900">Emergency Contact</h3>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.emergency_contact.name}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                emergency_contact: { ...prev.emergency_contact, name: e.target.value }
              }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Relationship <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.emergency_contact.relationship}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                emergency_contact: { ...prev.emergency_contact, relationship: e.target.value }
              }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={formData.emergency_contact.phone}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                emergency_contact: { ...prev.emergency_contact, phone: e.target.value }
              }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
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
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Registration failed
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
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
              Register as Attorney
            </>
          )}
        </button>
      </div>
    </form>
  );
};