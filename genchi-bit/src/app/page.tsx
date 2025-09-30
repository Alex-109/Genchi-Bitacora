// src/App.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FilterSection } from '../components/FilterSection';
import { Toolbar } from '../components/Toolbar';
import { ResultCard } from '../components/ResultCard';
import { NewRecordForm } from '../components/NewRecordForm';

import { FilterOption, SelectedFilters, EquipoDB } from '../types';

// =======================================================================
// 📌 OPCIONES DE FILTRO FIJAS Y ESTADOS INICIALES 
// =======================================================================

type EquipmentType = 'PC' | 'Impresora';

const INITIAL_FILTERS: SelectedFilters = {
    brand: "",
    windows: "",
    cpu: "",
    ram: "",
    almacenamiento: "",
    toner: "",
    drum: "",
    conexion: "",
};

const FIXED_OPTIONS_PC: FilterOption[] = [
    { label: 'Marca', value: 'brand', options: ['HP', 'Dell', 'Lenovo', 'Generico', 'Otros'] },
    { label: 'CPU', value: 'cpu', options: ['i3', 'i5', 'i7', 'Ryzen 3', 'Ryzen 5', 'Otros'] },
    { label: 'RAM', value: 'ram', options: ['2', '4', '8', '16', 'Otros'] },
    { label: 'Almacenamiento', value: 'almacenamiento', options: ['256', '500', '1000', '2000', 'Otros'] }, 
    { label: 'Windows', value: 'windows', options: ['W7', 'W10', 'W11', 'Otros'] },
];

const FIXED_OPTIONS_IMPRESORA: FilterOption[] = [
    { label: 'Marca', value: 'brand', options: ['HP', 'Epson', 'Brother', 'Canon', 'Otros'] },
    { label: 'Conexión', value: 'conexion', options: ['USB', 'Red', 'WiFi', 'Otros'] },
    { label: 'Tóner', value: 'toner', options: ['Laser', 'Inyección', 'Tinta Continua', 'Otros'] },
    { label: 'Drum', value: 'drum', options: ['Requiere', 'No Aplica', 'Otros'] },
];

/**
 * Función auxiliar para obtener la lista de marcas explícitas (excluyendo 'Otros').
 */
const getExplicitBrandList = (type: EquipmentType) => {
    const options = type === 'PC' ? FIXED_OPTIONS_PC : FIXED_OPTIONS_IMPRESORA;
    return options
        .find(f => f.value === 'brand')
        ?.options
        .map(opt => opt.toLowerCase())
        .filter(opt => opt !== 'otros' && opt !== 'todos' && opt !== 'todos') || [];
};

const App = () => {
    const [currentView, setCurrentView] = useState<string>('list');
    const [showFilters, setShowFilters] = useState<boolean>(true);
    
    const [equipoList, setEquipoList] = useState<EquipoDB[]>([]);
    const [filteredEquipoList, setFilteredEquipoList] = useState<EquipoDB[]>([]);
    
    const [isLoading, setIsLoading] = useState<boolean>(true);
    
    const [activeEquipmentType, setActiveEquipmentType] = useState<EquipmentType>('PC');
    const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>(INITIAL_FILTERS);

    const filterOptions = activeEquipmentType === 'PC' ? FIXED_OPTIONS_PC : FIXED_OPTIONS_IMPRESORA;


    const handleFilterChange = useCallback((filterName: keyof SelectedFilters, value: string) => {
        setSelectedFilters(prev => ({ 
            ...prev, 
            [filterName]: value 
        }));
    }, []);

    const handleClearFilters = useCallback(() => {
        setSelectedFilters(INITIAL_FILTERS);
    }, []);

    const handleTypeChange = useCallback((newType: EquipmentType) => {
        setActiveEquipmentType(newType);
        setSelectedFilters(INITIAL_FILTERS);
    }, []);


    const toggleFilters = () => {
        setShowFilters(prev => !prev);
    };

    const handleNewRecordClick = () => {
        setCurrentView('form');
    };

    const handleEquiposClick = () => {
        setCurrentView('list');
    };
    
    const handleRecordCreated = (newRecord: EquipoDB) => {
        setEquipoList(prevList => [newRecord, ...prevList]);
    };
    
    // ... (useEffect de Carga de Datos)
    useEffect(() => {
        const fetchEquipoData = async () => {
            setIsLoading(true);
            // NOTA: Reemplaza esta URL con tu endpoint real si no es local.
            const API_URL = 'http://localhost:5000/api/equipos'; 
            
            try {
                const response = await fetch(API_URL);
                if (!response.ok) {
                    throw new Error(`Error HTTP: ${response.status}`);
                }
                
                const data: EquipoDB[] = await response.json();
                
                const combinedData: EquipoDB[] = (data || [])
                    .map(item => ({
                        ...item,
                        status: item.status || "Pendiente",
                        date: new Date(item.date).toLocaleDateString('es-CL'),
                        ram: item.ram || undefined, 
                        almacenamiento: item.almacenamiento || undefined, 
                    } as EquipoDB)); 
                
                setEquipoList(combinedData);
                setFilteredEquipoList(combinedData);
                
            } catch (error) {
                console.error("Error al cargar los datos:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEquipoData();
    }, []);


    // =======================================================================
    // 4. Lógica de Filtrado (CORREGIDO: Manejo del filtro 'Otros' para Marca)
    // =======================================================================

    useEffect(() => {
        // Pre-calculamos la lista de marcas explícitas para el tipo activo
        const explicitBrands = getExplicitBrandList(activeEquipmentType);

        const newFilteredList = equipoList.filter(equipo => {
            // 1. Filtrar por TIPO DE EQUIPO ACTIVO
            const matchType = equipo.tipo_equipo && equipo.tipo_equipo.toLowerCase() === activeEquipmentType.toLowerCase();
            if (!matchType) return false;

            // 2. Filtrar por MARCA (Lógica mejorada para manejar 'Otros')
            const selectedBrand = selectedFilters.brand;
            const equipmentBrand = equipo.marca || '';
            const equipmentBrandLower = equipmentBrand.toLowerCase();
            let matchBrand = false;

            if (selectedBrand === "" || selectedBrand === "Todos") {
                // Si no hay filtro, mostrar todo
                matchBrand = true;
            } else if (selectedBrand.toLowerCase() === "otros") {
                // Si se seleccionó 'Otros', el equipo coincide si:
                // a) El campo de marca NO está vacío, Y
                // b) La marca NO se encuentra en la lista de marcas explícitas (HP, Dell, etc.)
                matchBrand = equipmentBrand !== '' && 
                             !explicitBrands.includes(equipmentBrandLower);
            } else {
                // Coincidencia exacta (HP, Dell, etc.)
                matchBrand = equipmentBrandLower === selectedBrand.toLowerCase();
            }
            
            if (!matchBrand) return false;


            // 3. Filtrar por ATRIBUTOS ESPECÍFICOS DE PC
            if (activeEquipmentType === 'PC') {
                
                // Windows (Insensible a Mayúsculas/Minúsculas - Usa ver_win de la DB)
                const selectedWindows = selectedFilters.windows;
                const equipmentWindows = equipo.ver_win || ''; 
                const matchWindows = selectedWindows === "" || equipmentWindows.toLowerCase() === selectedWindows.toLowerCase();
                
                // CPU (Mantenido con comparación estricta)
                const selectedCpu = selectedFilters.cpu;
                const equipmentCpu = equipo.cpu || '';
                const matchCpu = selectedCpu === "" || equipmentCpu === selectedCpu; 

                // RAM (Lógica de Comparación Numérica)
                const selectedRam = selectedFilters.ram; 
                const equipmentRam = equipo.ram; 
                let matchRam = false;

                if (selectedRam === "" || selectedRam === "Todos") {
                    matchRam = true;
                } else if (selectedRam === "Otros") {
                    matchRam = (String(equipmentRam) === "Otros"); 
                } else {
                    const selectedRamNum = parseInt(selectedRam, 10);
                    const equipmentRamNum = typeof equipmentRam === 'number' 
                        ? equipmentRam 
                        : parseInt(String(equipmentRam), 10);
                    
                    matchRam = equipmentRamNum === selectedRamNum;
                }
                
                // Almacenamiento (Lógica de Comparación Numérica)
                const selectedStorage = selectedFilters.almacenamiento; 
                const equipmentStorage = equipo.almacenamiento; 
                let matchStorage = false;

                if (selectedStorage === "" || selectedStorage === "Todos") {
                    matchStorage = true;
                } else if (selectedStorage === "Otros") {
                    matchStorage = (String(equipmentStorage) === "Otros"); 
                } else {
                    const selectedStorageNum = parseInt(selectedStorage, 10);
                    const equipmentStorageNum = typeof equipmentStorage === 'number' 
                        ? equipmentStorage 
                        : parseInt(String(equipmentStorage), 10);
                    
                    matchStorage = equipmentStorageNum === selectedStorageNum;
                }

                return matchWindows && matchCpu && matchRam && matchStorage;
            } 
            
            // 4. Filtrar por ATRIBUTOS ESPECÍFICOS DE IMPRESORA
            if (activeEquipmentType === 'Impresora') {
                // Toner
                const selectedToner = selectedFilters.toner;
                const equipmentToner = equipo.toner || '';
                const matchToner = selectedToner === "" || equipmentToner === selectedToner;

                // Drum
                const selectedDrum = selectedFilters.drum;
                const equipmentDrum = equipo.drum || '';
                const matchDrum = selectedDrum === "" || equipmentDrum === selectedDrum;
                
                // Conexión
                const selectedConexion = selectedFilters.conexion;
                const equipmentConexion = equipo.conexion || '';
                const matchConexion = selectedConexion === "" || equipmentConexion === selectedConexion; 
                
                return matchToner && matchDrum && matchConexion;
            }

            return true; 
        });

        setFilteredEquipoList(newFilteredList);
    }, [selectedFilters, equipoList, activeEquipmentType]);
    

    // =======================================================================
    // 5. Renderizado
    // =======================================================================

    return (
        <main className="p-8 bg-gray-100 min-h-screen">
            <div className="flex flex-col lg:flex-row space-y-8 lg:space-y-0 lg:space-x-8 max-w-6xl mx-auto">
                <section className="w-full lg:w-full">
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <header className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-800">Sistema de Inventario de Activos</h1>
                            <p className="text-gray-500 mt-1">Gestiona el inventario de PCs e Impresoras</p>
                        </header>

                        <Toolbar 
                            onNewRecordClick={handleNewRecordClick} 
                            onEquiposClick={handleEquiposClick}
                            currentView={currentView}
                            toggleFilters={toggleFilters} 
                        />
                        
                        {currentView === 'list' && (
                            <>
                                <FilterSection
                                    showFilters={showFilters}
                                    toggleFilters={toggleFilters}
                                    filterData={filterOptions} 
                                    isLoading={isLoading}
                                    selectedFilters={selectedFilters}
                                    handleFilterChange={handleFilterChange}
                                    handleClearFilters={handleClearFilters}
                                    activeEquipmentType={activeEquipmentType} 
                                    handleTypeChange={handleTypeChange}
                                />
                                <section className="space-y-4 mt-8">
                                    {isLoading ? (
                                        <div className="text-center text-gray-500 py-10">Cargando equipos...</div>
                                    ) : filteredEquipoList.length > 0 ? (
                                        filteredEquipoList.map((equipo, index) => (
                                            <ResultCard key={equipo._id || index} equipo={equipo} /> 
                                        ))
                                    ) : (
                                        <div className="text-center text-gray-500 py-10">
                                            <p>No se encontraron resultados que coincidan con los filtros de {activeEquipmentType}.</p>
                                        </div>
                                    )}
                                </section>
                            </>
                        )}
                        
                        {currentView === 'form' && (
                            <NewRecordForm 
                                onBackToList={handleEquiposClick}
                                onRecordCreated={handleRecordCreated}
                            />
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
};

export default App;
