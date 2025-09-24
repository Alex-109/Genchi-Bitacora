// src/app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { FilterSection } from '../components/FilterSection';
import { Toolbar } from '../components/Toolbar';
import { ResultCard } from '../components/ResultCard';
import { NewRecordForm } from '../components/NewRecordForm';
import { SupabaseAuthButtons } from '../components/SupabaseAuthButtons';
import { FilterOption, SelectedFilters, PcCombined, EquipoDB, PcDB } from '../types';
import { supabase } from '../lib/supabaseClient';

const App = () => {
    const [currentView, setCurrentView] = useState<string>('list');
    const [showFilters, setShowFilters] = useState<boolean>(true);
    const [pcList, setPcList] = useState<PcCombined[]>([]);
    const [filteredPcList, setFilteredPcList] = useState<PcCombined[]>([]);
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

    useEffect(() => {
        const fetchPcData = async () => {
            setIsLoading(true);
            
            const { data, error } = await supabase
                .from('equipo')
                .select(`
                    *,
                    pc(*)
                `);
                
            if (error) {
                console.error("Error al cargar los datos:", error.message);
                setIsLoading(false);
                return;
            }

            const combinedData: PcCombined[] = (data || []).map(item => {
                const pc = item.pc as PcDB;
                
                return {
                    ...item,
                    ...pc,
                    brand: item.marca,
                    status: "Pendiente",
                    date: new Date().toISOString().slice(0, 10),
                } as PcCombined;
            });

            setPcList(combinedData);
            setFilteredPcList(combinedData);
            setIsLoading(false);
            
            const brands = [...new Set(combinedData.map(pc => pc.brand))].sort();
            const windowsVersions = [...new Set(combinedData.map(pc => pc.ver_win || 'N/A'))].sort();
            const cpus = [...new Set(combinedData.map(pc => pc.specs?.cpu || 'N/A'))].sort();
            const rams = [...new Set(combinedData.map(pc => pc.specs?.ram || 'N/A'))].sort();
            const gpus = [...new Set(combinedData.map(pc => pc.specs?.gpu || 'N/A'))].sort();
            const statuses = [...new Set(combinedData.map(pc => pc.status || 'N/A'))].sort();
            
            const newFilterOptions: FilterOption[] = [
                { label: "Marca", value: "brand", options: ["Todas las marcas", ...brands] },
                { label: "Windows", value: "windows", options: ["Todas las versiones", ...windowsVersions] },
                { label: "CPU", value: "cpu", options: ["Todos los CPUs", ...cpus] },
                { label: "RAM", value: "ram", options: ["Todas las capacidades", ...rams] },
                { label: "GPU", value: "gpu", options: ["Con o sin GPU", ...gpus] },
                { label: "Estado", value: "status", options: ["Todos los estados", ...statuses] }
            ];
            setFilterOptions(newFilterOptions);
        };

        fetchPcData();
    }, []);

    useEffect(() => {
        const newFilteredList = pcList.filter(pc => {
            const matchBrand = selectedFilters.brand === "Todas las marcas" || pc.brand === selectedFilters.brand;
            const matchWindows = selectedFilters.windows === "Todas las versiones" || pc.ver_win === selectedFilters.windows;
            const matchCpu = selectedFilters.cpu === "Todos los CPUs" || (pc.specs?.cpu === selectedFilters.cpu);
            const matchRam = selectedFilters.ram === "Todas las capacidades" || (pc.specs?.ram === selectedFilters.ram);
            const matchGpu = selectedFilters.gpu === "Con o sin GPU" || (pc.specs?.gpu === selectedFilters.gpu);
            const matchStatus = selectedFilters.status === "Todos los estados" || pc.status === selectedFilters.status;

            return matchBrand && matchWindows && matchCpu && matchRam && matchGpu && matchStatus;
        });

        setFilteredPcList(newFilteredList);
    }, [selectedFilters, pcList]);

    const toggleFilters = () => {
        setShowFilters(!showFilters);
    };

    const handleFilterChange = (filterName: keyof SelectedFilters, value: string) => {
        setSelectedFilters(prevFilters => ({
            ...prevFilters,
            [filterName]: value
        }));
    };

    const handleClearFilters = () => {
        setSelectedFilters({
            brand: "Todas las marcas",
            windows: "Todas las versiones",
            cpu: "Todos los CPUs",
            ram: "Todas las capacidades",
            gpu: "Con o sin GPU",
            status: "Todos los estados",
        });
    };

    const handleNewRecordClick = () => {
        setCurrentView('form');
    };

    const handleEquiposClick = () => {
        setCurrentView('list');
    };
    
    const handleRecordCreated = (newRecord: PcCombined) => {
        setPcList(prevList => [newRecord, ...prevList]);
    };

    return (
        <main className="p-8 bg-gray-100 min-h-screen">
            <div className="flex flex-col lg:flex-row space-y-8 lg:space-y-0 lg:space-x-8 max-w-6xl mx-auto">
                <section className="w-full lg:w-3/4">
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                        <header className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-800">Sistema de Registro de Reparaciones PC</h1>
                            <p className="text-gray-500 mt-1">Gestiona y realiza seguimiento de las reparaciones de equipos de cómputo</p>
                        </header>

                        <Toolbar 
                            onNewRecordClick={handleNewRecordClick} 
                            onEquiposClick={handleEquiposClick}
                            currentView={currentView}
                            toggleFilters={toggleFilters}
                        />
                        
                        {currentView === 'list' ? (
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

                                <section className="text-gray-600 text-sm font-semibold mb-4">
                                    Se encontraron {filteredPcList.length} equipos
                                </section>

                                <section className="space-y-4">
                                    {isLoading ? (
                                        <div className="text-center text-gray-500 py-10">Cargando equipos...</div>
                                    ) : filteredPcList.length > 0 ? (
                                        filteredPcList.map((pc, index) => (
                                            <ResultCard key={index} pc={pc} />
                                        ))
                                    ) : (
                                        <div className="text-center text-gray-500 py-10">
                                            <p>No se encontraron resultados que coincidan con los filtros.</p>
                                        </div>
                                    )}
                                </section>
                            </>
                        ) : (
                            <NewRecordForm 
                                onBackToList={handleEquiposClick}
                                onRecordCreated={handleRecordCreated}
                            />
                        )}
                    </div>
                </section>

                <SupabaseAuthButtons />
            </div>
        </main>
    );
};

export default App;