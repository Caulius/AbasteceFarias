import React from 'react';
import { X, Fuel, User, Car, Calendar, Gauge, Route, Calculator, FileText, CheckCircle, Clock } from 'lucide-react';
import type { FuelRecord, Responsible, Vehicle } from '../types';

interface FuelModalProps {
  record: FuelRecord;
  responsible: Responsible | undefined;
  vehicle: Vehicle | undefined;
  isOpen: boolean;
  onClose: () => void;
}

const FuelModal: React.FC<FuelModalProps> = ({ record, responsible, vehicle, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <Fuel className="h-6 w-6 mr-2 text-blue-500" />
            Detalhes do Abastecimento
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-white mb-3 flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-500" />
                Responsável
              </h3>
              <p className="text-gray-300">{responsible?.name || 'N/A'}</p>
              {responsible?.phone && (
                <p className="text-gray-400 text-sm mt-1">{responsible.phone}</p>
              )}
            </div>

            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-white mb-3 flex items-center">
                <Car className="h-5 w-5 mr-2 text-blue-500" />
                Veículo
              </h3>
              <p className="text-gray-300">{vehicle?.plate} - {vehicle?.model}</p>
            </div>
          </div>

          {/* Data e Tipos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-white mb-3 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                Data do Abastecimento
              </h3>
              <p className="text-gray-300">
                {new Date(record.date).toLocaleDateString('pt-BR')} às {new Date(record.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-white mb-3 flex items-center">
                {record.status === 'CONCLUIDO' ? (
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                ) : (
                  <Clock className="h-5 w-5 mr-2 text-yellow-500" />
                )}
                Status
              </h3>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                record.status === 'CONCLUIDO'
                  ? 'bg-green-900/30 text-green-400 border border-green-600/30'
                  : 'bg-yellow-900/30 text-yellow-400 border border-yellow-600/30'
              }`}>
                {record.status === 'CONCLUIDO' ? (
                  <CheckCircle className="h-4 w-4 mr-1" />
                ) : (
                  <Clock className="h-4 w-4 mr-1" />
                )}
                {record.status}
              </span>
            </div>
          </div>

          {/* Tipos de Combustível */}
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <div className="bg-gray-700 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-white mb-3 flex items-center">
                <Fuel className="h-5 w-5 mr-2 text-blue-500" />
                Tipos de Combustível
              </h3>
              <div className="flex space-x-2">
                {record.fuelTypes.map(type => (
                  <span
                    key={type}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      type === 'DIESEL' 
                        ? 'bg-orange-600 text-white' 
                        : 'bg-green-600 text-white'
                    }`}
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Dados DIESEL */}
          {record.fuelTypes.includes('DIESEL') && (
            <div className="bg-orange-900/20 p-4 rounded-lg border border-orange-600/30">
              <h3 className="text-lg font-medium text-orange-400 mb-4 flex items-center">
                <Gauge className="h-5 w-5 mr-2" />
                Dados do DIESEL
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {record.dieselOdometerStart && (
                  <div>
                    <p className="text-gray-400 text-sm">Hodômetro Inicial</p>
                    <p className="text-white font-medium">{record.dieselOdometerStart}</p>
                  </div>
                )}
                {record.dieselOdometerEnd && (
                  <div>
                    <p className="text-gray-400 text-sm">Hodômetro Final</p>
                    <p className="text-white font-medium">{record.dieselOdometerEnd}</p>
                  </div>
                )}
                {record.dieselLevelStart && (
                  <div>
                    <p className="text-gray-400 text-sm">Nível Inicial</p>
                    <p className="text-white font-medium">{record.dieselLevelStart}</p>
                  </div>
                )}
                {record.dieselLevelEnd && (
                  <div>
                    <p className="text-gray-400 text-sm">Nível Final</p>
                    <p className="text-white font-medium">{record.dieselLevelEnd}L</p>
                  </div>
                )}
                {record.dieselTotalRefueled && (
                  <div>
                    <p className="text-gray-400 text-sm">Total Abastecido</p>
                    <p className="text-orange-400 font-medium">{record.dieselTotalRefueled}L</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Dados ARLA */}
          {record.fuelTypes.includes('ARLA') && (
            <div className="bg-green-900/20 p-4 rounded-lg border border-green-600/30">
              <h3 className="text-lg font-medium text-green-400 mb-4">
                Dados do ARLA
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {record.arlaOdometerStart && (
                  <div>
                    <p className="text-gray-400 text-sm">Hodômetro Inicial</p>
                    <p className="text-white font-medium">{record.arlaOdometerStart}</p>
                  </div>
                )}
                {record.arlaOdometerEnd && (
                  <div>
                    <p className="text-gray-400 text-sm">Hodômetro Final</p>
                    <p className="text-white font-medium">{record.arlaOdometerEnd}</p>
                  </div>
                )}
                {record.arlaLevelStart && (
                  <div>
                    <p className="text-gray-400 text-sm">Nível Inicial</p>
                    <p className="text-white font-medium">{record.arlaLevelStart}</p>
                  </div>
                )}
                {record.arlaLevelEnd && (
                  <div>
                    <p className="text-gray-400 text-sm">Nível Final</p>
                    <p className="text-white font-medium">{record.arlaLevelEnd}L</p>
                  </div>
                )}
                {record.arlaTotalRefueled && (
                  <div>
                    <p className="text-gray-400 text-sm">Total Abastecido</p>
                    <p className="text-green-400 font-medium">{record.arlaTotalRefueled}L</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Dados Gerais */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {record.vehicleKm && (
              <div className="bg-gray-700 p-4 rounded-lg">
                <h4 className="text-white font-medium mb-2 flex items-center">
                  <Route className="h-4 w-4 mr-2 text-blue-500" />
                  KM do Veículo
                </h4>
                <p className="text-gray-300">{record.vehicleKm} km</p>
              </div>
            )}

            {record.average && (
              <div className="bg-gray-700 p-4 rounded-lg">
                <h4 className="text-white font-medium mb-2 flex items-center">
                  <Calculator className="h-4 w-4 mr-2 text-blue-500" />
                  Média de Consumo
                </h4>
                <p className="text-purple-400 font-medium">{record.average} km/l</p>
              </div>
            )}

            {record.averagePanel && (
              <div className="bg-gray-700 p-4 rounded-lg">
                <h4 className="text-white font-medium mb-2 flex items-center">
                  <Calculator className="h-4 w-4 mr-2 text-blue-500" />
                  Média Painel
                </h4>
                <p className="text-blue-400 font-medium">{record.averagePanel} km/l</p>
              </div>
            )}
          </div>

          {/* Observações */}
          {record.observations && (
            <div className="bg-gray-700 p-4 rounded-lg">
              <h4 className="text-white font-medium mb-2 flex items-center">
                <FileText className="h-4 w-4 mr-2 text-blue-500" />
                Observações
              </h4>
              <p className="text-gray-300 italic">"{record.observations}"</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-700">
          <button
            onClick={onClose}
            className="w-full md:w-auto px-6 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-500 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default FuelModal;
