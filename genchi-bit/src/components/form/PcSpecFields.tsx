import React from 'react';
import { NewRecordFormState } from '../../types';
import { FormField } from '../ui/FormField';
import { Input } from '../ui/Input';

interface PcSpecFieldsProps {
  formData: NewRecordFormState;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export const PcSpecFields: React.FC<PcSpecFieldsProps> = ({ formData, handleChange }) => {
  // Opciones típicas de almacenamiento
  const storageOptions = ['256', '500', '1000', '2000', 'Otros'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      
      <FormField label="Nombre del Equipo" htmlFor="nombre_equipo">
        <Input
          type="text"
          id="nombre_equipo"
          name="nombre_equipo"
          value={formData.nombre_equipo || ''}
          onChange={handleChange}
          required
        />
      </FormField>

      <FormField label="Procesador" htmlFor="cpu">
        <Input
          type="text"
          id="cpu"
          name="cpu"
          value={formData.cpu || ''}
          onChange={handleChange}
          required
        />
      </FormField>

      <FormField label="RAM (GB)" htmlFor="ram">
        <Input
          type="number"
          id="ram"
          name="ram"
          value={formData.ram || ''}
          onChange={handleChange}
          min={1}
          required
        />
      </FormField>

      <FormField label="Almacenamiento (GB)" htmlFor="almacenamientoSelection">
  <div className="flex flex-col">
    <select
      id="almacenamientoSelection"
      name="almacenamientoSelection"
      value={formData.almacenamientoSelection || ''}
      onChange={handleChange}
      className="w-full p-2 border rounded-lg text-gray-900"
    >
      <option value="">Seleccione</option>
      {storageOptions.map(opt => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>

    {/* Input para valor exacto si eligió 'Otros' */}
    {formData.almacenamientoSelection === 'Otros' && (
      <Input
        type="number"
        id="almacenamiento"
        name="almacenamiento"
        value={formData.almacenamiento || ''}
        onChange={handleChange}
        min={1}
        placeholder="Ingrese GB exactos"
        className="mt-2"
      />
    )}
  </div>
</FormField>

      <FormField label="Antivirus" htmlFor="antivirus">
       <select
        id="antivirus"
        name="antivirus"
        value={formData.antivirus}
        onChange={handleChange}
        className="w-full p-2 border rounded-lg text-gray-900"
        required
        >
        <option value="true">Sí</option>
        <option value="false">No</option>
       </select>

      </FormField>
    </div>
  );
};
