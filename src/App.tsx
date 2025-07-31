import React, { useState, useEffect } from 'react';
import { useSearchParams } from './hooks/useSearchParams';
import { useOfflineResponsibles, useOfflineVehicles, useOfflineFuelRecords } from './hooks/useOfflineFirebase';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import FuelForm from './components/FuelForm';
import FuelList from './components/FuelList';
import FuelModal from './components/FuelModal';
import ResponsibleForm from './components/ResponsibleForm';
import ResponsibleList from './components/ResponsibleList';
import VehicleForm from './components/VehicleForm';
import VehicleList from './components/VehicleList';
import Reports from './components/Reports';
import OfflineIndicator from './components/OfflineIndicator';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import type { FuelRecord } from './types';

function App() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => {
    // Verificar se há parâmetro de tab na URL (para shortcuts do PWA)
    return searchParams.get('tab') || 'dashboard';
  });
  const [editingRecord, setEditingRecord] = useState<FuelRecord | null>(null);
  const [viewingRecord, setViewingRecord] = useState<FuelRecord | null>(null);
  const [highlightedRecordId, setHighlightedRecordId] = useState<string | undefined>();
  
  // Usar hooks offline do Firebase
  const { 
    responsibles, 
    loading: responsiblesLoading, 
    error: responsiblesError,
    addResponsible, 
    deleteResponsible 
  } = useOfflineResponsibles();
  
  const { 
    vehicles, 
    loading: vehiclesLoading, 
    error: vehiclesError,
    addVehicle, 
    deleteVehicle 
  } = useOfflineVehicles();
  
  const { 
    fuelRecords, 
    loading: fuelRecordsLoading, 
    error: fuelRecordsError,
    addFuelRecord, 
    updateFuelRecord, 
    deleteFuelRecord 
  } = useOfflineFuelRecords();

  const handleAddResponsible = async (responsibleData: { name: string; phone: string }) => {
    try {
      await addResponsible(responsibleData);
      alert('Responsável cadastrado com sucesso!');
    } catch (error) {
      alert('Erro ao cadastrar responsável. Tente novamente.');
    }
  };

  const handleDeleteResponsible = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este responsável?')) {
      try {
        await deleteResponsible(id);
        alert('Responsável excluído com sucesso!');
      } catch (error) {
        alert('Erro ao excluir responsável. Tente novamente.');
      }
    }
  };

  const handleAddVehicle = async (vehicleData: { plate: string; model: string }) => {
    try {
      await addVehicle(vehicleData);
      alert('Veículo cadastrado com sucesso!');
    } catch (error) {
      alert('Erro ao cadastrar veículo. Tente novamente.');
    }
  };

  const handleDeleteVehicle = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este veículo?')) {
      try {
        await deleteVehicle(id);
        alert('Veículo excluído com sucesso!');
      } catch (error) {
        alert('Erro ao excluir veículo. Tente novamente.');
      }
    }
  };

  const handleAddFuelRecord = async (recordData: Omit<FuelRecord, 'id' | 'createdAt'>) => {
    try {
      if (editingRecord) {
        // Editando registro existente
        // Preservar a data original ao editar
        const updateData = {
          ...recordData,
          date: editingRecord.date // Manter a data original
        };
        await updateFuelRecord(editingRecord.id, updateData);
        setEditingRecord(null);
        alert('Abastecimento atualizado com sucesso!');
      } else {
        // Criando novo registro
        await addFuelRecord(recordData);
        alert('Abastecimento registrado com sucesso!');
      }
    } catch (error) {
      alert('Erro ao salvar abastecimento. Tente novamente.');
    }
  };

  const editFuelRecord = (record: FuelRecord) => {
    setEditingRecord(record);
    setActiveTab('fuel');
  };

  const handleDeleteFuelRecord = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este abastecimento?')) {
      try {
        await deleteFuelRecord(id);
        alert('Abastecimento excluído com sucesso!');
      } catch (error) {
        alert('Erro ao excluir abastecimento. Tente novamente.');
      }
    }
  };

  const viewFuelRecord = (record: FuelRecord) => {
    setViewingRecord(record);
  };

  const navigateToFuel = (recordId?: string) => {
    setHighlightedRecordId(recordId);
    setActiveTab('fuel-list');
  };

  const cancelEdit = () => {
    setEditingRecord(null);
  };

  // Loading state
  const isLoading = responsiblesLoading || vehiclesLoading || fuelRecordsLoading;

  // Error handling
  const hasError = responsiblesError || vehiclesError || fuelRecordsError;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-white text-lg">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-6 max-w-md">
            <h2 className="text-red-400 text-xl font-bold mb-2">Erro de Conexão</h2>
            <p className="text-gray-300 mb-4">
              Não foi possível conectar ao Firebase. Verifique sua conexão com a internet.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            fuelRecords={fuelRecords}
            responsibles={responsibles}
            vehicles={vehicles}
            onNavigateToFuel={navigateToFuel}
          />
        );
      
      case 'fuel':
        return (
          <div className="space-y-6">
            {editingRecord && (
              <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
                <p className="text-yellow-400 font-medium">
                  Editando abastecimento de {new Date(editingRecord.date).toLocaleDateString('pt-BR')}
                </p>
                <button
                  onClick={cancelEdit}
                  className="mt-2 text-sm text-yellow-300 hover:text-yellow-200 underline"
                >
                  Cancelar edição
                </button>
              </div>
            )}
            <FuelForm 
              responsibles={responsibles}
              vehicles={vehicles}
              fuelRecords={fuelRecords}
              onAdd={handleAddFuelRecord}
              editingRecord={editingRecord}
            />
            {responsibles.length === 0 && (
              <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
                <p className="text-yellow-400">
                  <strong>Atenção:</strong> Você precisa cadastrar pelo menos um responsável antes de registrar abastecimentos.
                </p>
              </div>
            )}
            {vehicles.length === 0 && (
              <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
                <p className="text-yellow-400">
                  <strong>Atenção:</strong> Você precisa cadastrar pelo menos um veículo antes de registrar abastecimentos.
                </p>
              </div>
            )}
          </div>
        );
      
      case 'fuel-list':
        return (
          <FuelList
            fuelRecords={fuelRecords}
            responsibles={responsibles}
            vehicles={vehicles}
            onEdit={editFuelRecord}
            onDelete={handleDeleteFuelRecord}
            onView={viewFuelRecord}
            highlightedRecordId={highlightedRecordId}
          />
        );
      
      case 'vehicles':
        return (
          <div className="space-y-6">
            <VehicleForm onAdd={handleAddVehicle} />
            <VehicleList vehicles={vehicles} onDelete={handleDeleteVehicle} />
          </div>
        );
      
      case 'responsibles':
        return (
          <div className="space-y-6">
            <ResponsibleForm onAdd={handleAddResponsible} />
            <ResponsibleList responsibles={responsibles} onDelete={handleDeleteResponsible} />
          </div>
        );
      
      case 'reports':
        return (
          <Reports 
            fuelRecords={fuelRecords}
            responsibles={responsibles}
            vehicles={vehicles}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 overflow-x-hidden">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-8 overflow-x-hidden">
        {renderContent()}
      </main>
      
      {/* Modal de Visualização */}
      {viewingRecord && (
        <FuelModal
          record={viewingRecord}
          responsible={responsibles.find(r => r.id === viewingRecord.responsibleId)}
          vehicle={vehicles.find(v => v.id === viewingRecord.vehicleId)}
          isOpen={!!viewingRecord}
          onClose={() => setViewingRecord(null)}
        />
      )}
      
      {/* Indicadores PWA */}
      <OfflineIndicator />
      <PWAInstallPrompt />
    </div>
  );
}

export default App;
