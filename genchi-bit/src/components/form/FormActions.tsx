// src/components/form/FormActions.tsx
import React from 'react';

interface FormActionsProps {
  onBack: () => void;
  isSubmitting: boolean;
}

export const FormActions: React.FC<FormActionsProps> = ({ onBack, isSubmitting }) => {
  return (
    <div className="flex justify-between items-center mt-6">
      <button
        type="button"
        onClick={onBack}
        className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
      >
        Volver
      </button>

      <button
        type="submit"
        disabled={isSubmitting}
        className={`px-6 py-2 text-white rounded-lg transition ${
          isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isSubmitting ? 'Guardando...' : 'Guardar'}
      </button>
    </div>
  );
};
