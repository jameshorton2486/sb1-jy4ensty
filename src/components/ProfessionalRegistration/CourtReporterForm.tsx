import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../lib/database.types';

type CourtReporterDetails = {
  certification_number: string;
  certification_state: string;
  certification_expiry: string;
  realtime_certified: boolean;
  csr_number: string;
  ncra_member: boolean;
  machine_type: string;
  software_used: string[];
  specializations: string[];
  average_turnaround_time: string;
  rush_availability: boolean;
  daily_availability: Record<string, boolean>;
  travel_radius: number;
  remote_services_offered: boolean;
  standard_rates: Record<string, number>;
  rush_rates: Record<string, number>;
  minimum_notice_period: string;
};

export const CourtReporterForm: React.FC = () => {
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
    certification_number: '',
    certification_state: '',
    certification_expiry: '',
    realtime_certified: false,
    csr_number: '',
    ncra_member: false,
    machine_type: '',
    software_used: [''],
    specializations: [''],
    average_turnaround_time: '',
    rush_availability: true,
    daily_availability: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false
    },
    travel_radius: 50,
    remote_services_offered: true,
    standard_rates: {
      regular: '',
      realtime: '',
      expedited: ''
    },
    rush_rates: {
      regular: '',
      realtime: '',
      expedited: ''
    },
    minimum_notice_period: '24',
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
        type: 'court_reporter' as const,
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

      // Create court reporter profile
      const courtReporterDetails: CourtReporterDetails = {
        certification_number: formData.certification_number,
        certification_state: formData.certification_state,
        certification_expiry: formData.certification_expiry,
        realtime_certified: formData.realtime_certified,
        csr_number: formData.csr_number,
        ncra_member: formData.ncra_member,
        machine_type: formData.machine_type,
        software_used: formData.software_used.filter(Boolean),
        specializations: formData.specializations.filter(Boolean),
        average_turnaround_time: formData.average_turnaround_time,
        rush_availability: formData.rush_availability,
        daily_availability: formData.daily_availability,
        travel_radius: parseInt(formData.travel_radius.toString()),
        remote_services_offered: formData.remote_services_offered,
        standard_rates: {
          regular: parseFloat(formData.standard_rates.regular),
          realtime: parseFloat(formData.standard_rates.realtime),
          expedited: parseFloat(formData.standard_rates.expedited)
        },
        rush_rates: {
          regular: parseFloat(formData.rush_rates.regular),
          realtime: parseFloat(formData.rush_rates.realtime),
          expedited: parseFloat(formData.rush_rates.expedited)
        },
        minimum_notice_period: formData.minimum_notice_period
      };

      const { error: detailsError } = await supabase
        .from('court_reporter_profiles')
        .insert({
          professional_id: professional.id,
          ...courtReporterDetails
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
        certification_number: '',
        certification_state: '',
        certification_expiry: '',
        realtime_certified: false,
        csr_number: '',
        ncra_member: false,
        machine_type: '',
        software_used: [''],
        specializations: [''],
        average_turnaround_time: '',
        rush_availability: true,
        daily_availability: {
          monday: true,
          tuesday: true,
          wednesday: true,
          thursday: true,
          friday: true,
          saturday: false,
          sunday: false
        },
        travel_radius: 50,
        remote_services_offered: true,
        standard_rates: {
          regular: '',
          realtime: '',
          expedited: ''
        },
        rush_rates: {
          regular: '',
          realtime: '',
          expedited: ''
        },
        minimum_notice_period: '24',
        terms_accepted: false
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during registration');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArrayChange = (field: 'software_used' | 'specializations', index: number, value: string) => {
    setFormData(prev => {
      const newArray = [...prev[field]];
      newArray[index] = value;
      return { ...prev, [field]: newArray };
    });
  };

  const addArrayItem = (field: 'software_used' | 'specializations') => {
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

      {/* Professional Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900">Professional Information</h3>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Certification Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.certification_number}
              onChange={(e) => setFormData(prev => ({ ...prev, certification_number: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Certification State <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.certification_state}
              onChange={(e) => setFormData(prev => ({ ...prev, certification_state: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Certification Expiry Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={formData.certification_expiry}
              onChange={(e) => setFormData(prev => ({ ...prev, certification_expiry: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              CSR Number
            </label>
            <input
              type="text"
              value={formData.csr_number}
              onChange={(e) => setFormData(prev => ({ ...prev, csr_number: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.realtime_certified}
              onChange={(e) => setFormData(prev => ({ ...prev, realtime_certified: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Realtime Certified
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.ncra_member}
              onChange={(e) => setFormData(prev => ({ ...prev, ncra_member: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              NCRA Member
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Machine Type <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.machine_type}
            onChange={(e) => setFormData(prev => ({ ...prev, machine_type: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="e.g., Stenograph Luminex"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Software Used <span className="text-red-500">*</span>
          </label>
          {formData.software_used.map((software, index) => (
            <div key={index} className="mt-1 flex space-x-2">
              <input
                type="text"
                required
                value={software}
                onChange={(e) => handleArrayChange('software_used', index, e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., Case CATalyst, Eclipse"
              />
              {index === formData.software_used.length - 1 && (
                <button
                  type="button"
                  onClick={() => addArrayItem('software_used')}
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
            Specializations
          </label>
          {formData.specializations.map((specialization, index) => (
            <div key={index} className="mt-1 flex space-x-2">
              <input
                type="text"
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
              Average Turnaround Time <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.average_turnaround_time}
              onChange={(e) => setFormData(prev => ({ ...prev, average_turnaround_time: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g., 5-7 business days"
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
              onChange={(e) => setFormData(prev => ({ ...prev, travel_radius: parseInt(e.target.value) }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
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
              <label className="block text-sm text-gray-600">Realtime</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.standard_rates.realtime}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    standard_rates: { ...prev.standard_rates, realtime: e.target.value }
                  }))}
                  className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600">Expedited</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.standard_rates.expedited}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    standard_rates: { ...prev.standard_rates, expedited: e.target.value }
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
              <label className="block text-sm text-gray-600">Realtime</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.rush_rates.realtime}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    rush_rates: { ...prev.rush_rates, realtime: e.target.value }
                  }))}
                  className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600">Expedited</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.rush_rates.expedited}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    rush_rates: { ...prev.rush_rates, expedited: e.target.value }
                  }))}
                  className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Availability */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900">Availability</h3>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Object.entries(formData.daily_availability).map(([day, available]) => (
              <div key={day} className="flex items-center">
                <input
                  type="checkbox"
                  checked={available}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    daily_availability: {
                      ...prev.daily_availability,
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

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={form Data.remote_services_offered}
              onChange={(e) => setFormData(prev => ({ ...prev, remote_services_offered: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Available for Remote Services
            </label>
          </div>

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

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Minimum Notice Period (hours) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              min="0"
              value={formData.minimum_notice_period}
              onChange={(e) => setFormData(prev => ({ ...prev, minimum_notice_period: e.target.value }))}
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
              Register as Court Reporter
            </>
          )}
        </button>
      </div>
    </form>
  );
};