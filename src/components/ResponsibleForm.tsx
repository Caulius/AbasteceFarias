import React, { useState } from 'react';
import { Plus, User, Phone } from 'lucide-react';
import type { Responsible } from '../types';

interface ResponsibleFormProps {
  onAdd: (responsible: Omit<Responsible, 'id' | 'createdAt'>) => void;
}

const ResponsibleForm: React.FC<ResponsibleFormProps> = ({ onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onAdd(formData);
      setFormData({ name: '', phone: '' });
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
        Cadastrar Responsável
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
            <User className="h-4 w-4 inline mr-1" />
            Nome *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-white placeholder-gray-400"
            placeholder="Nome do responsável"
          />
        </div>
        
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
            <Phone className="h-4 w-4 inline mr-1" />
            Telefone
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-white placeholder-gray-400"
            placeholder="(11) 99999-9999"
          />
        </div>
      </div>
      
      <button
        type="submit"
        className="mt-4 w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        Cadastrar Responsável
      </button>
    </form>
  );
};

export default ResponsibleForm;