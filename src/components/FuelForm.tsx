import React, { useState } from 'react';
import { Fuel, Gauge, Route, FileText, Calculator } from 'lucide-react';
import type { FuelRecord, Responsible, Vehicle } from '../types';

interface FuelFormProps {
  responsibles: Responsible[];
  vehicles: Vehicle[];
  fuelRecords: FuelRecord[];
  onAdd: (record: Omit<FuelRecord, 'id' | 'createdAt'>) => void;
  editingRecord?: FuelRecord | null;
}

const FuelForm: React.FC<FuelFormProps> = ({ responsibles, vehicles, fuelRecords, onAdd, editingRecord }) => {
  const [formData, setFormData] = useState({
    responsibleId: '',
    vehicleId: '',
    fuelTypes: [] as ('DIESEL' | 'ARLA')[],
    dieselOdometerStart: '',
    dieselOdometerEnd: '',
    dieselLevelType: 'none' as 'none' | 'start' | 'end',
    dieselLevelStart: '',
    dieselLevelEnd: '',
    arlaOdometerStart: '',
    arlaOdometerEnd: '',
    arlaLevelType: 'none' as 'none' | 'start' | 'end',
    arlaLevelStart: '',
    arlaLevelEnd: '',
    dieselDailyType: 'none' as 'none' | 'start' | 'end',
    dieselDailyStart: '',
    dieselDailyEnd: '',
    dieselTotalRefueled: '',
    arlaDailyType: 'none' as 'none' | 'start' | 'end',
    arlaDailyStart: '',
    arlaDailyEnd: '',
    arlaTotalRefueled: '',
    vehicleKm: '',
    averagePanel: '',
    observations: ''
  });

  // Função para obter o último hodômetro final do DIESEL
  const getLastDieselOdometer = (): number | null => {
    const dieselRecords = fuelRecords
      .filter(record => record.fuelTypes.includes('DIESEL') && record.dieselOdometerEnd)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return dieselRecords.length > 0 ? dieselRecords[0].dieselOdometerEnd! : null;
  };

  // Função para obter o último hodômetro final do ARLA
  const getLastArlaOdometer = (): number | null => {
    const arlaRecords = fuelRecords
      .filter(record => record.fuelTypes.includes('ARLA') && record.arlaOdometerEnd)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return arlaRecords.length > 0 ? arlaRecords[0].arlaOdometerEnd! : null;
  };

  // Função para obter o último KM do veículo registrado
  const getLastVehicleKm = (vehicleId: string): number | null => {
    if (!vehicleId) return null;
    
    const vehicleRecords = fuelRecords
      .filter(record => record.vehicleId === vehicleId && record.vehicleKm)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return vehicleRecords.length > 0 ? vehicleRecords[0].vehicleKm! : null;
  };

  // Função para calcular a média de consumo automaticamente
  const calculateAverage = (): number | null => {
    const currentKm = parseFloat(formData.vehicleKm);
    const totalRefueled = parseFloat(formData.dieselTotalRefueled);
    const vehicleId = formData.vehicleId;
    
    if (!currentKm || !totalRefueled || !vehicleId) return null;
    
    const lastKm = getLastVehicleKm(vehicleId);
    if (lastKm === null) return null;
    
    const kmDifference = currentKm - lastKm;
    if (kmDifference <= 0) return null;
    
    return kmDifference / totalRefueled;
  };

  // Calcular média automaticamente
  const calculatedAverage = calculateAverage();
  
  // Calcular total da bomba DIESEL automaticamente
  const calculateDieselPumpTotal = (): number | null => {
    const start = parseFloat(formData.dieselOdometerStart);
    const end = parseFloat(formData.dieselOdometerEnd);
    
    if (!isNaN(start) && !isNaN(end) && end > start) {
      return end - start;
    }
    return null;
  };
  
  // Calcular total da bomba ARLA automaticamente
  const calculateArlaPumpTotal = (): number | null => {
    const start = parseFloat(formData.arlaOdometerStart);
    const end = parseFloat(formData.arlaOdometerEnd);
    
    if (!isNaN(start) && !isNaN(end) && end > start) {
      return end - start;
    }
    return null;
  };
  
  const calculatedDieselPumpTotal = calculateDieselPumpTotal();
  const calculatedArlaPumpTotal = calculateArlaPumpTotal();
  
  // Função para autopreencher hodômetros quando o tipo de combustível é selecionado
  const handleFuelTypeChange = (fuelType: 'DIESEL' | 'ARLA') => {
    const isSelected = formData.fuelTypes.includes(fuelType);
    
    if (isSelected) {
      // Removendo o tipo de combustível
      setFormData(prev => ({
        ...prev,
        fuelTypes: prev.fuelTypes.filter(type => type !== fuelType),
        // Limpar campos relacionados quando desmarcar
        ...(fuelType === 'DIESEL' && {
          dieselOdometerStart: '',
          dieselOdometerEnd: '',
          dieselLevelStart: '',
          dieselLevelEnd: '',
          dieselDailyStart: '',
          dieselDailyEnd: '',
          dieselTotalRefueled: ''
        }),
        ...(fuelType === 'ARLA' && {
          arlaOdometerStart: '',
          arlaOdometerEnd: '',
          arlaLevelStart: '',
          arlaLevelEnd: '',
          arlaDailyStart: '',
          arlaDailyEnd: '',
          arlaTotalRefueled: ''
        })
      }));
    } else {
      // Adicionando o tipo de combustível e autopreenchendo
      const newFuelTypes = [...formData.fuelTypes, fuelType];
      let autoFillData = {};
      
      if (fuelType === 'DIESEL' && !editingRecord) {
        const lastDieselOdometer = getLastDieselOdometer();
        if (lastDieselOdometer !== null) {
          autoFillData = { dieselOdometerStart: lastDieselOdometer.toString() };
        }
      }
      
      if (fuelType === 'ARLA' && !editingRecord) {
        const lastArlaOdometer = getLastArlaOdometer();
        if (lastArlaOdometer !== null) {
          autoFillData = { ...autoFillData, arlaOdometerStart: lastArlaOdometer.toString() };
        }
      }
      
      setFormData(prev => ({
        ...prev,
        fuelTypes: newFuelTypes,
        ...autoFillData
      }));
    }
  };
  // Preencher formulário quando editando
  React.useEffect(() => {
    if (editingRecord) {
      // Determinar tipo de nível diesel
      let dieselLevelType: 'none' | 'start' | 'end' = 'none';
      if (editingRecord.dieselLevelStart !== undefined) dieselLevelType = 'start';
      if (editingRecord.dieselLevelEnd !== undefined) dieselLevelType = 'end';
      
      // Determinar tipo de nível arla
      let arlaLevelType: 'none' | 'start' | 'end' = 'none';
      if (editingRecord.arlaLevelStart !== undefined) arlaLevelType = 'start';
      if (editingRecord.arlaLevelEnd !== undefined) arlaLevelType = 'end';
      
      // Determinar tipo diário diesel
      let dieselDailyType: 'none' | 'start' | 'end' = 'none';
      if (editingRecord.dieselDailyStart !== undefined) dieselDailyType = 'start';
      if (editingRecord.dieselDailyEnd !== undefined) dieselDailyType = 'end';
      
      // Determinar tipo diário arla
      let arlaDailyType: 'none' | 'start' | 'end' = 'none';
      if (editingRecord.arlaDailyStart !== undefined) arlaDailyType = 'start';
      if (editingRecord.arlaDailyEnd !== undefined) arlaDailyType = 'end';
      
      setFormData({
        responsibleId: editingRecord.responsibleId,
        vehicleId: editingRecord.vehicleId,
        fuelTypes: editingRecord.fuelTypes,
        dieselOdometerStart: editingRecord.dieselOdometerStart?.toString() || '',
        dieselOdometerEnd: editingRecord.dieselOdometerEnd?.toString() || '',
        dieselLevelType,
        dieselLevelStart: editingRecord.dieselLevelStart?.toString() || '',
        dieselLevelEnd: editingRecord.dieselLevelEnd?.toString() || '',
        arlaOdometerStart: editingRecord.arlaOdometerStart?.toString() || '',
        arlaOdometerEnd: editingRecord.arlaOdometerEnd?.toString() || '',
        arlaLevelType,
        arlaLevelStart: editingRecord.arlaLevelStart?.toString() || '',
        arlaLevelEnd: editingRecord.arlaLevelEnd?.toString() || '',
        dieselDailyType,
        dieselDailyStart: editingRecord.dieselDailyStart?.toString() || '',
        dieselDailyEnd: editingRecord.dieselDailyEnd?.toString() || '',
        dieselTotalRefueled: editingRecord.dieselTotalRefueled?.toString() || '',
        arlaDailyType,
        arlaDailyStart: editingRecord.arlaDailyStart?.toString() || '',
        arlaDailyEnd: editingRecord.arlaDailyEnd?.toString() || '',
        arlaTotalRefueled: editingRecord.arlaTotalRefueled?.toString() || '',
        vehicleKm: editingRecord.vehicleKm?.toString() || '',
        averagePanel: editingRecord.averagePanel?.toString() || '',
        observations: editingRecord.observations || ''
      });
    }
  }, [editingRecord]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações
    const isDieselSelected = formData.fuelTypes.includes('DIESEL');
    const isArlaSelected = formData.fuelTypes.includes('ARLA');
    
    // Validar campos obrigatórios
    if (!formData.responsibleId || !formData.vehicleId || formData.fuelTypes.length === 0) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    
    // Validar hodômetros obrigatórios para DIESEL
    if (isDieselSelected && (!formData.dieselOdometerStart || !formData.dieselOdometerEnd)) {
      alert('Hodômetro inicial e final são obrigatórios para DIESEL.');
      return;
    }
    
    // Validar total abastecido obrigatório para DIESEL
    if (isDieselSelected && !formData.dieselTotalRefueled) {
      alert('Total Abastecido é obrigatório para DIESEL.');
      return;
    }
    
    // Validar hodômetros obrigatórios para ARLA
    if (isArlaSelected && (!formData.arlaOdometerStart || !formData.arlaOdometerEnd)) {
      alert('Hodômetro inicial e final são obrigatórios para ARLA.');
      return;
    }
    
    // Validar total abastecido obrigatório para ARLA
    if (isArlaSelected && !formData.arlaTotalRefueled) {
      alert('Total Abastecido é obrigatório para ARLA.');
      return;
    }
    
    // Construir objeto do registro
      const record = {
        date: new Date(),
        responsibleId: formData.responsibleId,
        vehicleId: formData.vehicleId,
        fuelTypes: formData.fuelTypes,
        status: 'PENDENTE' as const,
        // Campos DIESEL
        ...(isDieselSelected && formData.dieselOdometerStart && { dieselOdometerStart: Number(formData.dieselOdometerStart) }),
        ...(isDieselSelected && formData.dieselOdometerEnd && { dieselOdometerEnd: Number(formData.dieselOdometerEnd) }),
        ...(isDieselSelected && formData.dieselLevelType === 'start' && formData.dieselLevelStart && { dieselLevelStart: Number(formData.dieselLevelStart) }),
        ...(isDieselSelected && formData.dieselLevelType === 'end' && formData.dieselLevelEnd && { dieselLevelEnd: Number(formData.dieselLevelEnd) }),
        ...(isDieselSelected && formData.dieselDailyType === 'start' && formData.dieselDailyStart && { dieselDailyStart: Number(formData.dieselDailyStart) }),
        ...(isDieselSelected && formData.dieselDailyType === 'end' && formData.dieselDailyEnd && { dieselDailyEnd: Number(formData.dieselDailyEnd) }),
        ...(isDieselSelected && formData.dieselTotalRefueled && { dieselTotalRefueled: Number(formData.dieselTotalRefueled) }),
        ...(isDieselSelected && calculatedDieselPumpTotal !== null && { dieselPumpTotal: Number(calculatedDieselPumpTotal.toFixed(2)) }),
        // Campos ARLA
        ...(isArlaSelected && formData.arlaOdometerStart && { arlaOdometerStart: Number(formData.arlaOdometerStart) }),
        ...(isArlaSelected && formData.arlaOdometerEnd && { arlaOdometerEnd: Number(formData.arlaOdometerEnd) }),
        ...(isArlaSelected && formData.arlaLevelType === 'start' && formData.arlaLevelStart && { arlaLevelStart: Number(formData.arlaLevelStart) }),
        ...(isArlaSelected && formData.arlaLevelType === 'end' && formData.arlaLevelEnd && { arlaLevelEnd: Number(formData.arlaLevelEnd) }),
        ...(isArlaSelected && formData.arlaDailyType === 'start' && formData.arlaDailyStart && { arlaDailyStart: Number(formData.arlaDailyStart) }),
        ...(isArlaSelected && formData.arlaDailyType === 'end' && formData.arlaDailyEnd && { arlaDailyEnd: Number(formData.arlaDailyEnd) }),
        ...(isArlaSelected && formData.arlaTotalRefueled && { arlaTotalRefueled: Number(formData.arlaTotalRefueled) }),
        ...(isArlaSelected && calculatedArlaPumpTotal !== null && { arlaPumpTotal: Number(calculatedArlaPumpTotal.toFixed(2)) }),
        // Campos gerais
        ...(formData.vehicleKm && { vehicleKm: Number(formData.vehicleKm) }),
        ...(calculatedAverage !== null && { average: Number(calculatedAverage.toFixed(2)) }),
        ...(formData.averagePanel && { averagePanel: Number(formData.averagePanel) }),
        ...(formData.observations && { observations: formData.observations })
      };
      
      onAdd(record);
      
      if (!editingRecord) {
        setFormData({
          responsibleId: '',
          vehicleId: '',
          fuelTypes: [],
          dieselOdometerStart: '',
          dieselOdometerEnd: '',
          dieselLevelType: 'none',
          dieselLevelStart: '',
          dieselLevelEnd: '',
          arlaOdometerStart: '',
          arlaOdometerEnd: '',
          arlaLevelType: 'none',
          arlaLevelStart: '',
          arlaLevelEnd: '',
          dieselDailyType: 'none',
          dieselDailyStart: '',
          dieselDailyEnd: '',
          dieselTotalRefueled: '',
          arlaDailyType: 'none',
          arlaDailyStart: '',
          arlaDailyEnd: '',
          arlaTotalRefueled: '',
          vehicleKm: '',
          averagePanel: '',
          observations: ''
        });
      }
  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const isDieselSelected = formData.fuelTypes.includes('DIESEL');
  const isArlaSelected = formData.fuelTypes.includes('ARLA');

  // Obter informações dos últimos hodômetros para exibir na interface
  const lastDieselOdometer = getLastDieselOdometer();
  const lastArlaOdometer = getLastArlaOdometer();
  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-700 w-full overflow-x-hidden">
      <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
        <Fuel className="h-5 w-5 mr-2 text-blue-600" />
        {editingRecord ? 'Editar Abastecimento' : 'Registrar Abastecimento'}
      </h3>

      {/* Informações dos últimos hodômetros */}
      {!editingRecord && (lastDieselOdometer !== null || lastArlaOdometer !== null) && (
        <div className="mb-6 p-4 bg-blue-900/20 rounded-lg border border-blue-600/30">
          <h4 className="text-blue-400 font-medium mb-2 flex items-center">
            <Gauge className="h-4 w-4 mr-2" />
            Últimos Hodômetros Registrados
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {lastDieselOdometer !== null && (
              <div className="flex items-center">
                <span className="text-orange-400 font-medium">DIESEL:</span>
                <span className="text-white ml-2">{lastDieselOdometer.toLocaleString()}</span>
                <span className="text-gray-400 ml-1">(será usado como inicial)</span>
              </div>
            )}
            {lastArlaOdometer !== null && (
              <div className="flex items-center">
                <span className="text-green-400 font-medium">ARLA:</span>
                <span className="text-white ml-2">{lastArlaOdometer.toLocaleString()}</span>
                <span className="text-gray-400 ml-1">(será usado como inicial)</span>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Seleções Básicas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label htmlFor="responsibleId" className="block text-sm font-medium text-gray-300 mb-2">
            Responsável *
          </label>
          <select
            id="responsibleId"
            name="responsibleId"
            value={formData.responsibleId}
            onChange={handleChange}
            required
            className="w-full px-3 sm:px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-white text-sm sm:text-base"
          >
            <option value="">Selecione um responsável</option>
            {responsibles.map(responsible => (
              <option key={responsible.id} value={responsible.id}>
                {responsible.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="vehicleId" className="block text-sm font-medium text-gray-300 mb-2">
            Veículo *
          </label>
          <select
            id="vehicleId"
            name="vehicleId"
            value={formData.vehicleId}
            onChange={handleChange}
            required
            className="w-full px-3 sm:px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-white text-sm sm:text-base"
          >
            <option value="">Selecione um veículo</option>
            {vehicles.map(vehicle => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.plate} - {vehicle.model}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tipos de Combustível */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Tipo de Abastecimento *
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isDieselSelected}
              onChange={() => handleFuelTypeChange('DIESEL')}
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-300">DIESEL</span>
            {!editingRecord && lastDieselOdometer !== null && (
              <span className="ml-2 text-xs text-orange-400">
                (último: {lastDieselOdometer.toLocaleString()})
              </span>
            )}
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isArlaSelected}
              onChange={() => handleFuelTypeChange('ARLA')}
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-300">ARLA</span>
            {!editingRecord && lastArlaOdometer !== null && (
              <span className="ml-2 text-xs text-green-400">
                (último: {lastArlaOdometer.toLocaleString()})
              </span>
            )}
          </label>
        </div>
      </div>

      {/* Campos Diesel */}
      {isDieselSelected && (
        <div className="mb-6 p-4 bg-orange-900/20 rounded-lg border border-orange-600/30">
          <h4 className="text-md font-semibold text-orange-400 mb-4 flex items-center">
            <Gauge className="h-4 w-4 mr-2" />
            Dados do DIESEL
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Hodômetro Inicial *
              </label>
              <input
                type="number"
                name="dieselOdometerStart"
                value={formData.dieselOdometerStart}
                onChange={handleChange}
                required={isDieselSelected}
                className="w-full px-3 sm:px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-white placeholder-gray-400 text-sm sm:text-base"
                placeholder="Contagem inicial"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Hodômetro Final *
              </label>
              <input
                type="number"
                name="dieselOdometerEnd"
                value={formData.dieselOdometerEnd}
                onChange={handleChange}
                required={isDieselSelected}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-white placeholder-gray-400"
                placeholder="Contagem final"
              />
            </div>
            
            {/* Seletor de Tipo de Nível */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nível DIESEL (Opcional)
              </label>
              <select
                name="dieselLevelType"
                value={formData.dieselLevelType}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-white mb-3"
              >
                <option value="none">Não informar nível</option>
                <option value="start">Nível inicial</option>
                <option value="end">Nível final</option>
              </select>
            </div>
            
            {/* Campo de Nível baseado na seleção */}
            {formData.dieselLevelType === 'start' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nível DIESEL Inicial
                </label>
                <input
                  type="number"
                  name="dieselLevelStart"
                  value={formData.dieselLevelStart}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-white placeholder-gray-400"
                  placeholder="Nível inicial"
                />
              </div>
            )}
            
            {formData.dieselLevelType === 'end' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nível DIESEL Final
                </label>
                <input
                  type="number"
                  name="dieselLevelEnd"
                  value={formData.dieselLevelEnd}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-white placeholder-gray-400"
                  placeholder="Nível final"
                />
              </div>
            )}
            
            {/* Campos de Total Diário */}
            {/* Seletor de Tipo Diário */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Total DIESEL Diário (Opcional)
              </label>
              <select
                name="dieselDailyType"
                value={formData.dieselDailyType}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-white mb-3"
              >
                <option value="none">Não informar total diário</option>
                <option value="start">Total início do dia</option>
                <option value="end">Total final do dia</option>
              </select>
            </div>
            
            {/* Campo Diário baseado na seleção */}
            {formData.dieselDailyType === 'start' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  DIESEL Início do Dia (L)
                </label>
                <input
                  type="number"
                  name="dieselDailyStart"
                  value={formData.dieselDailyStart}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-white placeholder-gray-400"
                  placeholder="Total disponível no início do dia"
                />
              </div>
            )}
            
            {formData.dieselDailyType === 'end' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  DIESEL Final do Dia (L)
                </label>
                <input
                  type="number"
                  name="dieselDailyEnd"
                  value={formData.dieselDailyEnd}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-white placeholder-gray-400"
                  placeholder="Total disponível no final do dia"
                />
              </div>
            )}
            
            {/* Campo Total Abastecido */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Total Abastecido (L) *
              </label>
              <input
                type="number"
                name="dieselTotalRefueled"
                value={formData.dieselTotalRefueled}
                onChange={handleChange}
                required={isDieselSelected}
                step="0.01"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-white placeholder-gray-400"
                placeholder="Quantidade total abastecida"
              />
            </div>
            
            {/* Campo Total Abastecido Bomba (calculado automaticamente) */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Total abastecido Bomba (L)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={calculatedDieselPumpTotal !== null ? calculatedDieselPumpTotal.toFixed(2) : ''}
                  readOnly
                  className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white cursor-not-allowed"
                  placeholder="Calculado automaticamente"
                />
                {calculatedDieselPumpTotal === null && formData.dieselOdometerStart && formData.dieselOdometerEnd && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-yellow-400 text-xs">
                      Verificar hodômetros
                    </span>
                  </div>
                )}
              </div>
              <div className="mt-1 text-xs text-gray-400">
                {formData.dieselOdometerStart && formData.dieselOdometerEnd ? (
                  calculatedDieselPumpTotal !== null ? (
                    `Cálculo: ${formData.dieselOdometerEnd} - ${formData.dieselOdometerStart} = ${calculatedDieselPumpTotal.toFixed(2)}L`
                  ) : (
                    'Hodômetro final deve ser maior que o inicial'
                  )
                ) : (
                  'Preencha os hodômetros inicial e final para calcular automaticamente'
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Campos ARLA */}
      {isArlaSelected && (
        <div className="mb-6 p-4 bg-green-900/20 rounded-lg border border-green-600/30">
          <h4 className="text-md font-semibold text-green-400 mb-4">
            Dados do ARLA
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Hodômetro Inicial *
              </label>
              <input
                type="number"
                name="arlaOdometerStart"
                value={formData.arlaOdometerStart}
                onChange={handleChange}
                required={isArlaSelected}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-white placeholder-gray-400"
                placeholder="Contagem inicial"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Hodômetro Final *
              </label>
              <input
                type="number"
                name="arlaOdometerEnd"
                value={formData.arlaOdometerEnd}
                onChange={handleChange}
                required={isArlaSelected}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-white placeholder-gray-400"
                placeholder="Contagem final"
              />
            </div>
            
            {/* Seletor de Tipo de Nível */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nível ARLA (Opcional)
              </label>
              <select
                name="arlaLevelType"
                value={formData.arlaLevelType}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-white mb-3"
              >
                <option value="none">Não informar nível</option>
                <option value="start">Nível inicial</option>
                <option value="end">Nível final</option>
              </select>
            </div>
            
            {/* Campo de Nível baseado na seleção */}
            {formData.arlaLevelType === 'start' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nível ARLA Inicial
                </label>
                <input
                  type="number"
                  name="arlaLevelStart"
                  value={formData.arlaLevelStart}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-white placeholder-gray-400"
                  placeholder="Nível inicial"
                />
              </div>
            )}
            
            {formData.arlaLevelType === 'end' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nível ARLA Final
                </label>
                <input
                  type="number"
                  name="arlaLevelEnd"
                  value={formData.arlaLevelEnd}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-white placeholder-gray-400"
                  placeholder="Nível final"
                />
              </div>
            )}
            
            {/* Campos de Total Diário */}
            {/* Seletor de Tipo Diário */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Total ARLA Diário (Opcional)
              </label>
              <select
                name="arlaDailyType"
                value={formData.arlaDailyType}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-white mb-3"
              >
                <option value="none">Não informar total diário</option>
                <option value="start">Total início do dia</option>
                <option value="end">Total final do dia</option>
              </select>
            </div>
            
            {/* Campo Diário baseado na seleção */}
            {formData.arlaDailyType === 'start' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  ARLA Início do Dia (L)
                </label>
                <input
                  type="number"
                  name="arlaDailyStart"
                  value={formData.arlaDailyStart}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-white placeholder-gray-400"
                  placeholder="Total disponível no início do dia"
                />
              </div>
            )}
            
            {formData.arlaDailyType === 'end' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  ARLA Final do Dia (L)
                </label>
                <input
                  type="number"
                  name="arlaDailyEnd"
                  value={formData.arlaDailyEnd}
                  onChange={handleChange}
                  step="0.01"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-white placeholder-gray-400"
                  placeholder="Total disponível no final do dia"
                />
              </div>
            )}
            
            {/* Campo Total Abastecido */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Total Abastecido (L) *
              </label>
              <input
                type="number"
                name="arlaTotalRefueled"
                value={formData.arlaTotalRefueled}
                onChange={handleChange}
                required={isArlaSelected}
                step="0.01"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-white placeholder-gray-400"
                placeholder="Quantidade total abastecida"
              />
            </div>
            
            {/* Campo Total Abastecido Bomba (calculado automaticamente) */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Total abastecido Bomba (L)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={calculatedArlaPumpTotal !== null ? calculatedArlaPumpTotal.toFixed(2) : ''}
                  readOnly
                  className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white cursor-not-allowed"
                  placeholder="Calculado automaticamente"
                />
                {calculatedArlaPumpTotal === null && formData.arlaOdometerStart && formData.arlaOdometerEnd && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <span className="text-yellow-400 text-xs">
                      Verificar hodômetros
                    </span>
                  </div>
                )}
              </div>
              <div className="mt-1 text-xs text-gray-400">
                {formData.arlaOdometerStart && formData.arlaOdometerEnd ? (
                  calculatedArlaPumpTotal !== null ? (
                    `Cálculo: ${formData.arlaOdometerEnd} - ${formData.arlaOdometerStart} = ${calculatedArlaPumpTotal.toFixed(2)}L`
                  ) : (
                    'Hodômetro final deve ser maior que o inicial'
                  )
                ) : (
                  'Preencha os hodômetros inicial e final para calcular automaticamente'
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dados Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Route className="h-4 w-4 inline mr-1" />
            KM do Veículo
          </label>
          <input
            type="number"
            name="vehicleKm"
            value={formData.vehicleKm}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-white placeholder-gray-400"
            placeholder="Quilometragem"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Calculator className="h-4 w-4 inline mr-1" />
            Média Painel (km/l)
          </label>
          <input
            type="number"
            name="averagePanel"
            value={formData.averagePanel}
            onChange={handleChange}
            step="0.01"
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-white placeholder-gray-400"
            placeholder="Média do painel"
          />
          <div className="mt-1 text-xs text-gray-400">
            Média mostrada no painel do veículo
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Calculator className="h-4 w-4 inline mr-1" />
            Média (km/l)
          </label>
          <div className="relative">
            <input
              type="text"
              value={calculatedAverage !== null ? calculatedAverage.toFixed(2) : ''}
              readOnly
              className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white cursor-not-allowed"
              placeholder="Calculado automaticamente"
            />
            {calculatedAverage === null && formData.vehicleKm && formData.dieselTotalRefueled && formData.vehicleId && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-yellow-400 text-xs">
                  {getLastVehicleKm(formData.vehicleId) === null ? 'Sem histórico' : 'Verificar dados'}
                </span>
              </div>
            )}
          </div>
          {formData.vehicleKm && formData.dieselTotalRefueled && formData.vehicleId && (
            <div className="mt-2 text-xs text-gray-400">
              {(() => {
                const lastKm = getLastVehicleKm(formData.vehicleId);
                const currentKm = parseFloat(formData.vehicleKm);
                const totalRefueled = parseFloat(formData.dieselTotalRefueled);
                
                if (lastKm === null) {
                  return 'Primeiro registro deste veículo - média não calculada';
                }
                
                if (currentKm <= lastKm) {
                  return `KM atual (${currentKm}) deve ser maior que o último (${lastKm})`;
                }
                
                const kmDiff = currentKm - lastKm;
                return `Cálculo: (${currentKm} - ${lastKm}) ÷ ${totalRefueled} = ${(kmDiff / totalRefueled).toFixed(2)} km/l`;
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Observações */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <FileText className="h-4 w-4 inline mr-1" />
          Observações
        </label>
        <textarea
          name="observations"
          value={formData.observations}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-white placeholder-gray-400"
          placeholder="Observações adicionais..."
        />
      </div>

      <button
        type="submit"
        className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
      >
        <Fuel className="h-4 w-4 mr-2" />
        {editingRecord ? 'Atualizar Abastecimento' : 'Registrar Abastecimento'}
      </button>
    </form>
  );
};

export default FuelForm;
