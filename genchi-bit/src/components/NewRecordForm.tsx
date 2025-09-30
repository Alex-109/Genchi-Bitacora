'use client';

import React, { useState } from 'react';
import { NewRecordFormProps, NewRecordFormState, EquipoDB } from '../types';
import { GeneralFields } from './form/GeneralFields';
import { PcSpecFields } from './form/PcSpecFields';
import { PrinterFields } from './form/PrinterFields';
import { ExtraDataFields } from './form/ExtraDataFields';
import { FormActions } from './form/FormActions';
import { Select } from './ui/Select';

export const NewRecordForm: React.FC<NewRecordFormProps> = ({ onBackToList, onRecordCreated }) => {
  const [formData, setFormData] = useState<NewRecordFormState>({
    tipoEquipo: 'PC',
    brand: '',
    model: '',
    serialNumber: '',
    nombre_equipo: '',
    num_inv: '',
    ip: '',
    usuario: '',
    windows: '',
    ver_win: '',
    antivirus: 'true',
    cpu: '',
    ram: 0,
    almacenamiento: '',
    motherboard: '',
    date: new Date().toISOString(),
    status: 'Pendiente',
    direccion: '',
    notes: '',
    toner: '',
    drum: '',
    conexion: '',
    almacenamientoSelection: '',
  });

  const [direccionOptions] = useState<{ value: string; label: string }[]>([
    { value: 'oficina', label: 'Oficina' },
    { value: 'bodega', label: 'Bodega' },
  ]);
  const [isNewDireccion, setIsNewDireccion] = useState(false);
  const [newDireccion, setNewDireccion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    let val: string | number = value;
    if (type === 'number') val = Number(value);

    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, brand: e.target.value, model: '' }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newEquipo: EquipoDB = {
      serie: formData.serialNumber,
      modelo: formData.model,
      marca: formData.brand,
      tipo_equipo: formData.tipoEquipo,
      status: formData.status,
      date: formData.date,
      nombre_equipo: formData.nombre_equipo,
      usuario: formData.usuario,
      windows: formData.windows,
      ver_win: formData.ver_win,
      antivirus: formData.antivirus,
      cpu: formData.cpu,
      ram: formData.ram,
      almacenamiento: Number(formData.almacenamiento),
      motherboard: formData.motherboard,
      toner: formData.toner,
      drum: formData.drum,
      conexion: formData.conexion,
      direccion: isNewDireccion ? newDireccion : formData.direccion,
      notes: formData.notes,
      num_inv: formData.num_inv,
      ip: formData.ip,
    };

    const endpoint =
      formData.tipoEquipo === 'PC'
        ? 'http://localhost:5000/api/equipos/pc'
        : 'http://localhost:5000/api/equipos/impresora';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEquipo),
      });

      if (!response.ok) throw new Error('Error al guardar el equipo');

      const savedEquipo: EquipoDB = await response.json();
      onRecordCreated(savedEquipo);
      onBackToList();
    } catch (error) {
      console.error(error);
      alert('Hubo un error al guardar el equipo');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tipo de equipo */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-1" htmlFor="tipoEquipo">
          Tipo de Equipo
        </label>
        <Select
          id="tipoEquipo"
          name="tipoEquipo"
          value={formData.tipoEquipo}
          onChange={handleChange}
          options={[
            { value: 'PC', label: 'PC' },
            { value: 'Impresora', label: 'Impresora' },
          ]}
        />
      </div>

      {/* Campos generales */}
      <GeneralFields
        formData={formData}
        handleChange={handleChange}
        handleBrandChange={handleBrandChange}
      />

      {/* Campos según tipo */}
      {formData.tipoEquipo === 'PC' && (
        <PcSpecFields formData={formData} handleChange={handleChange} />
      )}
      {formData.tipoEquipo === 'Impresora' && (
        <PrinterFields formData={formData} handleChange={handleChange} />
      )}

      {/* Campos adicionales */}
      <ExtraDataFields
        formData={formData}
        handleChange={handleChange}
        direccionOptions={direccionOptions}
        isNewDireccion={isNewDireccion}
        newDireccion={newDireccion}
        setNewDireccion={setNewDireccion}
        setIsNewDireccion={setIsNewDireccion}
      />

      <FormActions onBack={onBackToList} isSubmitting={isSubmitting} />
    </form>
  );
};
