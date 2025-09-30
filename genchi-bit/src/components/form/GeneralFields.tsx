// src/components/form/GeneralFields.tsx
import React from 'react';
import { FormField } from '../ui/FormField';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { NewRecordFormState } from '../../types';

interface Props {
  formData: NewRecordFormState;
  handleBrandChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

const BRAND_OPTIONS = [
  { value: '', label: '-- Seleccione --' },
  { value: 'HP', label: 'HP' },
  { value: 'DELL', label: 'DELL' },
  { value: 'Lenovo', label: 'Lenovo' },
  { value: 'Generico', label: 'Generico' },
];

export const GeneralFields: React.FC<Props> = ({ formData, handleBrandChange, handleChange }) => {
  const isModelVisible = formData.brand !== 'Generico' && formData.brand !== '';

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Marca */}
      <FormField label="Marca" htmlFor="brand" className="col-span-1">
        <Select
          id="brand"
          name="brand"
          value={formData.brand}
          onChange={handleBrandChange}
          options={BRAND_OPTIONS}
          required
        />
      </FormField>

      {/* Modelo */}
      {isModelVisible && (
        <FormField label="Modelo" htmlFor="model" className="col-span-1">
          <Input
            id="model"
            name="model"
            value={formData.model}
            onChange={handleChange}
            required
          />
        </FormField>
      )}

      {/* Número de serie */}
      <FormField label="Número de Serie" htmlFor="serialNumber" className="col-span-1">
        <Input
          id="serialNumber"
          name="serialNumber"
          value={formData.serialNumber}
          onChange={handleChange}
        />
      </FormField>

      {/* IP */}
      <FormField label="IP" htmlFor="ip" className="col-span-1">
        <Input
          id="ip"
          name="ip"
          value={formData.ip}
          onChange={handleChange}
        />
      </FormField>

      {/* Número de Inventario */}
      <FormField label="Número de Inventario" htmlFor="num_inv" className="col-span-1">
        <Input
          id="num_inv"
          name="num_inv"
          value={formData.num_inv}
          onChange={handleChange}
        />
      </FormField>

      {/* Sistema Operativo */}
      <FormField label="Sistema Operativo" htmlFor="windows" className="col-span-1">
        <Select
          id="windows"
          name="windows"
          value={formData.windows}
          onChange={handleChange}
          options={[
            { value: '', label: '-- Seleccione --' },
            { value: 'W7', label: 'Windows 7' },
            { value: 'W10', label: 'Windows 10' },
            { value: 'W11', label: 'Windows 11' },
            { value: 'Otros', label: 'Otros' },
          ]}
        />
      </FormField>

      {/* Versión Windows */}
      <FormField label="Versión Windows" htmlFor="ver_win" className="col-span-1">
        <Input
          id="ver_win"
          name="ver_win"
          value={formData.ver_win}
          onChange={handleChange}
        />
      </FormField>
    </div>
  );
};
