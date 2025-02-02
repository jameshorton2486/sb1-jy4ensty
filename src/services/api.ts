import { AuthState } from './auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface GenerateDocumentsResponse {
  success: boolean;
  results: Array<{
    success: boolean;
    documentId?: string;
    name?: string;
    error?: string;
  }>;
}

export const generateDocuments = async (
  auth: AuthState,
  mappings: any[],
  csvData: any[],
  templateId: string
): Promise<GenerateDocumentsResponse> => {
  try {
    const response = await fetch(`${API_URL}/api/generate-documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.accessToken}`
      },
      body: JSON.stringify({
        mappings,
        csvData,
        templateId
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate documents');
    }

    return await response.json();
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};