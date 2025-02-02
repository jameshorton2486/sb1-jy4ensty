export interface AttorneyDetails {
  name: string;
  email: string;
  firmName: string;
  firmAddress: string;
  firmContact: string;
}

export interface DepositionData {
  causeNumber: string;
  caseName: string;
  deponentName: string;
  depositionDate: string;
  depositionTime: string;
  depositionLocation: string;
  depositionType: 'in-person' | 'virtual' | 'hybrid';
}

export interface LegalDocumentData {
  attorney: AttorneyDetails;
  deposition: DepositionData;
}

export const initialLegalDocumentData: LegalDocumentData = {
  attorney: {
    name: 'John Doe', // Auto-filled mock data
    email: 'john.doe@lawfirm.com',
    firmName: 'Law Firm LLC',
    firmAddress: '123 Legal Street, City, State 12345',
    firmContact: '(555) 123-4567'
  },
  deposition: {
    causeNumber: '',
    caseName: '',
    deponentName: '',
    depositionDate: '',
    depositionTime: '',
    depositionLocation: '',
    depositionType: 'in-person'
  }
};