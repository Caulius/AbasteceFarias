import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Responsible, Vehicle, FuelRecord } from '../types';

// Coleções do Firestore
const COLLECTIONS = {
  RESPONSIBLES: 'responsibles',
  VEHICLES: 'vehicles',
  FUEL_RECORDS: 'fuelRecords'
};

// Utilitário para converter Timestamp do Firebase para Date
const convertTimestamp = (timestamp: any): Date => {
  if (timestamp && timestamp.toDate) {
    return timestamp.toDate();
  }
  return new Date(timestamp);
};

// Serviços para Responsáveis
export const responsibleService = {
  // Adicionar responsável
  async add(responsible: Omit<Responsible, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.RESPONSIBLES), {
        ...responsible,
        createdAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Erro ao adicionar responsável:', error);
      throw error;
    }
  },

  // Buscar todos os responsáveis
  async getAll(): Promise<Responsible[]> {
    try {
      const q = query(collection(db, COLLECTIONS.RESPONSIBLES), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: convertTimestamp(doc.data().createdAt)
      })) as Responsible[];
    } catch (error) {
      console.error('Erro ao buscar responsáveis:', error);
      throw error;
    }
  },

  // Atualizar responsável
  async update(id: string, data: Partial<Responsible>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.RESPONSIBLES, id);
      await updateDoc(docRef, data);
    } catch (error) {
      console.error('Erro ao atualizar responsável:', error);
      throw error;
    }
  },

  // Deletar responsável
  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTIONS.RESPONSIBLES, id));
    } catch (error) {
      console.error('Erro ao deletar responsável:', error);
      throw error;
    }
  }
};

// Serviços para Veículos
export const vehicleService = {
  // Adicionar veículo
  async add(vehicle: Omit<Vehicle, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.VEHICLES), {
        ...vehicle,
        createdAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Erro ao adicionar veículo:', error);
      throw error;
    }
  },

  // Buscar todos os veículos
  async getAll(): Promise<Vehicle[]> {
    try {
      const q = query(collection(db, COLLECTIONS.VEHICLES), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: convertTimestamp(doc.data().createdAt)
      })) as Vehicle[];
    } catch (error) {
      console.error('Erro ao buscar veículos:', error);
      throw error;
    }
  },

  // Atualizar veículo
  async update(id: string, data: Partial<Vehicle>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.VEHICLES, id);
      await updateDoc(docRef, data);
    } catch (error) {
      console.error('Erro ao atualizar veículo:', error);
      throw error;
    }
  },

  // Deletar veículo
  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTIONS.VEHICLES, id));
    } catch (error) {
      console.error('Erro ao deletar veículo:', error);
      throw error;
    }
  }
};

// Serviços para Registros de Combustível
export const fuelRecordService = {
  // Adicionar registro
  async add(record: Omit<FuelRecord, 'id' | 'createdAt'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.FUEL_RECORDS), {
        ...record,
        date: Timestamp.fromDate(new Date(record.date)),
        createdAt: Timestamp.now()
      });
      return docRef.id;
    } catch (error) {
      console.error('Erro ao adicionar registro de combustível:', error);
      throw error;
    }
  },

  // Buscar todos os registros
  async getAll(): Promise<FuelRecord[]> {
    try {
      const q = query(collection(db, COLLECTIONS.FUEL_RECORDS), orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: convertTimestamp(doc.data().date),
        createdAt: convertTimestamp(doc.data().createdAt)
      })) as FuelRecord[];
    } catch (error) {
      console.error('Erro ao buscar registros de combustível:', error);
      throw error;
    }
  },

  // Buscar registros por período
  async getByDateRange(startDate: Date, endDate: Date): Promise<FuelRecord[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.FUEL_RECORDS),
        where('date', '>=', Timestamp.fromDate(startDate)),
        where('date', '<=', Timestamp.fromDate(endDate)),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: convertTimestamp(doc.data().date),
        createdAt: convertTimestamp(doc.data().createdAt)
      })) as FuelRecord[];
    } catch (error) {
      console.error('Erro ao buscar registros por período:', error);
      throw error;
    }
  },

  // Buscar registros por veículo
  async getByVehicle(vehicleId: string): Promise<FuelRecord[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.FUEL_RECORDS),
        where('vehicleId', '==', vehicleId),
        orderBy('date', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: convertTimestamp(doc.data().date),
        createdAt: convertTimestamp(doc.data().createdAt)
      })) as FuelRecord[];
    } catch (error) {
      console.error('Erro ao buscar registros por veículo:', error);
      throw error;
    }
  },

  // Atualizar registro
  async update(id: string, data: Partial<FuelRecord>): Promise<void> {
    try {
      const docRef = doc(db, COLLECTIONS.FUEL_RECORDS, id);
      const updateData = { ...data };
      
      // Converter date para Timestamp se presente
      if (updateData.date) {
        updateData.date = Timestamp.fromDate(new Date(updateData.date)) as any;
      }
      
      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('Erro ao atualizar registro de combustível:', error);
      throw error;
    }
  },

  // Deletar registro
  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTIONS.FUEL_RECORDS, id));
    } catch (error) {
      console.error('Erro ao deletar registro de combustível:', error);
      throw error;
    }
  }
};

// Serviço de sincronização para migrar dados do localStorage para Firebase
export const syncService = {
  // Migrar dados do localStorage para Firebase
  async migrateFromLocalStorage(): Promise<void> {
    try {
      // Migrar responsáveis
      const localResponsibles = JSON.parse(localStorage.getItem('responsibles') || '[]');
      for (const responsible of localResponsibles) {
        await responsibleService.add({
          name: responsible.name,
          phone: responsible.phone
        });
      }

      // Migrar veículos
      const localVehicles = JSON.parse(localStorage.getItem('vehicles') || '[]');
      for (const vehicle of localVehicles) {
        await vehicleService.add({
          plate: vehicle.plate,
          model: vehicle.model
        });
      }

      // Migrar registros de combustível
      const localFuelRecords = JSON.parse(localStorage.getItem('fuelRecords') || '[]');
      for (const record of localFuelRecords) {
        await fuelRecordService.add({
          ...record,
          date: new Date(record.date)
        });
      }

      console.log('Migração concluída com sucesso!');
    } catch (error) {
      console.error('Erro na migração:', error);
      throw error;
    }
  },

  // Limpar localStorage após migração
  clearLocalStorage(): void {
    localStorage.removeItem('responsibles');
    localStorage.removeItem('vehicles');
    localStorage.removeItem('fuelRecords');
    console.log('LocalStorage limpo!');
  }
};