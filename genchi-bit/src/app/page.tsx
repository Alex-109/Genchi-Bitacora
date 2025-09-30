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
    toner: "", // Se mantiene en INITIAL_FILTERS por tipado, pero no se usa en la UI
    drum: "",   // Se mantiene en INITIAL_FILTERS por tipado, pero no se usa en la UI
    conexion: "",
};

const FIXED_OPTIONS_PC: FilterOption[] = [
    { label: 'Marca', value: 'brand', options: ['HP', 'Dell', 'Lenovo', 'Generico', 'Otros'] },
    // Opciones de CPU simplificadas para coincidencia
    { label: 'CPU', value: 'cpu', options: ['i3', 'i5', 'i7', 'Ryzen 3', 'Ryzen 5', 'Otros'] },
    { label: 'RAM', value: 'ram', options: ['2', '4', '8', '16', 'Otros'] },
    { label: 'Almacenamiento', value: 'almacenamiento', options: ['256', '500', '1000', '2000', 'Otros'] }, 
    { label: 'Windows', value: 'windows', options: ['W7', 'W10', 'W11', 'Otros'] },
];

const FIXED_OPTIONS_IMPRESORA: FilterOption[] = [
    { label: 'Marca', value: 'brand', options: ['HP', 'Epson', 'Brother', 'Canon', 'Otros'] },
    // *** CAMBIO A ETHERNET EN EL FILTRO ***
    { label: 'Conexión', value: 'conexion', options: ['USB', 'Ethernet', 'WiFi', 'Otros'] },
    // Tóner y Drum eliminados de las opciones de filtro visible
];

/**
 * Función auxiliar para obtener la lista de opciones explícitas (excluyendo 'Otros' y 'Todos').
 */
const getExplicitOptionsList = (type: EquipmentType, filterKey: keyof SelectedFilters) => {
    const options = type === 'PC' ? FIXED_OPTIONS_PC : FIXED_OPTIONS_IMPRESORA;
    return options
        .find(f => f.value === filterKey)
        ?.options
        .map(opt => String(opt).toLowerCase())
        .filter(opt => opt !== 'otros' && opt !== 'todos' && opt !== '') || [];
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
                        // Aseguramos que los campos RAM y Almacenamiento existan
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
    // 4. Lógica de Filtrado (Adaptada a "Ethernet")
    // =======================================================================

    useEffect(() => {
        // Obtenemos listas de opciones explícitas
        const explicitBrands = getExplicitOptionsList(activeEquipmentType, 'brand');
        const explicitCPUs = getExplicitOptionsList('PC', 'cpu');

        const newFilteredList = equipoList.filter(equipo => {
            // 1. Filtrar por TIPO DE EQUIPO ACTIVO
            const matchType = equipo.tipo_equipo && equipo.tipo_equipo.toLowerCase() === activeEquipmentType.toLowerCase();
            if (!matchType) return false;

            // 2. Filtrar por MARCA
            const selectedBrand = selectedFilters.brand;
            const equipmentBrand = equipo.marca || '';
            const equipmentBrandLower = equipmentBrand.toLowerCase();
            let matchBrand = false;

            if (selectedBrand === "" || selectedBrand === "Todos") {
                matchBrand = true;
            } else if (selectedBrand.toLowerCase() === "otros") {
                // Coincide si la marca no está vacía Y no es una de las marcas explícitas
                matchBrand = equipmentBrand !== '' && 
                             !explicitBrands.includes(equipmentBrandLower);
            } else {
                // Coincidencia exacta de marca (ej: 'HP')
                matchBrand = equipmentBrandLower === selectedBrand.toLowerCase();
            }
            
            if (!matchBrand) return false;


            // 3. Filtrar por ATRIBUTOS ESPECÍFICOS DE PC
            if (activeEquipmentType === 'PC') {
                
                // Windows 
                const selectedWindows = selectedFilters.windows;
                const equipmentWindows = equipo.ver_win || ''; 
                const matchWindows = selectedWindows === "" || equipmentWindows.toLowerCase() === selectedWindows.toLowerCase();
                
                // CPU
                const selectedCpu = selectedFilters.cpu;
                const equipmentCpu = equipo.cpu || '';
                const equipmentCpuLower = equipmentCpu.toLowerCase();
                let matchCpu = false;

                if (selectedCpu === "" || selectedCpu === "Todos") {
                    matchCpu = true;
                } else if (selectedCpu.toLowerCase() === "otros") {
                    const isExplicit = explicitCPUs.some(cpuOpt => equipmentCpuLower.includes(cpuOpt));
                    const isMissingOrEmpty = equipmentCpu === undefined || equipmentCpu === null || equipmentCpu === '';
                    matchCpu = isMissingOrEmpty || (!isExplicit && equipmentCpu !== ''); 

                } else {
                    matchCpu = equipmentCpuLower.includes(selectedCpu.toLowerCase());
                }
                
                if (!matchCpu) return false;

                // RAM
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
                
                if (!matchRam) return false;

                // Almacenamiento 
                const selectedStorage = selectedFilters.almacenamiento; 
                const equipmentStorage = equipo.almacenamiento; 

                let matchStorage = false;
                const explicitStorage = getExplicitOptionsList('PC', 'almacenamiento');

                if (selectedStorage === "" || selectedStorage === "Todos") {
                    matchStorage = true;
                } else if (selectedStorage.toLowerCase() === "otros") {
                    // Consideramos cualquier valor que no esté en los típicos
                    const equipmentStorageNum = typeof equipmentStorage === 'number' ? equipmentStorage : parseInt(String(equipmentStorage), 10);
                    const isExplicitlyListed = explicitStorage.includes(String(equipmentStorageNum));
                    matchStorage = !isExplicitlyListed;
                } else {
                    // Comparamos los valores numéricos aproximando a los típicos
                    const selectedStorageNum = parseInt(selectedStorage, 10);
                    const equipmentStorageNum = typeof equipmentStorage === 'number' ? equipmentStorage : parseInt(String(equipmentStorage), 10);
                    // Aceptamos ±20 GB de diferencia
                    matchStorage = Math.abs(equipmentStorageNum - selectedStorageNum) <= 20;
                }

                
                return matchWindows && matchCpu && matchRam && matchStorage;
            } 
            
            // 4. Filtrar por ATRIBUTOS ESPECÍFICOS DE IMPRESORA
            if (activeEquipmentType === 'Impresora') {
                // Solo mantenemos la conexión. Los campos toner y drum se ignoran.

                // Conexión
                const selectedConexion = selectedFilters.conexion;
                const equipmentConexion = equipo.conexion || '';
                const equipmentConexionLower = equipmentConexion.toLowerCase();
                const selectedConexionLower = selectedConexion.toLowerCase();
                
                let matchConexion = false;
                
                if (selectedConexion === "" || selectedConexion === "Todos") {
                    matchConexion = true;
                } else if (selectedConexionLower === "ethernet") {
                    // Coincide si contiene 'red' o 'ethernet' pero NO 'wifi'
                    const isWiredNetwork = equipmentConexionLower.includes('red') || equipmentConexionLower.includes('ethernet');
                    matchConexion = isWiredNetwork && !equipmentConexionLower.includes('wifi');
                } else if (selectedConexionLower === "wifi") {
                    // Coincidencia estricta para 'wifi'
                    matchConexion = equipmentConexionLower.includes('wifi');
                } else if (selectedConexionLower === "usb") {
                    // Coincidencia estricta para 'usb'
                    matchConexion = equipmentConexionLower.includes('usb');
                } else {
                    // Coincidencia exacta para otras opciones o 'Otros'
                    matchConexion = equipmentConexionLower === selectedConexionLower;
                }
                
                return matchConexion;
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
                            {/* Ajuste de color para mejor contraste */}
                            <p className="text-gray-700 mt-1">Gestiona el inventario de PCs e Impresoras</p>
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
                                        /* Ajuste de color para mejor contraste en estado de carga */
                                        <div className="text-center text-gray-700 py-10">Cargando equipos...</div>
                                    ) : filteredEquipoList.length > 0 ? (
                                        filteredEquipoList.map((equipo, index) => (
                                            <ResultCard key={equipo._id || index} equipo={equipo} /> 
                                        ))
                                    ) : (
                                        /* Ajuste de color para mejor contraste en mensaje de no resultados */
                                        <div className="text-center text-gray-700 py-10">
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
