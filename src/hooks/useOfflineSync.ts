import { useState, useEffect, useCallback } from 'react';
import { 
  responsibleService, 
  vehicleService, 
  fuelRecordService 
} from '../services/firebaseService';
import type { Responsible, Vehicle, FuelRecord } from '../types';

interface OfflineData {
  responsibles: Responsible[];
  vehicles: Vehicle[];
  fuelRecords: FuelRecord[];
  pendingSync: {
    responsibles: Array<Omit<Responsible, 'id' | 'createdAt'>>;
    vehicles: Array<Omit<Vehicle, 'id' | 'createdAt'>>;
    fuelRecords: Array<Omit<FuelRecord, 'id' | 'createdAt'>>;
  };
}

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Monitorar status de conexão
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('Conexão restaurada - iniciando sincronização');
      syncPendingData();
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('Conexão perdida - modo offline ativado');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Escutar mensagens do Service Worker
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'BACKGROUND_SYNC') {
        console.log('Sincronização solicitada pelo Service Worker');
        syncPendingData();
      }
    };

    navigator.serviceWorker?.addEventListener('message', handleMessage);

    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleMessage);
    };
  }, []);

  // Salvar dados offline
  const saveOfflineData = useCallback((data: Partial<OfflineData>) => {
    try {
      const currentData = getOfflineData();
      const updatedData = { ...currentData, ...data };
      localStorage.setItem('offlineData', JSON.stringify(updatedData));
    } catch (error) {
      console.error('Erro ao salvar dados offline:', error);
    }
  }, []);

  // Recuperar dados offline
  const getOfflineData = useCallback((): OfflineData => {
    try {
      const data = localStorage.getItem('offlineData');
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Erro ao recuperar dados offline:', error);
    }

    return {
      responsibles: [],
      vehicles: [],
      fuelRecords: [],
      pendingSync: {
        responsibles: [],
        vehicles: [],
        fuelRecords: []
      }
    };
  }, []);

  // Adicionar item para sincronização pendente
  const addToPendingSync = useCallback((
    type: 'responsibles' | 'vehicles' | 'fuelRecords',
    item: any
  ) => {
    const offlineData = getOfflineData();
    offlineData.pendingSync[type].push(item);
    saveOfflineData(offlineData);
  }, [getOfflineData, saveOfflineData]);

  // Sincronizar dados pendentes
  const syncPendingData = useCallback(async () => {
    if (!isOnline || isSyncing) return;

    setIsSyncing(true);
    setSyncError(null);

    try {
      const offlineData = getOfflineData();
      const { pendingSync } = offlineData;

      // Sincronizar responsáveis
      for (const responsible of pendingSync.responsibles) {
        try {
          await responsibleService.add(responsible);
          console.log('Responsável sincronizado:', responsible.name);
        } catch (error) {
          console.error('Erro ao sincronizar responsável:', error);
        }
      }

      // Sincronizar veículos
      for (const vehicle of pendingSync.vehicles) {
        try {
          await vehicleService.add(vehicle);
          console.log('Veículo sincronizado:', vehicle.plate);
        } catch (error) {
          console.error('Erro ao sincronizar veículo:', error);
        }
      }

      // Sincronizar registros de combustível
      for (const record of pendingSync.fuelRecords) {
        try {
          await fuelRecordService.add(record);
          console.log('Abastecimento sincronizado');
        } catch (error) {
          console.error('Erro ao sincronizar abastecimento:', error);
        }
      }

      // Limpar dados pendentes após sincronização
      offlineData.pendingSync = {
        responsibles: [],
        vehicles: [],
        fuelRecords: []
      };
      saveOfflineData(offlineData);

      setLastSyncTime(new Date());
      console.log('Sincronização concluída com sucesso');

      // Registrar sincronização em background para próximas vezes
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('background-sync');
      }

    } catch (error) {
      console.error('Erro durante sincronização:', error);
      setSyncError('Erro ao sincronizar dados. Tentaremos novamente.');
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, getOfflineData, saveOfflineData]);

  // Forçar sincronização manual
  const forcSync = useCallback(() => {
    if (isOnline) {
      syncPendingData();
    }
  }, [isOnline, syncPendingData]);

  // Verificar se há dados pendentes
  const hasPendingData = useCallback(() => {
    const offlineData = getOfflineData();
    const { pendingSync } = offlineData;
    
    return (
      pendingSync.responsibles.length > 0 ||
      pendingSync.vehicles.length > 0 ||
      pendingSync.fuelRecords.length > 0
    );
  }, [getOfflineData]);

  // Obter contagem de itens pendentes
  const getPendingCount = useCallback(() => {
    const offlineData = getOfflineData();
    const { pendingSync } = offlineData;
    
    return {
      responsibles: pendingSync.responsibles.length,
      vehicles: pendingSync.vehicles.length,
      fuelRecords: pendingSync.fuelRecords.length,
      total: pendingSync.responsibles.length + 
             pendingSync.vehicles.length + 
             pendingSync.fuelRecords.length
    };
  }, [getOfflineData]);

  return {
    isOnline,
    isSyncing,
    lastSyncTime,
    syncError,
    saveOfflineData,
    getOfflineData,
    addToPendingSync,
    syncPendingData,
    forcSync,
    hasPendingData,
    getPendingCount
  };
};