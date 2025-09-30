// src/components/form/ExtraDataFields.tsx
import React from 'react';
import { NewRecordFormState } from '../../types';
import { FormField } from '../ui/FormField';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

interface ExtraDataFieldsProps {
  formData: NewRecordFormState;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  direccionOptions: { value: string; label: string }[];
  isNewDireccion: boolean;
  newDireccion: string;
  setNewDireccion: (val: string) => void;
  setIsNewDireccion: (val: boolean) => void;
}

export const ExtraDataFields: React.FC<ExtraDataFieldsProps> = ({
  formData,
  handleChange,
  direccionOptions,
  isNewDireccion,
  newDireccion,
  setNewDireccion,
  setIsNewDireccion,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Dirección */}
      <FormField label="Dirección" htmlFor="direccion">
        <Select
          id="direccion"
          name="direccion"
          value={formData.direccion || ''}
          onChange={(e) => {
            handleChange(e);
            setIsNewDireccion(e.target.value === 'otra');
          }}
          options={[...direccionOptions, { value: 'otra', label: 'Otra' }]}
          required
        />
      </FormField>

      {isNewDireccion && (
        <FormField label="Nueva Dirección" htmlFor="newDireccion">
          <Input
            id="newDireccion"
            name="newDireccion"
            value={newDireccion}
            onChange={(e) => setNewDireccion(e.target.value)}
            required
          />
        </FormField>
      )}

      {/* Observaciones */}
      <FormField label="Observaciones" htmlFor="observaciones" className="col-span-1 md:col-span-2">
        <textarea
          id="observaciones"
          name="notes"
          value={formData.notes || ''}
          onChange={handleChange}
          className="w-full p-2 border rounded-lg text-gray-900"
          rows={3}
        />
      </FormField>
    </div>
  );
};
