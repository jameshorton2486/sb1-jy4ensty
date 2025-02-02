import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { AttorneyForm } from './AttorneyForm';
import { CourtReporterForm } from './CourtReporterForm';
import { VideographerForm } from './VideographerForm';
import { ScopistForm } from './ScopistForm';
import type { Database } from '../../lib/database.types';

type ProfessionalType = Database['public']['Tables']['legal_professionals']['Row']['type'];

export const ProfessionalRegistration: React.FC = () => {
  const [selectedType, setSelectedType] = useState<ProfessionalType>('attorney');

  const renderForm = () => {
    switch (selectedType) {
      case 'attorney':
        return <AttorneyForm />;
      case 'court_reporter':
        return <CourtReporterForm />;
      case 'videographer':
        return <VideographerForm />;
      case 'scopist':
        return <ScopistForm />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <UserPlus className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Professional Registration</h2>
          <p className="mt-2 text-sm text-gray-600">
            Register as a legal professional to access our services
          </p>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {(['attorney', 'court_reporter', 'videographer', 'scopist'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    selectedType === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type.split('_').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {renderForm()}
          </div>
        </div>
      </div>
    </div>
  );
};