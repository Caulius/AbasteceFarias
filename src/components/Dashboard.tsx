import React, { useState, useMemo } from 'react';
import { BarChart3, Fuel, Car, User, Calendar, Filter, TrendingUp, Droplets, Clock, CheckCircle } from 'lucide-react';
import type { FuelRecord, Responsible, Vehicle } from '../types';

interface DashboardProps {
  fuelRecords: FuelRecord[];
  responsibles: Responsible[];
  vehicles: Vehicle[];
  onNavigateToFuel: (recordId?: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  fuelRecords, 
  responsibles, 
  vehicles, 
  onNavigateToFuel 
}) => {
  const [filterPeriod, setFilterPeriod] = useState<'today' | 'month' | 'last90' | 'custom'>('month');
  const [filterStatus, setFilterStatus] = useState<'all' | 'PENDENTE' | 'CONCLUIDO'>('all');
  const [filterVehicle, setFilterVehicle] = useState<string>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Filtrar registros baseado nos filtros selecionados
  const filteredRecords = useMemo(() => {
    let filtered = [...fuelRecords];

    // Filtro por período
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (filterPeriod) {
      case 'today':
        filtered = filtered.filter(record => {
          const recordDate = new Date(record.date);
          const recordDay = new Date(recordDate.getFullYear(), recordDate.getMonth(), recordDate.getDate());
          return recordDay.getTime() === today.getTime();
        });
        break;
      case 'month':
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        filtered = filtered.filter(record => new Date(record.date) >= startOfMonth);
        break;
      case 'last90':
        const last90Days = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));
        filtered = filtered.filter(record => new Date(record.date) >= last90Days);
        break;
      case 'custom':
        if (customStartDate && customEndDate) {
          const startDate = new Date(customStartDate);
          const endDate = new Date(customEndDate + 'T23:59:59');
          filtered = filtered.filter(record => {
            const recordDate = new Date(record.date);
            return recordDate >= startDate && recordDate <= endDate;
          });
        }
        break;
    }

    // Filtro por status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(record => record.status === filterStatus);
    }

    // Filtro por veículo
    if (filterVehicle !== 'all') {
      filtered = filtered.filter(record => record.vehicleId === filterVehicle);
    }

    return filtered;
  }, [fuelRecords, filterPeriod, filterStatus, filterVehicle, customStartDate, customEndDate]);

  // Calcular estatísticas
  const stats = useMemo(() => {
    const totalRecords = filteredRecords.length;
    const pendingRecords = filteredRecords.filter(r => r.status === 'PENDENTE').length;
    const completedRecords = filteredRecords.filter(r => r.status === 'CONCLUIDO').length;
    
    const totalDieselRefueled = filteredRecords.reduce((sum, r) => sum + (r.dieselTotalRefueled || 0), 0);
    const totalArlaRefueled = filteredRecords.reduce((sum, r) => sum + (r.arlaTotalRefueled || 0), 0);
    
    const lastDieselLevel = filteredRecords
      .filter(r => r.dieselLevelEnd)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    
    const lastArlaLevel = filteredRecords
      .filter(r => r.arlaLevelEnd)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    
    const currentDieselLevel = lastDieselLevel ? (lastDieselLevel.dieselLevelEnd || 0) : 0;
    const currentArlaLevel = lastArlaLevel ? (lastArlaLevel.arlaLevelEnd || 0) : 0;
    
    const avgConsumption = filteredRecords.length > 0 
      ? filteredRecords.reduce((sum, r) => sum + (r.average || 0), 0) / filteredRecords.length 
      : 0;

    return {
      totalRecords,
      pendingRecords,
      completedRecords,
      totalDieselRefueled,
      totalArlaRefueled,
      currentDieselLevel,
      currentArlaLevel,
      avgConsumption
    };
  }, [filteredRecords]);

  // Últimos 5 abastecimentos
  const recentRecords = useMemo(() => {
    return filteredRecords
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [filteredRecords]);

  const getPeriodLabel = () => {
    switch (filterPeriod) {
      case 'today': return 'Hoje';
      case 'month': return 'Este Mês';
      case 'last90': return 'Últimos 90 Dias';
      case 'custom': return 'Período Personalizado';
      default: return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Filter className="h-5 w-5 mr-2 text-blue-600" />
          Filtros do Dashboard
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Período
            </label>
            <select
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value as any)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-white"
            >
              <option value="today">Hoje</option>
              <option value="month">Este Mês</option>
              <option value="last90">Últimos 90 Dias</option>
              <option value="custom">Personalizado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-white"
            >
              <option value="all">Todos</option>
              <option value="PENDENTE">Pendente</option>
              <option value="CONCLUIDO">Concluído</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Veículo
            </label>
            <select
              value={filterVehicle}
              onChange={(e) => setFilterVehicle(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-white"
            >
              <option value="all">Todos os Veículos</option>
              {vehicles.map(vehicle => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.plate} - {vehicle.model}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Campos de data personalizada */}
        {filterPeriod === 'custom' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Data Inicial
              </label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Data Final
              </label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-900/20 p-6 rounded-xl border border-blue-600/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-400 text-sm font-medium">Total de Abastecimentos</p>
              <p className="text-2xl font-bold text-white">{stats.totalRecords}</p>
              <p className="text-xs text-gray-400 mt-1">{getPeriodLabel()}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-yellow-900/20 p-6 rounded-xl border border-yellow-600/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-400 text-sm font-medium">Pendentes</p>
              <p className="text-2xl font-bold text-white">{stats.pendingRecords}</p>
              <p className="text-xs text-gray-400 mt-1">Aguardando conclusão</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-green-900/20 p-6 rounded-xl border border-green-600/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-400 text-sm font-medium">Concluídos</p>
              <p className="text-2xl font-bold text-white">{stats.completedRecords}</p>
              <p className="text-xs text-gray-400 mt-1">Finalizados</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-purple-900/20 p-6 rounded-xl border border-purple-600/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-400 text-sm font-medium">Média de Consumo</p>
              <p className="text-2xl font-bold text-white">{stats.avgConsumption.toFixed(1)}</p>
              <p className="text-xs text-gray-400 mt-1">km/l</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Cards de Combustível */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-orange-900/20 p-6 rounded-xl border border-orange-600/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-orange-400 flex items-center">
              <Fuel className="h-5 w-5 mr-2" />
              DIESEL
            </h3>
            <Droplets className="h-6 w-6 text-orange-400" />
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-gray-400 text-sm">Nível Atual</p>
              <p className="text-2xl font-bold text-white">{stats.currentDieselLevel.toFixed(1)}L</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Abastecido ({getPeriodLabel()})</p>
              <p className="text-xl font-semibold text-orange-400">{stats.totalDieselRefueled.toFixed(1)}L</p>
            </div>
          </div>
        </div>

        <div className="bg-green-900/20 p-6 rounded-xl border border-green-600/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-green-400 flex items-center">
              <Fuel className="h-5 w-5 mr-2" />
              ARLA
            </h3>
            <Droplets className="h-6 w-6 text-green-400" />
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-gray-400 text-sm">Nível Atual</p>
              <p className="text-2xl font-bold text-white">{stats.currentArlaLevel.toFixed(1)}L</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Abastecido ({getPeriodLabel()})</p>
              <p className="text-xl font-semibold text-green-400">{stats.totalArlaRefueled.toFixed(1)}L</p>
            </div>
          </div>
        </div>
      </div>

      {/* Últimos Abastecimentos */}
      <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-600" />
            Últimos Abastecimentos
          </h3>
        </div>
        
        {recentRecords.length === 0 ? (
          <div className="p-8 text-center">
            <Fuel className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-white mb-2">
              Nenhum abastecimento encontrado
            </h4>
            <p className="text-gray-400">
              Não há registros para os filtros selecionados.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {recentRecords.map((record) => {
              const responsible = responsibles.find(r => r.id === record.responsibleId);
              const vehicle = vehicles.find(v => v.id === record.vehicleId);
              
              return (
                <div 
                  key={record.id} 
                  className="p-6 hover:bg-gray-700 transition-colors cursor-pointer"
                  onClick={() => onNavigateToFuel(record.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="bg-blue-600 p-2 rounded-lg">
                          <Fuel className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-white">
                            {vehicle?.plate} - {vehicle?.model}
                          </h4>
                          <div className="flex items-center space-x-4 mt-1">
                            <div className="flex items-center text-sm text-gray-300">
                              <User className="h-3 w-3 mr-1" />
                              {responsible?.name}
                            </div>
                            <div className="flex items-center text-sm text-gray-300">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(record.date).toLocaleDateString('pt-BR')} às {new Date(record.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 mb-2">
                        {record.fuelTypes.map(type => (
                          <span
                            key={type}
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              type === 'DIESEL' 
                                ? 'bg-orange-600 text-white' 
                                : 'bg-green-600 text-white'
                            }`}
                          >
                            {type}
                          </span>
                        ))}
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          record.status === 'CONCLUIDO'
                            ? 'bg-green-900/30 text-green-400 border border-green-600/30'
                            : 'bg-yellow-900/30 text-yellow-400 border border-yellow-600/30'
                        }`}>
                          {record.status === 'CONCLUIDO' ? (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <Clock className="h-3 w-3 mr-1" />
                          )}
                          {record.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        {record.dieselTotalRefueled && (
                          <div>
                            <span className="text-gray-400">DIESEL:</span>
                            <span className="text-orange-400 font-medium ml-1">{record.dieselTotalRefueled}L</span>
                          </div>
                        )}
                        {record.arlaTotalRefueled && (
                          <div>
                            <span className="text-gray-400">ARLA:</span>
                            <span className="text-green-400 font-medium ml-1">{record.arlaTotalRefueled}L</span>
                          </div>
                        )}
                        {record.vehicleKm && (
                          <div>
                            <span className="text-gray-400">KM:</span>
                            <span className="text-white font-medium ml-1">{record.vehicleKm}</span>
                          </div>
                        )}
                        {record.average && (
                          <div>
                            <span className="text-gray-400">Média:</span>
                            <span className="text-purple-400 font-medium ml-1">{record.average} km/l</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
