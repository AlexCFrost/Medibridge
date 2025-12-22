'use client';

import { useState, useEffect } from 'react';

export default function DisclaimerModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show modal on every page load/refresh
    setIsOpen(true);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
        <div className="flex items-start gap-3 mb-4">
          <svg className="w-8 h-8 text-black flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-black mb-2">
              Educational Tool Only – Not Medical Advice
            </h2>
            <div className="text-gray-700 space-y-3">
              <p>
                MediBridge is designed solely for <strong>educational purposes</strong> to help you understand medical terminology and reports.
              </p>
              <p className="font-semibold text-black">
                This application does NOT provide:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Medical advice</li>
                <li>Medical diagnosis</li>
                <li>Treatment recommendations</li>
              </ul>
              <p className="text-sm bg-blue-50 border border-blue-200 rounded p-3">
                <strong>Important:</strong> Always consult qualified healthcare professionals for medical decisions and interpretations of your health information.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={() => setIsOpen(false)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}
