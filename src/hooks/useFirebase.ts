import { useState, useEffect } from 'react';
import { 
  responsibleService, 
  vehicleService, 
  fuelRecordService 
} from '../services/firebaseService';
import type { Responsible, Vehicle, FuelRecord } from '../types';

// Hook para gerenciar responsáveis
export const useResponsibles = () => {
  const [responsibles, setResponsibles] = useState<Responsible[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadResponsibles = async () => {
    try {
      setLoading(true);
      const data = await responsibleService.getAll();
      setResponsibles(data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar responsáveis');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addResponsible = async (responsible: Omit<Responsible, 'id' | 'createdAt'>) => {
    try {
      await responsibleService.add(responsible);
      await loadResponsibles(); // Recarregar lista
    } catch (err) {
      setError('Erro ao adicionar responsável');
      throw err;
    }
  };

  const deleteResponsible = async (id: string) => {
    try {
      await responsibleService.delete(id);
      await loadResponsibles(); // Recarregar lista
    } catch (err) {
      setError('Erro ao deletar responsável');
      throw err;
    }
  };

  useEffect(() => {
    loadResponsibles();
  }, []);

  return {
    responsibles,
    loading,
    error,
    addResponsible,
    deleteResponsible,
    reload: loadResponsibles
  };
};

// Hook para gerenciar veículos
export const useVehicles = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const data = await vehicleService.getAll();
      setVehicles(data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar veículos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addVehicle = async (vehicle: Omit<Vehicle, 'id' | 'createdAt'>) => {
    try {
      await vehicleService.add(vehicle);
      await loadVehicles(); // Recarregar lista
    } catch (err) {
      setError('Erro ao adicionar veículo');
      throw err;
    }
  };

  const deleteVehicle = async (id: string) => {
    try {
      await vehicleService.delete(id);
      await loadVehicles(); // Recarregar lista
    } catch (err) {
      setError('Erro ao deletar veículo');
      throw err;
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  return {
    vehicles,
    loading,
    error,
    addVehicle,
    deleteVehicle,
    reload: loadVehicles
  };
};

// Hook para gerenciar registros de combustível
export const useFuelRecords = () => {
  const [fuelRecords, setFuelRecords] = useState<FuelRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFuelRecords = async () => {
    try {
      setLoading(true);
      const data = await fuelRecordService.getAll();
      setFuelRecords(data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar registros de combustível');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addFuelRecord = async (record: Omit<FuelRecord, 'id' | 'createdAt'>) => {
    try {
      await fuelRecordService.add(record);
      await loadFuelRecords(); // Recarregar lista
    } catch (err) {
      setError('Erro ao adicionar registro de combustível');
      throw err;
    }
  };

  const updateFuelRecord = async (id: string, record: Partial<FuelRecord>) => {
    try {
      await fuelRecordService.update(id, record);
      await loadFuelRecords(); // Recarregar lista
    } catch (err) {
      setError('Erro ao atualizar registro de combustível');
      throw err;
    }
  };

  const deleteFuelRecord = async (id: string) => {
    try {
      await fuelRecordService.delete(id);
      await loadFuelRecords(); // Recarregar lista
    } catch (err) {
      setError('Erro ao deletar registro de combustível');
      throw err;
    }
  };

  useEffect(() => {
    loadFuelRecords();
  }, []);

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