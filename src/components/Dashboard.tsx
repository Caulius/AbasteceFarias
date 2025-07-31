import React, { useState, useMemo } from 'react';
import { BarChart3, Fuel, Car, Users, Calendar, TrendingUp, Filter, ArrowUpDown, CalendarDays } from 'lucide-react';
import type { FuelRecord, Responsible, Vehicle } from '../types';

interface DashboardProps {
  fuelRecords: FuelRecord[];
  responsibles: Responsible[];
  vehicles: Vehicle[];
  onNavigateToFuel: (recordId?: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ fuelRecords, responsibles, vehicles, onNavigateToFuel }) => {
  const [selectedVehicle1, setSelectedVehicle1] = useState<string>('all');
  const [selectedVehicle2, setSelectedVehicle2] = useState<string>('');
  const [showComparison, setShowComparison] = useState(false);
  const [filterType, setFilterType] = useState<'preset' | 'custom'>('preset');
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'month' | '90'>('today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedVehicleFilter, setSelectedVehicleFilter] = useState<string>('all');

  // Calcular diferença em dias entre duas datas
  const getDaysDifference = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Obter modelos únicos de veículos
  const uniqueModels = useMemo(() => {
    const models = vehicles.map(vehicle => vehicle.model);
    return [...new Set(models)].sort();
  }, [vehicles]);

  // Validar período personalizado
  const isCustomPeriodValid = () => {
    if (!startDate || !endDate) return false;
    const days = getDaysDifference(startDate, endDate);
    return days <= 90 && new Date(startDate) <= new Date(endDate);
  };

  // Filtrar registros por período selecionado
  const filteredRecords = useMemo(() => {
    let startFilterDate: Date;
    let endFilterDate: Date;

    if (filterType === 'custom' && isCustomPeriodValid()) {
      startFilterDate = new Date(startDate);
      endFilterDate = new Date(endDate);
      // Incluir o dia inteiro da data final
      endFilterDate.setHours(23, 59, 59, 999);
    } else {
      // Usar período pré-definido
      const now = new Date();
      endFilterDate = new Date();
      
      switch (selectedPeriod) {
        case 'today':
          startFilterDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          endFilterDate.setHours(23, 59, 59, 999);
          break;
        case 'month':
          startFilterDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endFilterDate.setHours(23, 59, 59, 999);
          break;
        case '90':
          const daysAgo = new Date();
          daysAgo.setDate(daysAgo.getDate() - 90);
          startFilterDate = daysAgo;
          break;
        default:
          startFilterDate = new Date();
          startFilterDate.setDate(startFilterDate.getDate() - 1);
      }
    }
    
    return fuelRecords.filter(record => {
      const recordDate = new Date(record.date);
      const matchesDateRange = recordDate >= startFilterDate && recordDate <= endFilterDate;
      const hasValidAverage = record.average && record.average > 0;
      
      // Filtrar por modelo de veículo
      let matchesVehicleFilter = true;
      if (selectedVehicleFilter !== 'all') {
        const recordVehicle = vehicles.find(v => v.id === record.vehicleId);
        matchesVehicleFilter = recordVehicle?.model === selectedVehicleFilter;
      }
      
      return matchesDateRange && hasValidAverage && matchesVehicleFilter;
    });
  }, [fuelRecords, selectedPeriod, filterType, startDate, endDate, selectedVehicleFilter]);

  // Calcular estatísticas gerais (todos os registros)
  const totalFuelRecords = fuelRecords.length;
  
  // Obter último valor de DIESEL Total diário
  const getLastDieselTotal = () => {
    const recordsWithDieselDaily = fuelRecords
      .filter(record => record.dieselDailyStart !== undefined || record.dieselDailyEnd !== undefined)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    if (recordsWithDieselDaily.length === 0) return 0;
    
    const lastRecord = recordsWithDieselDaily[0];
    // Priorizar o valor final, se não houver, usar o inicial
    return lastRecord.dieselDailyEnd !== undefined ? lastRecord.dieselDailyEnd : (lastRecord.dieselDailyStart || 0);
  };
  
  // Obter último valor de ARLA Total diário
  const getLastArlaTotal = () => {
    const recordsWithArlaDaily = fuelRecords
      .filter(record => record.arlaDailyStart !== undefined || record.arlaDailyEnd !== undefined)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    if (recordsWithArlaDaily.length === 0) return 0;
    
    const lastRecord = recordsWithArlaDaily[0];
    // Priorizar o valor final, se não houver, usar o inicial
    return lastRecord.arlaDailyEnd !== undefined ? lastRecord.arlaDailyEnd : (lastRecord.arlaDailyStart || 0);
  };
  
  const totalDieselAmount = getLastDieselTotal();
  const totalArlaAmount = getLastArlaTotal();

  // Calcular totais abastecidos no período filtrado
  const getTotalRefueled = () => {
    const totalDieselRefueled = filteredRecords.reduce((sum, record) => {
      return sum + (record.dieselTotalRefueled || 0);
    }, 0);
    
    const totalArlaRefueled = filteredRecords.reduce((sum, record) => {
      return sum + (record.arlaTotalRefueled || 0);
    }, 0);
    
    return { totalDieselRefueled, totalArlaRefueled };
  };

  const { totalDieselRefueled, totalArlaRefueled } = getTotalRefueled();

  // Calcular totais abastecidos gerais (todos os registros)
  const getTotalRefueledGeneral = () => {
    const totalDieselRefueled = fuelRecords.reduce((sum, record) => {
      return sum + (record.dieselTotalRefueled || 0);
    }, 0);
    
    const totalArlaRefueled = fuelRecords.reduce((sum, record) => {
      return sum + (record.arlaTotalRefueled || 0);
    }, 0);
    
    return { totalDieselRefueled, totalArlaRefueled };
  };

  const { totalDieselRefueled: totalDieselRefueledGeneral, totalArlaRefueled: totalArlaRefueledGeneral } = getTotalRefueledGeneral();

  // Calcular média de consumo filtrada por período
  const getFilteredConsumption = (vehicleId: string) => {
    if (vehicleId === 'all') {
      return filteredRecords.length > 0 
        ? filteredRecords.reduce((sum, record) => sum + (record.average || 0), 0) / filteredRecords.length
        : 0;
    }
    
    const vehicleRecords = filteredRecords.filter(record => record.vehicleId === vehicleId);
    return vehicleRecords.length > 0
      ? vehicleRecords.reduce((sum, record) => sum + (record.average || 0), 0) / vehicleRecords.length
      : 0;
  };

  const vehicle1Consumption = getFilteredConsumption(selectedVehicle1);
  const vehicle2Consumption = selectedVehicle2 ? getFilteredConsumption(selectedVehicle2) : 0;

  // Obter últimos 5 abastecimentos
  const recentRecords = fuelRecords
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Abastecimentos de hoje
  const todayRecords = fuelRecords.filter(record => {
    const today = new Date();
    const recordDate = new Date(record.date);
    return recordDate.toDateString() === today.toDateString();
  }).length;

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'today': return 'Dia atual';
      case 'month': return 'Mês atual';
      case '90': return '3 meses';
      default: return 'Dia atual';
    }
  };

  const getPeriodDescription = () => {
    if (filterType === 'custom' && isCustomPeriodValid()) {
      const days = getDaysDifference(startDate, endDate);
      return `${days} dias (${new Date(startDate).toLocaleDateString('pt-BR')} - ${new Date(endDate).toLocaleDateString('pt-BR')})`;
    }
    return getPeriodLabel(selectedPeriod);
  };

  const stats = [
    {
      title: 'Total de Abastecimentos',
      value: totalFuelRecords,
      icon: Fuel,
      color: 'bg-blue-600',
      bgColor: 'bg-gray-800'
    },
    {
      title: 'Nível do DIESEL',
      value: totalDieselAmount.toFixed(1),
      icon: Fuel,
      color: 'bg-orange-600',
      bgColor: 'bg-gray-800'
    },
    {
      title: 'Nível do ARLA',
      value: totalArlaAmount.toFixed(1),
      icon: Fuel,
      color: 'bg-green-600',
      bgColor: 'bg-gray-800'
    },
    {
      title: 'Total Abastecido DIESEL',
      value: totalDieselRefueledGeneral.toFixed(1) + 'L',
      icon: Fuel,
      color: 'bg-orange-700',
      bgColor: 'bg-gray-800'
    },
    {
      title: 'Total Abastecido ARLA',
      value: totalArlaRefueledGeneral.toFixed(1) + 'L',
      icon: Fuel,
      color: 'bg-green-700',
      bgColor: 'bg-gray-800'
    },
    {
      title: 'Média de Consumo',
      value: vehicle1Consumption > 0 ? vehicle1Consumption.toFixed(2) + ' km/l' : 'N/A',
      icon: TrendingUp,
      color: 'bg-purple-600',
      bgColor: 'bg-gray-800'
    }
  ];

  const getVehicleName = (vehicleId: string) => {
    if (vehicleId === 'all') return 'Todos os veículos';
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.plate} - ${vehicle.model}` : 'Veículo não encontrado';
  };

  return (
    <div className="space-y-6">
      {/* Filtros de Período */}
      <div className="bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Calendar className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-white">
              Dashboard - {new Date().toLocaleDateString('pt-BR')}
            </h3>
          </div>
        </div>
        
        {/* Seletor de Tipo de Filtro */}
        <div className="mt-4 space-y-4">
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="filterType"
                value="preset"
                checked={filterType === 'preset'}
                onChange={(e) => setFilterType(e.target.value as 'preset' | 'custom')}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="text-sm font-medium text-gray-300">Períodos Pré-definidos</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="filterType"
                value="custom"
                checked={filterType === 'custom'}
                onChange={(e) => setFilterType(e.target.value as 'preset' | 'custom')}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="text-sm font-medium text-gray-300">Período Personalizado</span>
            </label>
          </div>

          {/* Filtros Pré-definidos */}
          {filterType === 'preset' && (
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-300">Período:</label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as 'today' | 'month' | '90')}
                className="px-3 py-1 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-white text-sm"
              >
                <option value="today">Dia atual</option>
                <option value="month">Mês atual</option>
                <option value="90">Últimos 3 meses</option>
              </select>
            </div>
          )}

          {/* Filtro Personalizado */}
          {filterType === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <CalendarDays className="h-4 w-4 inline mr-1" />
                  Data Inicial
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <CalendarDays className="h-4 w-4 inline mr-1" />
                  Data Final
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Car className="h-4 w-4 inline mr-1" />
                  Filtrar por Veículo
                </label>
                <select
                  value={selectedVehicleFilter}
                  onChange={(e) => setSelectedVehicleFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-white text-sm"
                >
                  <option value="all">Todos os modelos</option>
                  {uniqueModels.map(model => (
                    <option key={model} value={model}>
                      {model}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <div className="text-sm text-gray-400">
                  {startDate && endDate && (
                    <div>
                      {isCustomPeriodValid() ? (
                        <span className="text-green-400">
                          ✓ {getDaysDifference(startDate, endDate)} dias selecionados
                        </span>
                      ) : (
                        <span className="text-red-400">
                          {getDaysDifference(startDate, endDate) > 90 
                            ? '⚠ Máximo 90 dias permitidos' 
                            : '⚠ Data inicial deve ser anterior à final'
                          }
                        </span>
                      )}
                    </div>
                  )}
                  {(!startDate || !endDate) && (
                    <span className="text-gray-500">Selecione as datas</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={`${stat.bgColor} p-4 sm:p-6 rounded-xl border border-gray-700`}>
              <div className="flex items-center">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400">{stat.title}</p>
                  <p className="text-xl sm:text-2xl font-bold text-white">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Quick Stats */}
        <div className="bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
            Resumo Geral
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-300">Responsáveis</span>
              </div>
              <span className="font-semibold text-white">{responsibles.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Car className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-300">Veículos</span>
              </div>
              <span className="font-semibold text-white">{vehicles.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-sm text-gray-300">Abastecimentos Hoje</span>
              </div>
              <span className="font-semibold text-white">{todayRecords}</span>
            </div>
          </div>
        </div>

        {/* Recent Records */}
        <div className="lg:col-span-2 bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center justify-between">
            <span>Últimos 5 Abastecimentos</span>
            <button
              onClick={() => onNavigateToFuel()}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              Ver todos →
            </button>
          </h3>
          {recentRecords.length === 0 ? (
            <p className="text-gray-400 text-center py-8">
              Nenhum abastecimento registrado ainda.
            </p>
          ) : (
            <div className="space-y-3">
              {recentRecords.map((record) => {
                const responsible = responsibles.find(r => r.id === record.responsibleId);
                const vehicle = vehicles.find(v => v.id === record.vehicleId);
                
                return (
                  <div 
                    key={record.id} 
                    className="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors cursor-pointer"
                    onClick={() => onNavigateToFuel(record.id)}
                    title="Clique para ver detalhes"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-white">
                          {vehicle?.plate} - {vehicle?.model}
                        </span>
                        <div className="flex space-x-1">
                          {record.fuelTypes.map(type => (
                            <span
                              key={type}
                              className={`px-2 py-1 rounded-full text-xs font-medium text-white ${
                                type === 'DIESEL' 
                                  ? 'bg-orange-600' 
                                  : 'bg-green-600'
                              }`}
                            >
                              {type}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-300 mt-1">
                        {responsible?.name} • {new Date(record.date).toLocaleDateString('pt-BR')} às {new Date(record.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="text-right">
                      {(record.dieselDailyStart || record.dieselDailyEnd) && (
                        <p className="text-sm text-orange-400 font-medium">
                          DIESEL: {record.dieselDailyStart && `${record.dieselDailyStart}L`}
                          {record.dieselDailyStart && record.dieselDailyEnd && ' → '}
                          {record.dieselDailyEnd && `${record.dieselDailyEnd}L`}
                        </p>
                      )}
                      {record.arlaTotalRefueled && (
                        <div>
                          <span className="text-gray-400">ARLA Abast.:</span>
                          <span className="text-green-400 font-medium ml-1">{record.arlaTotalRefueled}L</span>
                        </div>
                      )}
                      {(record.arlaDailyStart || record.arlaDailyEnd) && (
                        <p className="text-sm text-green-400 font-medium">
                          ARLA: {record.arlaDailyStart && `${record.arlaDailyStart}L`}
                          {record.arlaDailyStart && record.arlaDailyEnd && ' → '}
                          {record.arlaDailyEnd && `${record.arlaDailyEnd}L`}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Análise de Consumo */}
      <div className="bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-purple-600" />
          Análise de Consumo ({getPeriodDescription()})
        </h3>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Filter className="h-4 w-4 inline mr-1" />
              Veículo Principal
            </label>
            <select
              value={selectedVehicle1}
              onChange={(e) => setSelectedVehicle1(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-white"
            >
              <option value="all">Todos os veículos</option>
              {vehicles.map(vehicle => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.plate} - {vehicle.model}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <ArrowUpDown className="h-4 w-4 inline mr-1" />
              Comparar com
            </label>
            <select
              value={selectedVehicle2}
              onChange={(e) => {
                setSelectedVehicle2(e.target.value);
                setShowComparison(!!e.target.value);
              }}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-white"
            >
              <option value="">Selecione para comparar</option>
              {vehicles
                .filter(vehicle => vehicle.id !== selectedVehicle1)
                .map(vehicle => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.plate} - {vehicle.model}
                  </option>
                ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedVehicle2('');
                setShowComparison(false);
              }}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-500 transition-colors"
            >
              Limpar Filtros
            </button>
          </div>
        </div>

        {/* Resultados */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Veículo Principal */}
          <div className="bg-purple-900/20 p-4 rounded-lg border border-purple-600/30">
            <h4 className="text-purple-400 font-medium mb-2">
              {getVehicleName(selectedVehicle1)}
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-300">Média de Consumo:</span>
                <span className="text-white font-bold">{vehicle1Consumption.toFixed(2)} km/l</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Abastecimentos:</span>
                <span className="text-white">
                  {selectedVehicle1 === 'all' 
                    ? filteredRecords.length 
                    : filteredRecords.filter(r => r.vehicleId === selectedVehicle1).length
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Comparação */}
          {showComparison && selectedVehicle2 && (
            <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-600/30">
              <h4 className="text-blue-400 font-medium mb-2">
                {getVehicleName(selectedVehicle2)}
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-300">Média de Consumo:</span>
                  <span className="text-white font-bold">{vehicle2Consumption.toFixed(2)} km/l</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Abastecimentos:</span>
                  <span className="text-white">
                    {filteredRecords.filter(r => r.vehicleId === selectedVehicle2).length}
                  </span>
                </div>
                <div className="mt-3 pt-3 border-t border-blue-600/30">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Diferença:</span>
                    <span className={`font-bold ${
                      vehicle2Consumption > vehicle1Consumption ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {vehicle2Consumption > vehicle1Consumption ? '+' : ''}
                      {(vehicle2Consumption - vehicle1Consumption).toFixed(2)} km/l
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {filteredRecords.length === 0 && (
          <div className="text-center py-6">
            <TrendingUp className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">
              Nenhum abastecimento com dados de consumo no período selecionado.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
