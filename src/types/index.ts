export interface Responsible {
  id: string;
  name: string;
  phone: string;
  createdAt: Date;
}

export interface Vehicle {
  id: string;
  plate: string;
  model: string;
  createdAt: Date;
}

export interface FuelRecord {
  id: string;
  date: Date;
  responsibleId: string;
  vehicleId: string;
  fuelTypes: ('DIESEL' | 'ARLA')[];
  status: 'PENDENTE' | 'CONCLUIDO';
  dieselOdometerStart?: number;
  dieselOdometerEnd?: number;
  dieselLevelStart?: number;
  dieselLevelEnd?: number;
  arlaOdometerStart?: number;
  arlaOdometerEnd?: number;
  arlaLevelStart?: number;
  arlaLevelEnd?: number;
  arlaTotalRefueled?: number;
  dieselDailyStart?: number;
  dieselDailyEnd?: number;
  dieselTotalRefueled?: number;
  arlaDailyStart?: number;
  arlaDailyEnd?: number;
  vehicleKm?: number;
  average?: number;
  averagePanel?: number;
  observations?: string;
  createdAt: Date;
}
