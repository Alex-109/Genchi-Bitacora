// src/components/NewRecordForm.tsx (Código completo y modificado)

'use client';

import React, { useState, useEffect } from 'react';

// Importamos las interfaces proporcionadas por el usuario
// ASUMIMOS que NewRecordFormState tiene ahora:
// ram: number;
// almacenamiento: number;
import { NewRecordFormProps, NewRecordFormState, EquipoDB, DireccionDB } from '../types';

// ====================================================================================
// COMPONENTE PRINCIPAL
// ====================================================================================

export const NewRecordForm = ({ onBackToList, onRecordCreated }: NewRecordFormProps) => {

    const [isLoading, setIsLoading] = useState<boolean>(true);

    const [formData, setFormData] = useState<NewRecordFormState>({
        tipoEquipo: 'PC',
        model: "",
        brand: "", 
        serialNumber: "",
        windows: "", 
        ver_win: "", 
        antivirus: "true", 
        cpu: "", 
        ram: 0,              // 🎯 CAMBIO 1: Inicializado como number
        almacenamiento: 0,   // 🎯 CAMBIO 1: Inicializado como number
        motherboard: "",
        date: new Date().toISOString().slice(0, 10),
        notes: "",
        direccion: "",
        num_inv: "",
        ip: "",
        usuario: "",
        nombre_equipo: "",
        status: "",

        // Impresora 
        drum: "",
        toner: "",
        conexion: "",
    });

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [direcciones, setDirecciones] = useState<DireccionDB[]>([]);
    const [isNewDireccion, setIsNewDireccion] = useState<boolean>(false);
    const [newDireccion, setNewDireccion] = useState<string>('');

    const UNIDAD_API = 'http://localhost:5000/api/unidades';
    const EQUIPOS_PC_API = 'http://localhost:5000/api/equipos/pc';
    const EQUIPOS_IMPRESORA_API = 'http://localhost:5000/api/equipos/impresora';

    useEffect(() => {
        const fetchDirecciones = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(UNIDAD_API);
                if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
                const data: DireccionDB[] = await response.json();
                setDirecciones(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error al cargar las direcciones:", error);
                setMessage({ type: 'error', text: 'No se pudieron cargar las direcciones.' });
            } finally {
                setIsLoading(false);
            }
        };
        fetchDirecciones();
    }, []);

    const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newBrand = e.target.value;
        
        setFormData(prev => ({ 
            ...prev, 
            brand: newBrand,
            model: newBrand === 'Generico' ? '' : prev.model 
        }));
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        let finalValue: string | boolean | number = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        
        // 🎯 CAMBIO 2: Lógica para convertir RAM y ALMACENAMIENTO a 'number'
        if (name === 'ram' || name === 'almacenamiento') {
            // Si el valor está vacío, usamos 0. Si no, convertimos a entero.
            finalValue = value === '' ? 0 : parseInt(value, 10);
            
            // Opcional: Validación extra para evitar NaN si el usuario escribe letras en input type="number"
            if (isNaN(finalValue as number)) {
                finalValue = 0;
            }
        }
        // FIN CAMBIO 2

        if (name === 'direccion') {
            setIsNewDireccion(value === 'nueva');
        }

        if (name === 'tipoEquipo') {
            const nextTipoEquipo = value as 'PC' | 'Impresora';
            let resetFields: Partial<NewRecordFormState> = {};
            
            if (nextTipoEquipo === 'PC') {
                resetFields = { drum: "", toner: "", conexion: "" }; 
            } else if (nextTipoEquipo === 'Impresora') {
                // Al cambiar a Impresora, reseteamos a los valores iniciales (0 para number)
                resetFields = { cpu: "", ram: 0, almacenamiento: 0, motherboard: "", windows: "", ver_win: "", antivirus: "true", usuario: "" };
            }

            setFormData(prev => ({
                ...prev,
                ...resetFields,
                tipoEquipo: nextTipoEquipo,
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: finalValue, // TypeScript infiere el tipo correcto aquí
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage(null);

        let direccionIdToUse = formData.direccion;
        const nombreEquipo = formData.nombre_equipo;

        try {
            // 1. Manejo de la Nueva Dirección (Sin cambios)
            if (isNewDireccion && newDireccion) {
                const response = await fetch(UNIDAD_API, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        direccion: newDireccion,
                        nombre_u: newDireccion,
                    })
                });

                if (!response.ok) {
                    const errorDetails = await response.json();
                    throw new Error(`Error al insertar nueva dirección: ${errorDetails.message || 'Fallo desconocido'}`);
                }

                const newUnit: DireccionDB = await response.json();
                direccionIdToUse = newUnit.direccion;
            }

            // 2. Construir Payload Base
            let payload: Partial<EquipoDB> = {
                serie: formData.serialNumber,
                modelo: formData.brand === 'Generico' ? "" : formData.model, 
                marca: formData.brand,
                direccion: direccionIdToUse,
                num_inv: formData.num_inv,
                ip: formData.ip,
                tipo_equipo: formData.tipoEquipo,
                status: "Pendiente",
                date: formData.date ? new Date(formData.date).toISOString() : new Date().toISOString(),
                notes: formData.notes,
            };
            
            let apiUrl = '';

            // 3. Agregar campos específicos según el tipo de equipo (¡AJUSTADOS!)
            if (formData.tipoEquipo === 'PC') {
                apiUrl = EQUIPOS_PC_API;
                payload = {
                    ...payload,
                    nombre_equipo: nombreEquipo, 
                    usuario: formData.usuario,
                    ver_win: formData.windows || undefined, 
                    antivirus: formData.antivirus === 'true' ? 'Sí' : 'No', 
                    cpu: formData.cpu || undefined, 
                    
                    // 🎯 CAMBIO 3: Enviamos RAM como number
                    ram: formData.ram || undefined, 
                    almacenamiento: formData.almacenamiento || undefined, 
                    
                    motherboard: formData.motherboard,
                    windows: formData.ver_win || undefined, 
                } as Partial<EquipoDB>;
                
                // Opcional: Validación para RAM/Almacenamiento (ya que son inputs)
                if (typeof payload.ram !== 'number' || payload.ram <= 0 || typeof payload.almacenamiento !== 'number' || payload.almacenamiento <= 0) {
                     throw new Error('La RAM y el Almacenamiento deben ser números mayores a 0.');
                }


            } else if (formData.tipoEquipo === 'Impresora') {
                apiUrl = EQUIPOS_IMPRESORA_API;
                
                payload = {
                    ...payload,
                    nombre_equipo: nombreEquipo,
                    drum: formData.drum || undefined,
                    toner: formData.toner || undefined,
                    conexion: formData.conexion || undefined,
                } as Partial<EquipoDB>;
            }
            
            // 4. Enviar a la API
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorDetails = await response.json();
                throw new Error(`Error al insertar equipo: ${errorDetails.message || 'Fallo desconocido'}`);
            }

            const savedRecord: EquipoDB = await response.json();

            // 5. Adaptar el registro guardado al formato de la tabla (sin cambios)
            const newRecord: EquipoDB = {
                ...savedRecord,
                brand: savedRecord.marca,
                status: savedRecord.status || "Pendiente",
                date: formData.date, 
            } as EquipoDB;

            setMessage({ type: 'success', text: '¡Registro creado con éxito!' });
            onRecordCreated(newRecord);

            // 6. Resetear el formulario
            setFormData(prev => ({
                ...prev,
                tipoEquipo: 'PC',
                model: "",
                brand: "",
                serialNumber: "",
                windows: "",
                ver_win: "", 
                antivirus: "true",
                cpu: "",
                almacenamiento: 0, // Reset a 0 (number)
                ram: 0,             // Reset a 0 (number)
                motherboard: "",
                notes: "",
                direccion: "",
                num_inv: "",
                ip: "",
                usuario: "",
                nombre_equipo: "", 
                drum: "",
                toner: "",
                conexion: "",
            }));
            setNewDireccion('');
            setIsNewDireccion(false);

            setTimeout(onBackToList, 1500);

        } catch (error) {
            console.error("Error al guardar en la base de datos:", error);
            setMessage({ type: 'error', text: `Ocurrió un error al crear el registro: ${error instanceof Error ? error.message : 'Error desconocido'}` });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    // ... El resto del componente se mantiene igual ...
    const isModelVisible = formData.brand !== 'Generico';
    const isModelRequired = isModelVisible;

    return (
        <section className="bg-white p-6 rounded-xl shadow-2xl max-w-4xl mx-auto my-8">
            <form onSubmit={handleSubmit} className="space-y-6">

                <h2 className="text-3xl font-bold text-gray-900 border-b-4 border-blue-600 pb-3 mb-6">
                    Añadir Nuevo Equipo
                </h2>

                {/* Tipo de equipo */}
                <div className='bg-blue-50 p-4 rounded-lg'>
                    <label htmlFor="tipoEquipo" className="block text-lg font-semibold text-blue-800 mb-2">
                        Tipo de Equipo 
                    </label>
                    <select
                        id="tipoEquipo"
                        name="tipoEquipo"
                        value={formData.tipoEquipo}
                        onChange={handleChange}
                    
                        className="block w-full rounded-lg border-2 border-blue-300 shadow-sm p-2.5 focus:border-blue-500 focus:ring-blue-500 transition duration-150 text-gray-900"
                    >
                        <option value="PC">PC</option>
                        <option value="Impresora">Impresora</option>
                    </select>
                </div>

                {/* Campos comunes */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    
                    {/* 📌 1. CAMPO MARCA (Dropdown) */}
                    <div className='col-span-1'>
                        <label htmlFor="brand" className="block text-sm font-medium text-gray-900">Marca</label>
                        <select
                            id="brand"
                            name="brand"
                            value={formData.brand}
                            onChange={handleBrandChange} 
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                        >
                            <option value="">-- Seleccione --</option>
                            <option value="HP">HP</option>
                            <option value="DELL">DELL</option>
                            <option value="Lenovo">Lenovo</option>
                            <option value="Generico">Generico</option>
                        </select>
                    </div>

                    {/* 📌 2. CAMPO MODELO (Condicional - SE PEGA SI SE OCULTA) */}
                    {isModelVisible && (
                        <div className='col-span-1'>
                            <label htmlFor="model" className="block text-sm font-medium text-gray-900">Modelo</label>
                            <input
                                type="text"
                                id="model"
                                name="model"
                                value={formData.model}
                                onChange={handleChange}
                                required={isModelRequired} 
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                            />
                        </div>
                    )}
                    
                    {/* El resto de campos comunes (Serial Number, Nombre Equipo) */}
                    <div className='col-span-1'>
                        <label htmlFor="serialNumber" className="block text-sm font-medium text-gray-900">Número de Serie</label>
                        <input
                            type="text"
                            id="serialNumber"
                            name="serialNumber"
                            value={formData.serialNumber}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                        />
                    </div>
                    {/* Campo de entrada para el Nombre del Equipo */}
                    <div className='col-span-1'>
                        <label htmlFor="nombre_equipo" className="block text-sm font-medium text-gray-900">Nombre del Equipo</label>
                        <input
                            type="text"
                            id="nombre_equipo"
                            name="nombre_equipo"
                            value={formData.nombre_equipo}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                        />
                    </div>
                </div>

                {/* Campos por tipo: PC */}
                {formData.tipoEquipo === 'PC' && (
                    <div className='space-y-6 p-4 border rounded-lg bg-gray-50'>
                        <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">Especificaciones de PC</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {/* ⭐ CPU (Dropdown) */}
                            <div>
                                <label htmlFor="cpu" className="block text-sm font-medium text-gray-900">CPU</label>
                                <select
                                    id="cpu"
                                    name="cpu"
                                    value={formData.cpu}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 text-gray-900"
                                >
                                    <option value="">-- Seleccione --</option>
                                    <option value="i3">i3</option>
                                    <option value="i5">i5</option>
                                    <option value="i7">i7</option>
                                    <option value="Ryzen 3">Ryzen 3</option>
                                    <option value="Ryzen 5">Ryzen 5</option>
                                    <option value="Otros">Otros</option>
                                </select>
                            </div>

                            {/* ⭐ RAM (Input Numérico) - ¡CAMBIO! */}
                            <div>
                                <label htmlFor="ram" className="block text-sm font-medium text-gray-900">RAM (GB)</label>
                                <input
                                    type="number" // 🎯 CAMBIO 4: type="number"
                                    id="ram"
                                    name="ram"
                                    value={formData.ram === 0 ? '' : formData.ram} // Truco para no mostrar '0'
                                    onChange={handleChange} // Usará la nueva lógica de conversión en handleChange
                                    min="1"
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 text-gray-900"
                                />
                            </div>
                            
                            {/* ⭐ ALMACENAMIENTO (Input Numérico) - ¡CAMBIO! */}
                            <div>
                                <label htmlFor="almacenamiento" className="block text-sm font-medium text-gray-900">Almacenamiento (GB)</label>
                                <input
                                    type="number" // 🎯 CAMBIO 4: type="number"
                                    id="almacenamiento"
                                    name="almacenamiento"
                                    value={formData.almacenamiento === 0 ? '' : formData.almacenamiento} // Truco para no mostrar '0'
                                    onChange={handleChange} // Usará la nueva lógica de conversión en handleChange
                                    min="1"
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 text-gray-900"
                                />
                            </div>
                            
                            {/* Antivirus (Dropdown) */}
                            <div className='flex flex-col'>
                                <label htmlFor="antivirus" className="block text-sm font-medium text-gray-900">Antivirus</label>
                                <select
                                    id="antivirus"
                                    name="antivirus"
                                    value={formData.antivirus}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 text-gray-900"
                                >
                                    <option value="true">Sí</option>
                                    <option value="false">No</option>
                                </select>
                            </div>
                        </div>

                        {/* ⭐ WINDOWS (Dropdown + Input de Versión) */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className='col-span-1'>
                                <label htmlFor="windows" className="block text-sm font-medium text-gray-900">Sistema Operativo</label>
                                <select
                                    id="windows"
                                    name="windows"
                                    value={formData.windows}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 text-gray-900"
                                >
                                    <option value="">-- Versión Base --</option>
                                    <option value="W7">Windows 7 </option>
                                    <option value="W10">Windows 10 </option>
                                    <option value="W11">Windows 11 </option>
                                    <option value="Otros">Otros </option>
                                </select>
                            </div>
                            <div className='col-span-1'>
                                <label htmlFor="ver_win" className="block text-sm font-medium text-gray-900">Versión Manual (Detalle)</label>
                                <input
                                    type="text"
                                    id="ver_win"
                                    name="ver_win"
                                    value={formData.ver_win}
                                    onChange={handleChange}
                                    placeholder="ej. 22H2 o Pro"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 text-gray-900"
                                />
                            </div>
                            {/* FIN WINDOWS */}
                            
                            <div className='col-span-1'>
                                <label htmlFor="motherboard" className="block text-sm font-medium text-gray-900">Motherboard</label>
                                <input
                                    type="text"
                                    id="motherboard"
                                    name="motherboard"
                                    value={formData.motherboard}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 text-gray-900"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Campos por tipo: Impresora */}
                {formData.tipoEquipo === 'Impresora' && (
                    <div className='space-y-6 p-4 border rounded-lg bg-gray-50'>
                        <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">Especificaciones de Impresora</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            
                            {/* Campo DRUM (Dropdown) */}
                            <div>
                                <label htmlFor="drum" className="block text-sm font-medium text-gray-900">Modelo de Drum</label>
                                <select
                                    id="drum"
                                    name="drum"
                                    value={formData.drum}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 text-gray-900"
                                >
                                    <option value="">-- Seleccionar --</option>
                                    <option value="DR-1060">DR-1060</option>
                                    <option value="No Aplica">No Aplica</option>
                                    <option value="Otros">Otros</option>
                                </select>
                            </div>
                            
                            {/* Campo TONER (Dropdown) */}
                            <div>
                                <label htmlFor="toner" className="block text-sm font-medium text-gray-900">Modelo de Toner</label>
                                <select
                                    id="toner"
                                    name="toner"
                                    value={formData.toner}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 text-gray-900"
                                >
                                    <option value="">-- Seleccionar --</option>
                                    <option value="TN-1060">TN-1060</option>
                                    <option value="85A">85A</option>
                                    <option value="Tinta Continua">Tinta Continua</option>
                                    <option value="Otros">Otros</option>
                                </select>
                            </div>

                            {/* Campo CONEXION (Dropdown) */}
                            <div>
                                <label htmlFor="conexion" className="block text-sm font-medium text-gray-900">Tipo de Conexión</label>
                                <select
                                    id="conexion"
                                    name="conexion"
                                    value={formData.conexion}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 text-gray-900"
                                >
                                    <option value="">-- Seleccionar --</option>
                                    <option value="USB">USB</option>
                                    <option value="Red">Red</option>
                                    <option value="WiFi">WiFi</option>
                                    <option value="Otros">Otros</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}
                
                
                <div className='space-y-6 p-4 border rounded-lg bg-yellow-50'>
                    <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">Datos extra</h3>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* El resto de campos extra se mantienen igual */}
                        <div>
                            <label htmlFor="num_inv" className="block text-sm font-medium text-gray-900">Número de Inventario</label>
                            <input
                                type="text"
                                id="num_inv"
                                name="num_inv"
                                value={formData.num_inv}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 text-gray-900"
                            />
                        </div>
                        <div>
                            <label htmlFor="ip" className="block text-sm font-medium text-gray-900">IP</label>
                            <input
                                type="text"
                                id="ip"
                                name="ip"
                                value={formData.ip}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 text-gray-900"
                            />
                        </div>
                        {formData.tipoEquipo === 'PC' && (
                            <div>
                                <label htmlFor="usuario" className="block text-sm font-medium text-gray-900">Usuario Asignado</label>
                                <input
                                    type="text"
                                    id="usuario"
                                    name="usuario"
                                    value={formData.usuario}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 text-gray-900"
                                />
                            </div>
                        )}
                        <div>
                            <label htmlFor="date" className="block text-sm font-medium text-gray-900">Fecha de Ingreso</label>
                            <input
                                type="date"
                                id="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 text-gray-900"
                            />
                        </div>
                    </div>

                    {/* Dirección */}
                    <div className="mt-6">
                        <label htmlFor="direccion" className="block text-sm font-medium text-gray-900 mb-1">
                            Unidad 
                        </label>
                        <select
                            id="direccion"
                            name="direccion"
                            onChange={handleChange}
                            value={isNewDireccion ? 'nueva' : formData.direccion}
                            className="block w-full rounded-lg border-2 border-yellow-300 shadow-sm p-2.5 focus:border-blue-500 focus:ring-blue-500 transition duration-150 text-gray-900"
                        
                        >
                            <option value="">-- Seleccionar --</option>
                            {isLoading ? (
                                <option disabled>Cargando direcciones...</option>
                            ) : (
                                direcciones.map((dir) => (
                                    <option key={dir.direccion} value={dir.direccion}>{dir.direccion}</option>
                                ))
                            )}
                            <option value="nueva">Crear Nueva Dirección</option>
                        </select>

                        {isNewDireccion && (
                            <input
                                type="text"
                                placeholder="Escribe la nueva dirección"
                                value={newDireccion}
                                onChange={e => setNewDireccion(e.target.value)}
                                className="mt-2 block w-full rounded-md border-gray-300 shadow-inner p-2 focus:border-green-500 focus:ring-green-500 text-gray-900"
                            
                            />
                        )}
                    </div>

                    {/* Notas */}
                    <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-900">Notas</label>
                        <textarea
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 text-gray-900"
                            rows={3}
                        />
                    </div>
                </div>

                {/* Botones de acción */}
                <div className="flex justify-end space-x-4 pt-4 border-t">
                    <button
                        type="button"
                        onClick={onBackToList}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition duration-150"
                        disabled={isSubmitting}
                    >
                        Volver a la Lista
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2 rounded-lg text-white font-semibold bg-blue-600 hover:bg-blue-700 transition duration-150 disabled:opacity-50"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Guardando...' : 'Guardar Equipo'}
                    </button>
                </div>
                
                {/* Mensajes de feedback */}
                {message && (
                    <div className={`p-3 rounded-lg text-white ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                        {message.text}
                    </div>
                )}

            </form>
        </section>
    );
};