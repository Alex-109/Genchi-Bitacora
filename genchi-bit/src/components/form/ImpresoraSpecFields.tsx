// src/components/form/ImpresoraSpecFields.tsx
import React from 'react';
import { NewRecordFormState } from '../../types';
import { FormField } from '../ui/FormField';
import { Input } from '../ui/Input';

interface ImpresoraSpecFieldsProps {
  formData: NewRecordFormState;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export const ImpresoraSpecFields: React.FC<ImpresoraSpecFieldsProps> = ({ formData, handleChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField label="Tóner" htmlFor="toner">
        <Input
          type="text"
          id="toner"
          name="toner"
          value={formData.toner || ''}
          onChange={handleChange}
        />
      </FormField>

      <FormField label="Drum" htmlFor="drum">
        <Input
          type="text"
          id="drum"
          name="drum"
          value={formData.drum || ''}
          onChange={handleChange}
        />
      </FormField>

      <FormField label="Conexión" htmlFor="conexion">
        <select
          id="conexion"
          name="conexion"
          value={formData.conexion || ''}
          onChange={handleChange}
          className="w-full p-2 border rounded-lg"
        >
          <option value="">-- Seleccionar --</option>
          <option value="USB">USB</option>
          <option value="WiFi">WiFi</option>
          <option value="Ethernet">Ethernet</option>
        </select>
      </FormField>
    </div>
  );
};
