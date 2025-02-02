import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCOPES = [
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/drive.file'
];

export interface AuthState {
  accessToken: string | null;
  error: string | null;
}

export const initializeGoogleAuth = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google OAuth script'));
    document.body.appendChild(script);
  });
};

export const signIn = async (): Promise<AuthState> => {
  try {
    const client = google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: SCOPES.join(' '),
      callback: (response) => {
        if (response.error) {
          return {
            accessToken: null,
            error: response.error
          };
        }
        return {
          accessToken: response.access_token,
          error: null
        };
      },
    });

    return new Promise((resolve) => {
      client.requestAccessToken();
      client.callback = (response) => {
        resolve({
          accessToken: response.access_token,
          error: null
        });
      };
    });
  } catch (error) {
    return {
      accessToken: null,
      error: error instanceof Error ? error.message : 'Failed to sign in'
    };
  }
};