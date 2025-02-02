import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../lib/database.types';

type InterpreterDetails = {
  primary_languages: string[];
  secondary_languages: string[];
  language_pairs: Array<{
    source: string;
    target: string;
  }>;
  certification_type: string;
  certification_number: string;
  certification_expiry: string;
  court_certified: boolean;
  medical_certified: boolean;
  conference_certified: boolean;
  specializations: string[];
  subject_matter_expertise: string[];
  interpretation_types: string[];
  remote_services_offered: boolean;
  equipment_provided: boolean;
  minimum_booking_duration: string;
  travel_radius: number;
  standard_rates: Record<string, number>;
  rush_rates: Record<string, number>;
  cancellation_policy: string;
  availability_schedule: Record<string, boolean>;
  professional_memberships: string[];
  insurance_information: {
    provider: string;
    policy_number: string;
    coverage_amount: number;
    expiry_date: string;
  };
};

export const InterpreterForm: React.FC = () => {
  const [formData, setFormData] = useState({
    // Personal Information
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
    
    // Emergency Contact
    emergency_contact: {
      name: '',
      relationship: '',
      phone_country: '+1',
      phone: ''
    },

    // Professional Details
    primary_languages: [''],
    secondary_languages: [''],
    language_pairs: [{ source: '', target: '' }],
    certification_type: '',
    certification_number: '',
    certification_expiry: '',
    court_certified: false,
    medical_certified: false,
    conference_certified: false,
    specializations: [''],
    subject_matter_expertise: [''],
    interpretation_types: [],
    remote_services_offered: true,
    equipment_provided: false,
    minimum_booking_duration: '1',
    travel_radius: 50,
    standard_rates: {
      hourly: '',
      daily: '',
      halfday: ''
    },
    rush_rates: {
      hourly: '',
      daily: '',
      halfday: ''
    },
    cancellation_policy: '',
    availability_schedule: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false
    },
    professional_memberships: [''],
    insurance_information: {
      provider: '',
      policy_number: '',
      coverage_amount: '',
      expiry_date: ''
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
        type: 'interpreter' as const,
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

      // Create interpreter profile
      const interpreterDetails: InterpreterDetails = {
        primary_languages: formData.primary_languages.filter(Boolean),
        secondary_languages: formData.secondary_languages.filter(Boolean),
        language_pairs: formData.language_pairs.filter(pair => pair.source && pair.target),
        certification_type: formData.certification_type,
        certification_number: formData.certification_number,
        certification_expiry: formData.certification_expiry,
        court_certified: formData.court_certified,
        medical_certified: formData.medical_certified,
        conference_certified: formData.conference_certified,
        specializations: formData.specializations.filter(Boolean),
        subject_matter_expertise: formData.subject_matter_expertise.filter(Boolean),
        interpretation_types: formData.interpretation_types,
        remote_services_offered: formData.remote_services_offered,
        equipment_provided: formData.equipment_provided,
        minimum_booking_duration: formData.minimum_booking_duration,
        travel_radius: parseInt(formData.travel_radius.toString()),
        standard_rates: {
          hourly: parseFloat(formData.standard_rates.hourly),
          daily: parseFloat(formData.standard_rates.daily),
          halfday: parseFloat(formData.standard_rates.halfday)
        },
        rush_rates: {
          hourly: parseFloat(formData.rush_rates.hourly),
          daily: parseFloat(formData.rush_rates.daily),
          halfday: parseFloat(formData.rush_rates.halfday)
        },
        cancellation_policy: formData.cancellation_policy,
        availability_schedule: formData.availability_schedule,
        professional_memberships: formData.professional_memberships.filter(Boolean),
        insurance_information: {
          provider: formData.insurance_information.provider,
          policy_number: formData.insurance_information.policy_number,
          coverage_amount: parseFloat(formData.insurance_information.coverage_amount),
          expiry_date: formData.insurance_information.expiry_date
        }
      };

      const { error: detailsError } = await supabase
        .from('interpreter_profiles')
        .insert({
          professional_id: professional.id,
          ...interpreterDetails
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
        primary_languages: [''],
        secondary_languages: [''],
        language_pairs: [{ source: '', target: '' }],
        certification_type: '',
        certification_number: '',
        certification_expiry: '',
        court_certified: false,
        medical_certified: false,
        conference_certified: false,
        specializations: [''],
        subject_matter_expertise: [''],
        interpretation_types: [],
        remote_services_offered: true,
        equipment_provided: false,
        minimum_booking_duration: '1',
        travel_radius: 50,
        standard_rates: {
          hourly: '',
          daily: '',
          halfday: ''
        },
        rush_rates: {
          hourly: '',
          daily: '',
          halfday: ''
        },
        cancellation_policy: '',
        availability_schedule: {
          monday: true,
          tuesday: true,
          wednesday: true,
          thursday: true,
          friday: true,
          saturday: false,
          sunday: false
        },
        professional_memberships: [''],
        insurance_information: {
          provider: '',
          policy_number: '',
          coverage_amount: '',
          expiry_date: ''
        },
        terms_accepted: false
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during registration');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArrayChange = (field: 'primary_languages' | 'secondary_languages' | 'specializations' | 'subject_matter_expertise' | 'professional_memberships', index: number, value: string) => {
    setFormData(prev => {
      const newArray = [...prev[field]];
      newArray[index] = value;
      return { ...prev, [field]: newArray };
    });
  };

  const handleLanguagePairChange = (index: number, field: 'source' | 'target', value: string) => {
    setFormData(prev => {
      const newPairs = [...prev.language_pairs];
      newPairs[index] = { ...newPairs[index], [field]: value };
      return { ...prev, language_pairs: newPairs };
    });
  };

  const addArrayItem = (field: 'primary_languages' | 'secondary_languages' | 'specializations' | 'subject_matter_expertise' | 'professional_memberships') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const addLanguagePair = () => {
    setFormData(prev => ({
      ...prev,
      language_pairs: [...prev.language_pairs, { source: '', target: '' }]
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
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Language Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900">Language Information</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Primary Languages <span className="text-red-500">*</span>
          </label>
          {formData.primary_languages.map((language, index) => (
            <div key={index} className="mt-1 flex space-x-2">
              <input
                type="text"
                required
                value={language}
                onChange={(e) => handleArrayChange('primary_languages', index, e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., English, Spanish, Mandarin"
              />
              {index === formData.primary_languages.length - 1 && (
                <button
                  type="button"
                  onClick={() => addArrayItem('primary_languages')}
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
            Secondary Languages
          </label>
          {formData.secondary_languages.map((language, index) => (
            <div key={index} className="mt-1 flex space-x-2">
              <input
                type="text"
                value={language}
                onChange={(e) => handleArrayChange('secondary_languages', index, e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., French, German, Italian"
              />
              {index === formData.secondary_languages.length - 1 && (
                <button
                  type="button"
                  onClick={() => addArrayItem('secondary_languages')}
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
            Language Pairs <span className="text-red-500">*</span>
          </label>
          {formData.language_pairs.map((pair, index) => (
            <div key={index} className="mt-1 flex space-x-2">
              <input
                type="text"
                required
                value={pair.source}
                onChange={(e) => handleLanguagePairChange(index, 'source', e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Source Language"
              />
              <span className="flex items-center">→</span>
              <input
                type="text"
                required
                value={pair.target}
                onChange={(e) => handleLanguagePairChange(index, 'target', e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Target Language"
              />
              {index === formData.language_pairs.length - 1 && (
                <button
                  type="button"
                  onClick={addLanguagePair}
                  className="px-3 py-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
                >
                  +
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Certifications */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900">Certifications</h3>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Certification Type
            </label>
            <input
              type="text"
              value={formData.certification_type}
              onChange={(e) => setFormData(prev => ({ ...prev, certification_type: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Certification Number
            </label>
            <input
              type="text"
              value={formData.certification_number}
              onChange={(e) => setFormData(prev => ({ ...prev, certification_number: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Certification Expiry Date
          </label>
          <input
            type="date"
            value={formData.certification_expiry}
            onChange={(e) => setFormData(prev => ({ ...prev, certification_expiry: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.court_certified}
              onChange={(e) => setFormData(prev => ({ ...prev, court_certified: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Court Certified
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.medical_certified}
              onChange={(e) => setFormData(prev => ({ ...prev, medical_certified: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Medical Certified
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.conference_certified}
              onChange={(e) => setFormData(prev => ({ ...prev, conference_certified: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Conference Certified
            </label>
          </div>
        </div>
      </div>

      {/* Specializations */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900">Specializations</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Specializations
          </label>
          {formData.specializations.map((specialization, index) => (
            <div key={index} className="mt-1 flex space-x-2">
              <input
                type="text"
                value={specialization}
                onChange={(e) => handleArrayChange('specializations', index, e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., Legal, Medical, Technical"
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

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Subject Matter Expertise
          </label>
          {formData.subject_matter_expertise.map((expertise, index) => (
            <div key={index} className="mt-1 flex space-x-2">
              <input
                type="text"
                value={expertise}
                onChange={(e) => handleArrayChange('subject_matter_expertise', index, e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., Immigration Law, Cardiology, Patents"
              />
              {index === formData.subject_matter_expertise.length - 1 && (
                <button
                  type="button"
                  onClick={() => addArrayItem('subject_matter_expertise')}
                  className="px-3 py-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
                >
                  +
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Service Details */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900">Service Details</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Interpretation Types <span className="text-red-500">*</span>
          </label>
          <div className="mt-2 space-y-2">
            {['simultaneous', 'consecutive', 'sight'].map((type) => (
              <div key={type} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.interpretation_types.includes(type)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData(prev => ({
                        ...prev,
                        interpretation_types: [...prev.interpretation_types, type]
                      }));
                    } else {
                      setFormData(prev => ({
                        ...prev,
                        interpretation_types: prev.interpretation_types.filter(t => t !== type)
                      }));
                    }
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700 capitalize">
                  {type}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.remote_services_offered}
              onChange={(e) => setFormData(prev => ({ ...prev, remote_services_offered: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Remote Services Offered
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.equipment_provided}
              onChange={(e) => setFormData(prev => ({ ...prev, equipment_provided: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Equipment Provided
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Minimum Booking Duration (hours) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              min="1"
              value={formData.minimum_booking_duration}
              onChange={(e) => setFormData(prev => ({ ...prev, minimum_booking_duration: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Travel Radius (miles) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              min="0"
              value={formData.travel_radius}
              onChange={(e) => setFormData(prev => ({ ...prev, travel_radius: parseInt(e.target.value) }))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Rates Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900">Rates Information</h3>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700">Standard Rates</h4>
            
            <div>
              <label className="block text-sm text-gray-600">Hourly Rate</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.standard_rates.hourly}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    standard_rates: { ...prev.standard_rates, hourly: e.target.value }
                  }))}
                  className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600">Daily Rate</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.standard_rates.daily}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    standard_rates: { ...prev.standard_rates, daily: e.target.value }
                  }))}
                  className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600">Half-Day Rate</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.standard_rates.halfday}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    standard_rates: { ...prev.standard_rates, halfday: e.target.value }
                  }))}
                  className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700">Rush Rates</h4>
            
            <div>
              <label className="block text-sm text-gray-600">Hourly Rate</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.rush_rates.hourly}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    rush_rates: { ...prev.rush_rates, hourly: e.target.value }
                  }))}
                  className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600">Daily Rate</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.rush_rates.daily}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    rush_rates: { ...prev.rush_rates, daily: e.target.value }
                  }))}
                  className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600">Half-Day Rate</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.rush_rates.halfday}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    rush_rates: { ...prev.rush_rates, halfday: e.target.value }
                  }))}
                  className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Cancellation Policy
          </label>
          <textarea
            value={formData.cancellation_policy}
            onChange={(e) => setFormData(prev => ({ ...prev, cancellation_policy: e.target.value }))}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Describe your cancellation policy"
          />
        </div>
      </div>

      {/* Availability */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900">Availability</h3>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Object.entries(formData.availability_schedule).map(([day, available]) => (
              <div key={day} className="flex items-center">
                <input
                  type="checkbox"
                  checked={available}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    availability_schedule: {
                      ...prev.availability_schedule,
                      [day]: e.target.checked
                    }
                  }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700 capitalize">
                  {day}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Professional Memberships */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900">Professional Memberships</h3>

        {formData.professional_memberships.map((membership, index) => (
          <div key={index} className="mt-1 flex space-x-2">
            <input
              type="text"
              value={membership}
              onChange={(e) => handleArrayChange('professional_memberships', index, e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g., ATA, NAJIT, AIIC"
            />
            {index === formData.professional_memberships.length - 1 && (
              <button
                type="button"
                onClick={() => addArrayItem('professional_memberships')}
                className="px-3 py-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
              >
                +
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Insurance Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900">Insurance Information</h3>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Insurance Provider
            </label>
            <input
              type="text"
              value={formData.insurance_information.provider}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                insurance_information: { ...prev.insurance_information, provider: e.target.value }
              }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Policy Number
            </label>
            <input
              type="text"
              value={formData.insurance_information.policy_number}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                insurance_information: { ...prev.insurance_information, policy_number: e.target.value }
              }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Coverage Amount
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                step="0.01"
                value={formData.insurance_information.coverage_amount}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  insurance_information: { ...prev.insurance_information, coverage_amount: e.target.value }
                }))}
                className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Expiry Date
            </label>
            <input
              type="date"
              value={formData.insurance_information.expiry_date}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                insurance_information: { ...prev.insurance_information, expiry_date: e.target.value }
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
              Register as Interpreter
            </>
          )}
        </button>
      </div>
    </form>
  );
};