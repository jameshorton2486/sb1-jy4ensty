import React from 'react';
import { LogIn } from 'lucide-react';

interface GoogleAuthButtonProps {
  onSignIn: () => void;
  isLoading?: boolean;
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({ 
  onSignIn, 
  isLoading = false 
}) => {
  return (
    <button
      onClick={onSignIn}
      disabled={isLoading}
      className="flex items-center justify-center space-x-2 w-full py-2 px-4 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
      ) : (
        <LogIn className="w-5 h-5 text-gray-600" />
      )}
      <span className="text-gray-700">Sign in with Google</span>
    </button>
  );
};