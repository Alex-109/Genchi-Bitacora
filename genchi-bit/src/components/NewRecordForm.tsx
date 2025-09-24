// src/components/NewRecordForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { NewRecordFormProps, NewRecordFormState, EquipoDB, PcDB, PcCombined } from '../types';

// Interfaz para el estado de las direcciones
interface DireccionDB {
    direccion: string;
    nombre_u: string;
}

export const NewRecordForm = ({ onBackToList, onRecordCreated }: NewRecordFormProps) => {
    const [formData, setFormData] = useState<NewRecordFormState>({
        model: "",
        brand: "",
        serialNumber: "",
        windows: "",
        antivirus: "",
        cpu: "",
        ram: "",
        gpu: false,
        gpuModel: "",
        powerSupply: "",
        motherboard: "",
        date: new Date().toISOString().slice(0, 10),
        notes: "",
        direccion: "",
        num_inv: "",
        ip: "",
        usuario: "",
    });
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [direcciones, setDirecciones] = useState<DireccionDB[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [newDireccion, setNewDireccion] = useState<string>('');
    const [isNewDireccion, setIsNewDireccion] = useState<boolean>(false);

    useEffect(() => {
        const fetchDirecciones = async () => {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('unidad')
                .select('direccion, nombre_u');

            if (error) {
                console.error("Error al cargar las direcciones:", error.message);
                setMessage({ type: 'error', text: 'No se pudieron cargar las direcciones.' });
            } else {
                setDirecciones(data || []);
            }
            setIsLoading(false);
        };
        fetchDirecciones();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prevData => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleDireccionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value === 'nueva_direccion') {
            setIsNewDireccion(true);
            setFormData(prevData => ({ ...prevData, direccion: '' }));
        } else {
            setIsNewDireccion(false);
            setFormData(prevData => ({ ...prevData, direccion: value }));
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage(null);

        let direccionIdToUse = formData.direccion;

        try {
            if (isNewDireccion && newDireccion) {
                const { data, error } = await supabase
                    .from('unidad')
                    .insert([{ direccion: newDireccion, nombre_u: newDireccion }])
                    .select();

                if (error) {
                    throw new Error(`Error al insertar nueva dirección: ${error.message}`);
                }

                if (data && data.length > 0) {
                    direccionIdToUse = data[0].direccion;
                } else {
                    throw new Error('No se pudo obtener el ID de la nueva dirección.');
                }
            }

            const equipoData: EquipoDB = {
                serie: formData.serialNumber,
                modelo: formData.model,
                marca: formData.brand,
                num_inv: formData.num_inv,
                ip: formData.ip,
                direccion: direccionIdToUse,
            };

            const { error: equipoError } = await supabase
                .from('equipo')
                .insert([equipoData]);

            if (equipoError) {
                throw new Error(`Error al insertar en 'equipo': ${equipoError.message}`);
            }

            const pcData: PcDB = {
                serie: formData.serialNumber,
                nombre_equipo: formData.model,
                usuario: formData.usuario,
                ver_win: formData.windows,
                antivirus: formData.antivirus,
                specs: {
                    cpu: formData.cpu,
                    ram: formData.ram,
                    gpu: formData.gpu ? "Con GPU dedicada" : "Sin GPU dedicada",
                    gpuModel: formData.gpuModel,
                    powerSupply: formData.powerSupply,
                    motherboard: formData.motherboard,
                },
            };

            const { error: pcError } = await supabase
                .from('pc')
                .insert([pcData]);

            if (pcError) {
                throw new Error(`Error al insertar en 'pc': ${pcError.message}`);
            }

            setMessage({ type: 'success', text: '¡Registro creado con éxito!' });

            const newRecord: PcCombined = {
                ...equipoData,
                ...pcData,
                brand: formData.brand,
                status: "Pendiente",
                date: formData.date,
            };

            onRecordCreated(newRecord);

            setFormData({
                model: "", brand: "", serialNumber: "", windows: "", antivirus: "",
                cpu: "", ram: "", gpu: false, gpuModel: "", powerSupply: "",
                motherboard: "", date: new Date().toISOString().slice(0, 10), notes: "",
                direccion: "", num_inv: "", ip: "", usuario: ""
            });
            setNewDireccion('');
            setIsNewDireccion(false);

            setTimeout(onBackToList, 2000);

        } catch (error) {
            console.error("Error al guardar en la base de datos:", error);
            setMessage({ type: 'error', text: 'Ocurrió un error al crear el registro.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Agregar Nuevo Registro</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div className="md:col-span-2">
                    <h3 className="text-xl font-semibold text-gray-700 mb-4">Información del Equipo</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col">
                            <label htmlFor="brand" className="text-sm font-medium text-gray-600 mb-1">Marca <span className="text-red-500">*</span></label>
                            <input type="text" id="brand" name="brand" value={formData.brand} onChange={handleChange} required className="p-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-gray-800" placeholder="Ej: Dell, HP, Lenovo" />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="model" className="text-sm font-medium text-gray-600 mb-1">Modelo <span className="text-red-500">*</span></label>
                            <input type="text" id="model" name="model" value={formData.model} onChange={handleChange} required className="p-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-gray-800" placeholder="Ej: Inspiron 15, ThinkPad E14" />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="serialNumber" className="text-sm font-medium text-gray-600 mb-1">Número de Serie <span className="text-red-500">*</span></label>
                            <input type="text" id="serialNumber" name="serialNumber" value={formData.serialNumber} onChange={handleChange} required className="p-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-gray-800" placeholder="Ej: número de serie del equipo" />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="direccion" className="text-sm font-medium text-gray-600 mb-1">Dirección <span className="text-red-500">*</span></label>
                            <select
                                id="direccion"
                                name="direccion"
                                value={isNewDireccion ? 'nueva_direccion' : formData.direccion}
                                onChange={handleDireccionChange}
                                required
                                className="p-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-gray-800"
                            >
                                <option value="" disabled>
                                    {isLoading ? "Cargando..." : "Selecciona una dirección"}
                                </option>
                                {direcciones.map((dir) => (
                                    <option key={dir.direccion} value={dir.direccion}>
                                        {dir.nombre_u}
                                    </option>
                                ))}
                                <option value="nueva_direccion">
                                    -- Crear nueva dirección --
                                </option>
                            </select>
                        </div>
                        {isNewDireccion && (
                            <div className="flex flex-col">
                                <label htmlFor="newDireccion" className="text-sm font-medium text-gray-600 mb-1">Nueva Dirección <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    id="newDireccion"
                                    name="newDireccion"
                                    value={newDireccion}
                                    onChange={(e) => setNewDireccion(e.target.value)}
                                    required
                                    className="p-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-gray-800"
                                    placeholder="Nombre de la nueva dirección"
                                />
                            </div>
                        )}
                        <div className="flex flex-col">
                            <label htmlFor="num_inv" className="text-sm font-medium text-gray-600 mb-1">Número de Inventario</label>
                            <input type="text" id="num_inv" name="num_inv" value={formData.num_inv} onChange={handleChange} className="p-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-gray-800" placeholder="Ej: 00123" />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="ip" className="text-sm font-medium text-gray-600 mb-1">Dirección IP</label>
                            <input type="text" id="ip" name="ip" value={formData.ip} onChange={handleChange} className="p-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-gray-800" placeholder="Ej: 192.168.1.100" />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="usuario" className="text-sm font-medium text-gray-600 mb-1">Usuario</label>
                            <input type="text" id="usuario" name="usuario" value={formData.usuario} onChange={handleChange} className="p-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-gray-800" placeholder="Ej: Juan Pérez" />
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2">
                    <h3 className="text-xl font-semibold text-gray-700 mb-4 mt-6">Especificaciones de PC</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col">
                            <label htmlFor="windows" className="text-sm font-medium text-gray-600 mb-1">Versión de Windows <span className="text-red-500">*</span></label>
                            <input type="text" id="windows" name="windows" value={formData.windows} onChange={handleChange} required className="p-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-gray-800" placeholder="Ej: Windows 10 Pro" />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="antivirus" className="text-sm font-medium text-gray-600 mb-1">Antivirus <span className="text-red-500">*</span></label>
                            <input type="text" id="antivirus" name="antivirus" value={formData.antivirus} onChange={handleChange} required className="p-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-gray-800" placeholder="Ej: Defender, Kaspersky" />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="cpu" className="text-sm font-medium text-gray-600 mb-1">CPU</label>
                            <input type="text" id="cpu" name="cpu" value={formData.cpu} onChange={handleChange} className="p-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-gray-800" placeholder="Ej: Intel Core i5-11400" />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="ram" className="text-sm font-medium text-gray-600 mb-1">RAM</label>
                            <input type="text" id="ram" name="ram" value={formData.ram} onChange={handleChange} className="p-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-gray-800" placeholder="Ej: 8GB, 16GB" />
                        </div>
                        <div className="flex items-center space-x-2 md:col-span-2">
                            <input type="checkbox" id="gpu" name="gpu" checked={formData.gpu} onChange={handleChange} className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" />
                            <label htmlFor="gpu" className="text-sm font-medium text-gray-600">¿Tiene tarjeta gráfica dedicada?</label>
                        </div>
                        {formData.gpu && (
                            <div className="flex flex-col">
                                <label htmlFor="gpuModel" className="text-sm font-medium text-gray-600 mb-1">Modelo de la GPU</label>
                                <input type="text" id="gpuModel" name="gpuModel" value={formData.gpuModel} onChange={handleChange} className="p-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-gray-800" placeholder="Ej: NVIDIA GeForce RTX 3060" />
                            </div>
                        )}
                        <div className="flex flex-col">
                            <label htmlFor="powerSupply" className="text-sm font-medium text-gray-600 mb-1">Fuente de Poder</label>
                            <input type="text" id="powerSupply" name="powerSupply" value={formData.powerSupply} onChange={handleChange} className="p-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-gray-800" placeholder="Ej: 650W 80+ Gold" />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="motherboard" className="text-sm font-medium text-gray-600 mb-1">Placa Madre</label>
                            <input type="text" id="motherboard" name="motherboard" value={formData.motherboard} onChange={handleChange} className="p-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-gray-800" placeholder="Ej: ASUS ROG Strix B550-F" />
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2">
                    <h3 className="text-xl font-semibold text-gray-700 mb-4 mt-6">Notas y Comentarios</h3>
                    <div className="flex flex-col">
                        <label htmlFor="notes" className="text-sm font-medium text-gray-600 mb-1">Notas del Equipo</label>
                        <textarea
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows={4}
                            className="p-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-gray-800"
                            placeholder="Añade aquí cualquier detalle relevante sobre el equipo o la reparación."
                        ></textarea>
                    </div>
                </div>

                <div className="md:col-span-2 flex flex-col items-center mt-6">
                    <button
                        type="submit"
                        disabled={isSubmitting || (isNewDireccion && !newDireccion)}
                        className={`w-full max-w-sm px-6 py-3 font-bold rounded-lg transition-colors ${isSubmitting || (isNewDireccion && !newDireccion) ? 'bg-gray-400 text-gray-200 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-800'}`}
                    >
                        {isSubmitting ? 'Guardando...' : 'Crear Registro de Equipo'}
                    </button>
                    {message && (
                        <div className={`mt-4 text-center p-3 rounded-lg w-full max-w-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {message.text}
                        </div>
                    )}
                </div>
            </form>
        </section>
    );
};