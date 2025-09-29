'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FilterSection } from '../components/FilterSection';
import { Toolbar } from '../components/Toolbar';
import { ResultCard } from '../components/ResultCard';
import { NewRecordForm } from '../components/NewRecordForm';

import { FilterOption, SelectedFilters, EquipoCombined, EquipoDB } from '../types';

const App = () => {
    const [currentView, setCurrentView] = useState<string>('list');
    const [showFilters, setShowFilters] = useState<boolean>(true);
    
    const [equipoList, setEquipoList] = useState<EquipoCombined[]>([]);
    const [filteredEquipoList, setFilteredEquipoList] = useState<EquipoCombined[]>([]);
    
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [filterOptions, setFilterOptions] = useState<FilterOption[]>([]);

    const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
        brand: "Todas las marcas",
        windows: "Todas las versiones",
        cpu: "Todos los CPUs",
        ram: "Todas las capacidades",
        gpu: "Con o sin GPU",
        status: "Todos los estados",
    });

    // =======================================================================
    // 📌 FUNCIONES DE MANEJO DE VISTA Y ESTADO
    // =======================================================================

    const handleFilterChange = useCallback((filterName: keyof SelectedFilters, value: string) => {
        setSelectedFilters(prev => ({ ...prev, [filterName]: value }));
    }, []);

    const handleClearFilters = useCallback(() => {
        setSelectedFilters({
            brand: "Todas las marcas",
            windows: "Todas las versiones",
            cpu: "Todos los CPUs",
            ram: "Todas las capacidades",
            gpu: "Con o sin GPU",
            status: "Todos los estados",
        });
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
    
    const handleRecordCreated = (newRecord: EquipoCombined) => {
        setEquipoList(prevList => [newRecord, ...prevList]);
        setFilteredEquipoList(prevList => [newRecord, ...prevList]); 
    };


    // =======================================================================
    // 1. useEffect: Carga de Datos y Generación de Filtros
    // =======================================================================

    useEffect(() => {
        const fetchEquipoData = async () => {
            setIsLoading(true);
            const API_URL = 'http://localhost:5000/api/equipos'; 
            
            try {
                const response = await fetch(API_URL);
                
                if (!response.ok) {
                    throw new Error(`Error HTTP: ${response.status}`);
                }
                
                const data: EquipoDB[] = await response.json();
                
                const combinedData: EquipoCombined[] = (data || [])
                    .map(item => ({
                        ...item,
                        brand: item.marca,
                        status: item.status || "Pendiente",
                        date: new Date().toLocaleDateString('es-CL'),
                    } as EquipoCombined)); 
                
                setEquipoList(combinedData);
                setFilteredEquipoList(combinedData);
                
                // Lógica para generar opciones de filtro
                const brands = [...new Set(combinedData.map(e => e.marca))].filter(b => b).sort();
                const statuses = [...new Set(combinedData.map(e => e.status || 'N/A'))].filter(s => s).sort();
                
                const pcItems = combinedData.filter(e => e.tipo_equipo && e.tipo_equipo.toLowerCase() === 'pc');
                const windowsVersions = [...new Set(pcItems.map(e => e.ver_win || 'N/A'))].filter(w => w !== 'N/A').sort();
                const cpus = [...new Set(pcItems.map(e => e.cpu || 'N/A'))].filter(c => c !== 'N/A').sort();
                const rams = [...new Set(pcItems.map(e => e.ram || 'N/A'))].filter(r => r !== 'N/A').sort();
                
                const gpuExists = pcItems.some(e => e.gpu);
                const gpus = gpuExists ? ["Con GPU"] : []; 

                const newFilterOptions: FilterOption[] = [
                    { label: "Marca", value: "brand", options: ["Todas las marcas", ...brands] },
                    { label: "Estado", value: "status", options: ["Todos los estados", ...statuses] },
                    { label: "Windows", value: "windows", options: ["Todas las versiones", ...windowsVersions] },
                    { label: "CPU", value: "cpu", options: ["Todos los CPUs", ...cpus] },
                    { label: "RAM", value: "ram", options: ["Todas las capacidades", ...rams] },
                    { label: "GPU", value: "gpu", options: ["Con o sin GPU", ...gpus] },
                ];
                setFilterOptions(newFilterOptions);
                
            } catch (error) {
                console.error("Error al cargar los datos:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchEquipoData();
    }, []);


    // =======================================================================
    // 2. useEffect: Lógica de Filtrado
    // =======================================================================

    useEffect(() => {
        const newFilteredList = equipoList.filter(equipo => {
            // Filtrado de campos comunes
            const matchBrand = selectedFilters.brand === "Todas las marcas" || equipo.brand === selectedFilters.brand;
            const matchStatus = selectedFilters.status === "Todos los estados" || equipo.status === selectedFilters.status;

            const isPC = equipo.tipo_equipo && equipo.tipo_equipo.toLowerCase() === 'pc';
            
            let matchWindows = true;
            let matchCpu = true;
            let matchRam = true;
            let matchGpu = true;
            
            if (isPC) {
                matchWindows = selectedFilters.windows === "Todas las versiones" || equipo.ver_win === selectedFilters.windows;
                matchCpu = selectedFilters.cpu === "Todos los CPUs" || equipo.cpu === selectedFilters.cpu; 
                matchRam = selectedFilters.ram === "Todas las capacidades" || equipo.ram === selectedFilters.ram; 
                
                // 📌 CORRECCIÓN: Usar doble negación (!!) para asegurar un boolean estricto.
                const hasGpu = !!(equipo.gpu && equipo.gpuModel); 
                
                matchGpu = selectedFilters.gpu === "Con o sin GPU" || (
                    selectedFilters.gpu === "Con GPU" && hasGpu
                );
            }

            return matchBrand && matchStatus && matchWindows && matchCpu && matchRam && matchGpu;
        });

        setFilteredEquipoList(newFilteredList);
    }, [selectedFilters, equipoList]);
    

    // =======================================================================
    // 3. Renderizado
    // =======================================================================

    return (
        <main className="p-8 bg-gray-100 min-h-screen">
            <div className="flex flex-col lg:flex-row space-y-8 lg:space-y-0 lg:space-x-8 max-w-6xl mx-auto">
                <section className="w-full lg:w-full">
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <header className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-800">Sistema de Inventario de Activos</h1>
                            <p className="text-gray-500 mt-1">Gestiona el inventario de PCs, Laptops e Impresoras</p>
                        </header>

                        <Toolbar 
                            onNewRecordClick={handleNewRecordClick} 
                            onEquiposClick={handleEquiposClick}
                            currentView={currentView}
                            toggleFilters={toggleFilters} 
                        />
                        
                        {/* Renderizado condicional de la vista */}
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
                                            <p>No se encontraron resultados que coincidan con los filtros.</p>
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