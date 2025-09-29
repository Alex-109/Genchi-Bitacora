'use client';

import React, { useState, useEffect } from 'react';

// Importamos las interfaces proporcionadas por el usuario
import { NewRecordFormProps, NewRecordFormState, EquipoDB, PcCombined, DireccionDB } from '../types';

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
        antivirus: "true", 
        cpu: "",
        ram: "",
        // Propiedad de almacenamiento añadida
        almacenamiento: "", 
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
        // Impresora ACTUALIZADA
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        // Se mantiene la lógica de checkbox para GPU
        let finalValue: string | boolean = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

        if (name === 'direccion') {
            setIsNewDireccion(value === 'nueva');
        }

        if (name === 'tipoEquipo') {
            const nextTipoEquipo = value as 'PC' | 'Impresora';
            let resetFields: Partial<NewRecordFormState> = {};
            
            // Lógica para resetear campos específicos
            if (nextTipoEquipo === 'PC') {
                // Reset de los nuevos campos de Impresora
                resetFields = { drum: "", toner: "", conexion: "" }; 
            } else if (nextTipoEquipo === 'Impresora') {
                // Se resetean los campos de PC
                resetFields = { cpu: "", ram: "", almacenamiento: "", gpu: false, gpuModel: "", powerSupply: "", motherboard: "", windows: "", antivirus: "true", usuario: "" };
            }

            setFormData(prev => ({
                ...prev,
                ...resetFields,
                tipoEquipo: nextTipoEquipo,
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: finalValue,
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage(null);

        let direccionIdToUse = formData.direccion;
        const nombreEquipo = formData.model;

        try {
            // 1. Manejo de la Nueva Dirección
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
                modelo: formData.model,
                marca: formData.brand,
                direccion: direccionIdToUse,
                num_inv: formData.num_inv,
                ip: formData.ip,
                tipo_equipo: formData.tipoEquipo,
                status: "Pendiente",
            };
            
            let apiUrl = '';

            // 3. Agregar campos específicos según el tipo de equipo
            if (formData.tipoEquipo === 'PC') {
                apiUrl = EQUIPOS_PC_API;
                payload = {
                    ...payload,
                    nombre_equipo: nombreEquipo,
                    usuario: formData.usuario,
                    ver_win: formData.windows,
                    antivirus: formData.antivirus === 'true' ? 'Sí' : 'No', 
                    cpu: formData.cpu,
                    ram: formData.ram,
                    almacenamiento: formData.almacenamiento, 
                    gpu: formData.gpu ? formData.gpuModel : 'N/A',
                    powerSupply: formData.powerSupply,
                    motherboard: formData.motherboard,
                } as Partial<EquipoDB>;

            } else if (formData.tipoEquipo === 'Impresora') {
                apiUrl = EQUIPOS_IMPRESORA_API;
                // Campos de Impresora ACTUALIZADOS en el payload
                payload = {
                    ...payload,
                    drum: formData.drum,
                    toner: formData.toner,
                    conexion: formData.conexion,
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

            // 5. Adaptar el registro guardado al formato de la tabla
            const newRecord: PcCombined = {
                ...savedRecord,
                brand: savedRecord.marca,
                status: savedRecord.status || "Pendiente",
                date: formData.date,
            } as PcCombined;

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
                antivirus: "true",
                cpu: "",
                almacenamiento: "", 
                ram: "",
                gpu: false,
                gpuModel: "",
                powerSupply: "",
                motherboard: "",
                notes: "",
                direccion: "",
                num_inv: "",
                ip: "",
                usuario: "",
                // Reset de los nuevos campos de Impresora
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

    return (
        <section className="bg-white p-6 rounded-xl shadow-2xl max-w-4xl mx-auto my-8">
            <form onSubmit={handleSubmit} className="space-y-6">

                <h2 className="text-3xl font-bold text-gray-900 border-b-4 border-blue-600 pb-3 mb-6">
                    Añadir Nuevo Equipo
                </h2>

                {/* Tipo de equipo */}
                <div className='bg-blue-50 p-4 rounded-lg'>
                    <label htmlFor="tipoEquipo" className="block text-lg font-semibold text-blue-800 mb-2">
                        Tipo de Equipo (*)
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className='col-span-1'>
                        <label htmlFor="model" className="block text-sm font-medium text-gray-900">Modelo (*)</label>
                        <input
                            type="text"
                            id="model"
                            name="model"
                            value={formData.model}
                            onChange={handleChange}
                           
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                        />
                    </div>
                    <div className='col-span-1'>
                        <label htmlFor="brand" className="block text-sm font-medium text-gray-900">Marca (*)</label>
                        <input
                            type="text"
                            id="brand"
                            name="brand"
                            value={formData.brand}
                            onChange={handleChange}
                        
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                        />
                    </div>
                    <div className='col-span-1'>
                        <label htmlFor="serialNumber" className="block text-sm font-medium text-gray-900">Número de Serie (*)</label>
                        <input
                            type="text"
                            id="serialNumber"
                            name="serialNumber"
                            value={formData.serialNumber}
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
                            <div>
                                <label htmlFor="cpu" className="block text-sm font-medium text-gray-900">CPU</label>
                                <input
                                    type="text"
                                    id="cpu"
                                    name="cpu"
                                    value={formData.cpu}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 text-gray-900"
                                />
                            </div>
                            <div>
                                <label htmlFor="ram" className="block text-sm font-medium text-gray-900">RAM</label>
                                <input
                                    type="text"
                                    id="ram"
                                    name="ram"
                                    value={formData.ram}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 text-gray-900"
                                />
                            </div>
                            <div>
                                <label htmlFor="almacenamiento" className="block text-sm font-medium text-gray-900">Almacenamiento</label>
                                <input
                                    type="text"
                                    id="almacenamiento"
                                    name="almacenamiento"
                                    value={formData.almacenamiento}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 text-gray-900"
                                />
                            </div>
                            <div>
                                <label htmlFor="windows" className="block text-sm font-medium text-gray-900">Versión Windows</label>
                                <input
                                    type="text"
                                    id="windows"
                                    name="windows"
                                    value={formData.windows}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 text-gray-900"
                                />
                            </div>
                            <div>
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

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label htmlFor="powerSupply" className="block text-sm font-medium text-gray-900">Fuente de Poder</label>
                                <input
                                    type="text"
                                    id="powerSupply"
                                    name="powerSupply"
                                    value={formData.powerSupply}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 text-gray-900"
                                />
                            </div>
                            <div>
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
                            <div className='flex flex-col justify-start'>
                                <label htmlFor="gpu" className="block text-sm font-medium text-gray-900 mb-2">Tarjeta Gráfica</label>
                                <div className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        id="gpu"
                                        name="gpu"
                                        checked={formData.gpu}
                                        onChange={handleChange}
                                        className="h-5 w-5 text-blue-600 rounded"
                                    />
                                    <label htmlFor="gpu" className="text-gray-900">Sí / Dedicada</label>
                                </div>
                            </div>
                        </div>

                        {formData.gpu && (
                            <div>
                                <label htmlFor="gpuModel" className="block text-sm font-medium text-gray-900">Modelo de GPU (*)</label>
                                <input
                                    type="text"
                                    id="gpuModel"
                                    name="gpuModel"
                                    value={formData.gpuModel}
                                    onChange={handleChange}
                                    required={formData.gpu}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 text-gray-900"
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* Campos por tipo: Impresora ACTUALIZADOS */}
                {formData.tipoEquipo === 'Impresora' && (
                    <div className='space-y-6 p-4 border rounded-lg bg-gray-50'>
                        <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">Especificaciones de Impresora</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            
                            {/* Campo DRUM (string) */}
                            <div>
                                <label htmlFor="drum" className="block text-sm font-medium text-gray-900">Modelo de Drum</label>
                                <input
                                    type="text"
                                    id="drum"
                                    name="drum"
                                    value={formData.drum}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 text-gray-900"
                                />
                            </div>
                            
                            {/* Campo TONER (string) */}
                            <div>
                                <label htmlFor="toner" className="block text-sm font-medium text-gray-900">Modelo de Toner</label>
                                <input
                                    type="text"
                                    id="toner"
                                    name="toner"
                                    value={formData.toner}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 text-gray-900"
                                />
                            </div>

                            {/* Campo CONEXION (string) */}
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
                                    <option value="Red (Ethernet)">Red (Ethernet)</option>
                                    <option value="WiFi">WiFi</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Campos de Ubicación y Control */}
                <div className='space-y-6 p-4 border rounded-lg bg-yellow-50'>
                    <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">Ubicación y Datos de Control</h3>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                            Dirección / Unidad (*)
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
                            rows={3}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 focus:border-blue-500 focus:ring-blue-500 text-gray-900"
                        />
                    </div>
                </div>

                {/* Mensajes de éxito o error */}
                {message && (
                    <div className={`p-3 rounded-lg text-center font-medium ${message.type === 'success' ? 'bg-green-100 text-green-700 border-green-400' : 'bg-red-100 text-red-700 border-red-400'} border-l-4`}>
                        {message.text}
                    </div>
                )}

                {/* Botones */}
                <div className="flex justify-between pt-4">
                    <button
                        type="button"
                        onClick={onBackToList}
                        className="inline-flex items-center px-6 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-full text-gray-700 bg-white hover:bg-gray-100 transition duration-150"
                    >
                        Volver a la Lista
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center px-6 py-2 border border-transparent shadow-md text-base font-medium rounded-full text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition duration-150 transform hover:scale-[1.02]"
                    >
                        {isSubmitting ? 'Guardando...' : 'Guardar Nuevo Equipo'}
                    </button>
                </div>
            </form>
        </section>
    );
};