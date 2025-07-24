import React from 'react';
import { Car, Calendar, Trash2 } from 'lucide-react';
import type { Vehicle } from '../types';

interface VehicleListProps {
  vehicles: Vehicle[];
  onDelete: (id: string) => void;
}

const VehicleList: React.FC<VehicleListProps> = ({ vehicles, onDelete }) => {
  if (vehicles.length === 0) {
    return (
      <div className="bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-700 text-center">
        <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">
          Nenhum veículo cadastrado
        </h3>
        <p className="text-gray-400">
          Adicione veículos para começar a registrar abastecimentos.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700">
      <div className="p-6 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white">
          Veículos Cadastrados
        </h3>
      </div>
      <div className="divide-y divide-gray-700">
        {vehicles.map((vehicle) => (
          <div key={vehicle.id} className="p-6 hover:bg-gray-700 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Car className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-white">{vehicle.plate}</h4>
                  <div className="flex items-center space-x-4 mt-1">
                    <p className="text-sm text-gray-300">{vehicle.model}</p>
                    <div className="flex items-center text-sm text-gray-300">
                      <Calendar className="h-4 w-4 mr-1" />
                      Cadastrado em {new Date(vehicle.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={() => onDelete(vehicle.id)}
                className="p-2 text-red-400 hover:bg-red-600/20 rounded-lg transition-colors"
                title="Excluir veículo"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VehicleList;