import { useState, useEffect, useCallback } from 'react';
import { useOfflineSync } from './useOfflineSync';
import { 
  responsibleService, 
  vehicleService, 
  fuelRecordService 
} from '../services/firebaseService';
import type { Responsible, Vehicle, FuelRecord } from '../types';

// Hook para responsáveis com suporte offline
export const useOfflineResponsibles = () => {
  const [responsibles, setResponsibles] = useState<Responsible[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    isOnline, 
    getOfflineData, 
    saveOfflineData, 
    addToPendingSync 
  } = useOfflineSync();

  const loadResponsibles = useCallback(async () => {
    try {
      setLoading(true);
      
      if (isOnline) {
        // Online: buscar do Firebase
        const data = await responsibleService.getAll();
        setResponsibles(data);
        
        // Salvar no cache offline
        const offlineData = getOfflineData();
        offlineData.responsibles = data;
        saveOfflineData(offlineData);
      } else {
        // Offline: buscar do cache local
        const offlineData = getOfflineData();
        setResponsibles(offlineData.responsibles);
      }
      
      setError(null);
    } catch (err) {
      setError('Erro ao carregar responsáveis');
      console.error(err);
      
      // Em caso de erro online, tentar cache offline
      if (isOnline) {
        const offlineData = getOfflineData();
        setResponsibles(offlineData.responsibles);
      }
    } finally {
      setLoading(false);
    }
  }, [isOnline, getOfflineData, saveOfflineData]);

  const addResponsible = useCallback(async (responsible: Omit<Responsible, 'id' | 'createdAt'>) => {
    try {
      if (isOnline) {
        // Online: salvar no Firebase
        await responsibleService.add(responsible);
        await loadResponsibles();
      } else {
        // Offline: adicionar ao cache local e à fila de sincronização
        const newResponsible: Responsible = {
          ...responsible,
          id: `offline_${Date.now()}_${Math.random()}`,
          createdAt: new Date()
        };
        
        const offlineData = getOfflineData();
        offlineData.responsibles.unshift(newResponsible);
        saveOfflineData(offlineData);
        
        // Adicionar à fila de sincronização
        addToPendingSync('responsibles', responsible);
        
        setResponsibles(offlineData.responsibles);
      }
    } catch (err) {
      setError('Erro ao adicionar responsável');
      throw err;
    }
  }, [isOnline, loadResponsibles, getOfflineData, saveOfflineData, addToPendingSync]);

  const deleteResponsible = useCallback(async (id: string) => {
    try {
      if (isOnline && !id.startsWith('offline_')) {
        // Online: deletar do Firebase
        await responsibleService.delete(id);
        await loadResponsibles();
      } else {
        // Offline ou item offline: remover apenas do cache local
        const offlineData = getOfflineData();
        offlineData.responsibles = offlineData.responsibles.filter(r => r.id !== id);
        saveOfflineData(offlineData);
        setResponsibles(offlineData.responsibles);
      }
    } catch (err) {
      setError('Erro ao deletar responsável');
      throw err;
    }
  }, [isOnline, loadResponsibles, getOfflineData, saveOfflineData]);

  useEffect(() => {
    loadResponsibles();
  }, [loadResponsibles]);

  return {
    responsibles,
    loading,
    error,
    addResponsible,
    deleteResponsible,
    reload: loadResponsibles
  };
};

// Hook para veículos com suporte offline
export const useOfflineVehicles = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    isOnline, 
    getOfflineData, 
    saveOfflineData, 
    addToPendingSync 
  } = useOfflineSync();

  const loadVehicles = useCallback(async () => {
    try {
      setLoading(true);
      
      if (isOnline) {
        const data = await vehicleService.getAll();
        setVehicles(data);
        
        const offlineData = getOfflineData();
        offlineData.vehicles = data;
        saveOfflineData(offlineData);
      } else {
        const offlineData = getOfflineData();
        setVehicles(offlineData.vehicles);
      }
      
      setError(null);
    } catch (err) {
      setError('Erro ao carregar veículos');
      console.error(err);
      
      if (isOnline) {
        const offlineData = getOfflineData();
        setVehicles(offlineData.vehicles);
      }
    } finally {
      setLoading(false);
    }
  }, [isOnline, getOfflineData, saveOfflineData]);

  const addVehicle = useCallback(async (vehicle: Omit<Vehicle, 'id' | 'createdAt'>) => {
    try {
      if (isOnline) {
        await vehicleService.add(vehicle);
        await loadVehicles();
      } else {
        const newVehicle: Vehicle = {
          ...vehicle,
          id: `offline_${Date.now()}_${Math.random()}`,
          createdAt: new Date()
        };
        
        const offlineData = getOfflineData();
        offlineData.vehicles.unshift(newVehicle);
        saveOfflineData(offlineData);
        
        addToPendingSync('vehicles', vehicle);
        setVehicles(offlineData.vehicles);
      }
    } catch (err) {
      setError('Erro ao adicionar veículo');
      throw err;
    }
  }, [isOnline, loadVehicles, getOfflineData, saveOfflineData, addToPendingSync]);

  const deleteVehicle = useCallback(async (id: string) => {
    try {
      if (isOnline && !id.startsWith('offline_')) {
        await vehicleService.delete(id);
        await loadVehicles();
      } else {
        const offlineData = getOfflineData();
        offlineData.vehicles = offlineData.vehicles.filter(v => v.id !== id);
        saveOfflineData(offlineData);
        setVehicles(offlineData.vehicles);
      }
    } catch (err) {
      setError('Erro ao deletar veículo');
      throw err;
    }
  }, [isOnline, loadVehicles, getOfflineData, saveOfflineData]);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  return {
    vehicles,
    loading,
    error,
    addVehicle,
    deleteVehicle,
    reload: loadVehicles
  };
};

// Hook para registros de combustível com suporte offline
export const useOfflineFuelRecords = () => {
  const [fuelRecords, setFuelRecords] = useState<FuelRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    isOnline, 
    getOfflineData, 
    saveOfflineData, 
    addToPendingSync 
  } = useOfflineSync();

  const loadFuelRecords = useCallback(async () => {
    try {
      setLoading(true);
      
      if (isOnline) {
        const data = await fuelRecordService.getAll();
        setFuelRecords(data);
        
        const offlineData = getOfflineData();
        offlineData.fuelRecords = data;
        saveOfflineData(offlineData);
      } else {
        const offlineData = getOfflineData();
        setFuelRecords(offlineData.fuelRecords);
      }
      
      setError(null);
    } catch (err) {
      setError('Erro ao carregar registros de combustível');
      console.error(err);
      
      if (isOnline) {
        const offlineData = getOfflineData();
        setFuelRecords(offlineData.fuelRecords);
      }
    } finally {
      setLoading(false);
    }
  }, [isOnline, getOfflineData, saveOfflineData]);

  const addFuelRecord = useCallback(async (record: Omit<FuelRecord, 'id' | 'createdAt'>) => {
    try {
      if (isOnline) {
        await fuelRecordService.add(record);
        await loadFuelRecords();
      } else {
        const newRecord: FuelRecord = {
          ...record,
          id: `offline_${Date.now()}_${Math.random()}`,
          createdAt: new Date()
        };
        
        const offlineData = getOfflineData();
        offlineData.fuelRecords.unshift(newRecord);
        saveOfflineData(offlineData);
        
        addToPendingSync('fuelRecords', record);
        setFuelRecords(offlineData.fuelRecords);
      }
    } catch (err) {
      setError('Erro ao adicionar registro de combustível');
      throw err;
    }
  }, [isOnline, loadFuelRecords, getOfflineData, saveOfflineData, addToPendingSync]);

  const updateFuelRecord = useCallback(async (id: string, record: Partial<FuelRecord>) => {
    try {
      if (isOnline && !id.startsWith('offline_')) {
        await fuelRecordService.update(id, record);
        await loadFuelRecords();
      } else {
        const offlineData = getOfflineData();
        const index = offlineData.fuelRecords.findIndex(r => r.id === id);
        if (index !== -1) {
          // Preservar campos importantes ao fazer update offline
          const originalRecord = offlineData.fuelRecords[index];
          offlineData.fuelRecords[index] = { 
            ...originalRecord, 
            ...record,
            // Preservar data original se não foi explicitamente alterada
            date: record.date || originalRecord.date,
            // Preservar createdAt original
            createdAt: originalRecord.createdAt
          };
          saveOfflineData(offlineData);
          setFuelRecords(offlineData.fuelRecords);
        }
      }
    } catch (err) {
      setError('Erro ao atualizar registro de combustível');
      throw err;
    }
  }, [isOnline, loadFuelRecords, getOfflineData, saveOfflineData]);

  const deleteFuelRecord = useCallback(async (id: string) => {
    try {
      if (isOnline && !id.startsWith('offline_')) {
        await fuelRecordService.delete(id);
        await loadFuelRecords();
      } else {
        const offlineData = getOfflineData();
        offlineData.fuelRecords = offlineData.fuelRecords.filter(r => r.id !== id);
        saveOfflineData(offlineData);
        setFuelRecords(offlineData.fuelRecords);
      }
    } catch (err) {
      setError('Erro ao deletar registro de combustível');
      throw err;
    }
  }, [isOnline, loadFuelRecords, getOfflineData, saveOfflineData]);

  useEffect(() => {
    loadFuelRecords();
  }, [loadFuelRecords]);

  return {
    fuelRecords,
    loading,
    error,
    addFuelRecord,
    updateFuelRecord,
    deleteFuelRecord,
    reload: loadFuelRecords
  };
};
