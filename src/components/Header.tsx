import React from 'react';
import { Fuel, Users, Car, BarChart3, FileText } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'fuel', label: 'Abastecimento', icon: Fuel },
    { id: 'fuel-list', label: 'Consultar', icon: FileText },
    { id: 'vehicles', label: 'Veículos', icon: Car },
    { id: 'responsibles', label: 'Responsáveis', icon: Users },
    { id: 'reports', label: 'Relatórios', icon: BarChart3 },
  ];

  return (
    <header className="bg-gray-800 shadow-lg border-b border-gray-700">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Primeira linha - Logo e título */}
        <div className="flex items-center justify-center py-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-lg shadow-lg">
              <Fuel className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                Gestão de Abastecimento
              </h1>
              <p className="text-xs text-gray-400">Sistema PWA</p>
            </div>
          </div>
        </div>
        
        {/* Segunda linha - Navegação */}
        <div className="py-3">
          <nav className="flex justify-start md:justify-center space-x-2 overflow-x-auto scrollbar-hide pb-2">
            <div className="flex space-x-2 min-w-max px-4 md:px-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;