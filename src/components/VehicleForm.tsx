import React, { useState } from 'react';
import { Plus, Car } from 'lucide-react';
import type { Vehicle } from '../types';

interface VehicleFormProps {
  onAdd: (vehicle: Omit<Vehicle, 'id' | 'createdAt'>) => void;
}

const VehicleForm: React.FC<VehicleFormProps> = ({ onAdd }) => {
  const [formData, setFormData] = useState({
    plate: '',
    model: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.plate.trim() && formData.model.trim()) {
      onAdd(formData);
      setFormData({ plate: '', model: '' });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <Plus className="h-5 w-5 mr-2 text-blue-600" />
        Cadastrar Veículo
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="plate" className="block text-sm font-medium text-gray-300 mb-2">
            Placa *
          </label>
          <input
            type="text"
            id="plate"
            name="plate"
            value={formData.plate}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-white placeholder-gray-400"
            placeholder="ABC-1234"
          />
        </div>
        
        <div>
          <label htmlFor="model" className="block text-sm font-medium text-gray-300 mb-2">
            <Car className="h-4 w-4 inline mr-1" />
            Modelo *
          </label>
          <input
            type="text"
            id="model"
            name="model"
            value={formData.model}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-white placeholder-gray-400"
            placeholder="Modelo do veículo"
          />
        </div>
      </div>
      
      <button
        type="submit"
        className="mt-4 w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        Cadastrar Veículo
      </button>
    </form>
  );
};

export default VehicleForm;