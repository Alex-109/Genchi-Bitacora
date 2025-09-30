import React from 'react';
import { NewRecordFormState } from '../../types';
import { FormField } from '../ui/FormField';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

interface PrinterFieldsProps {
  formData: NewRecordFormState;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

export const PrinterFields: React.FC<PrinterFieldsProps> = ({ formData, handleChange }) => {
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
        <Select
          id="conexion"
          name="conexion"
          value={formData.conexion || ''}
          onChange={handleChange}
          options={[
            { value: 'USB', label: 'USB' },
            { value: 'Ethernet', label: 'Ethernet' },
            { value: 'WiFi', label: 'WiFi' },
            { value: 'Otros', label: 'Otros' },
          ]}
        />
      </FormField>
    </div>
  );
};
