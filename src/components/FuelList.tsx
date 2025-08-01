import React, { useState } from 'react';
import { Search, Eye, Edit, Trash2, Fuel, Calendar, User, Car, Filter, CheckCircle, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import type { FuelRecord, Responsible, Vehicle } from '../types';

interface FuelListProps {
  fuelRecords: FuelRecord[];
  responsibles: Responsible[];
  vehicles: Vehicle[];
  onEdit: (record: FuelRecord) => void;
  onDelete: (id: string) => void;
  onView: (record: FuelRecord) => void;
  onUpdateStatus: (id: string, status: 'PENDENTE' | 'CONCLUIDO') => void;
  highlightedRecordId?: string;
}

const FuelList: React.FC<FuelListProps> = ({ 
  fuelRecords, 
  responsibles, 
  vehicles, 
  onEdit, 
  onDelete, 
  onView,
  onUpdateStatus,
  highlightedRecordId 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'DIESEL' | 'ARLA'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'vehicle' | 'responsible'>('date');
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 30;

  const filteredRecords = fuelRecords
    .filter(record => {
      const responsible = responsibles.find(r => r.id === record.responsibleId);
      const vehicle = vehicles.find(v => v.id === record.vehicleId);
      
      const matchesSearch = 
        responsible?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle?.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle?.model.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = 
        filterType === 'all' || 
        record.fuelTypes.includes(filterType as 'DIESEL' | 'ARLA');
      
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'vehicle':
          const vehicleA = vehicles.find(v => v.id === a.vehicleId);
          const vehicleB = vehicles.find(v => v.id === b.vehicleId);
          return (vehicleA?.plate || '').localeCompare(vehicleB?.plate || '');
        case 'responsible':
          const respA = responsibles.find(r => r.id === a.responsibleId);
          const respB = responsibles.find(r => r.id === b.responsibleId);
          return (respA?.name || '').localeCompare(respB?.name || '');
        default:
          return 0;
      }
    });

  // Calcular paginação
  const totalRecords = filteredRecords.length;
  const totalPages = Math.ceil(totalRecords / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const paginatedRecords = filteredRecords.slice(startIndex, endIndex);

  // Resetar página quando filtros mudarem
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType, sortBy]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (fuelRecords.length === 0) {
    return (
      <div className="bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-700 text-center">
        <Fuel className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">
          Nenhum abastecimento registrado
        </h3>
        <p className="text-gray-400">
          Registre o primeiro abastecimento para começar.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros e Busca */}
      <div className="bg-gray-800 p-4 sm:p-6 rounded-xl shadow-sm border border-gray-700">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Search className="h-4 w-4 inline mr-1" />
              Buscar
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por responsável, placa ou modelo..."
              className="w-full px-3 sm:px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-white placeholder-gray-400 text-sm sm:text-base"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Filter className="h-4 w-4 inline mr-1" />
              Tipo de Combustível
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'DIESEL' | 'ARLA')}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-white"
            >
              <option value="all">Todos</option>
              <option value="DIESEL">DIESEL</option>
              <option value="ARLA">ARLA</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Ordenar por
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'vehicle' | 'responsible')}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-white"
            >
              <option value="date">Data</option>
              <option value="vehicle">Veículo</option>
              <option value="responsible">Responsável</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Abastecimentos */}
      <div className="bg-gray-800 rounded-xl shadow-sm border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">
              Abastecimentos ({totalRecords})
            </h3>
          </div>
          
          {/* Controles de Paginação Superior */}
          {totalPages > 1 && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  Mostrando {startIndex + 1} a {Math.min(endIndex, totalRecords)} de {totalRecords} abastecimentos
                </div>
                
                <div className="flex items-center space-x-2">
                  {/* Botão Anterior */}
                  <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === 1
                        ? 'text-gray-500 cursor-not-allowed'
                        : 'text-gray-300 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Anterior
                  </button>

                  {/* Números das páginas */}
                  <div className="flex items-center space-x-1">
                    {(() => {
                      const pages = [];
                      const maxVisiblePages = 5;
                      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                      
                      // Ajustar startPage se endPage for menor que maxVisiblePages
                      if (endPage - startPage + 1 < maxVisiblePages) {
                        startPage = Math.max(1, endPage - maxVisiblePages + 1);
                      }

                      // Primeira página
                      if (startPage > 1) {
                        pages.push(
                          <button
                            key={1}
                            onClick={() => goToPage(1)}
                            className="px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                          >
                            1
                          </button>
                        );
                        if (startPage > 2) {
                          pages.push(
                            <span key="ellipsis1" className="px-2 text-gray-500">...</span>
                          );
                        }
                      }

                      // Páginas visíveis
                      for (let i = startPage; i <= endPage; i++) {
                        pages.push(
                          <button
                            key={i}
                            onClick={() => goToPage(i)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              i === currentPage
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-300 hover:text-white hover:bg-gray-700'
                            }`}
                          >
                            {i}
                          </button>
                        );
                      }

                      // Última página
                      if (endPage < totalPages) {
                        if (endPage < totalPages - 1) {
                          pages.push(
                            <span key="ellipsis2" className="px-2 text-gray-500">...</span>
                          );
                        }
                        pages.push(
                          <button
                            key={totalPages}
                            onClick={() => goToPage(totalPages)}
                            className="px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                          >
                            {totalPages}
                          </button>
                        );
                      }

                      return pages;
                    })()}
                  </div>

                  {/* Botão Próximo */}
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === totalPages
                        ? 'text-gray-500 cursor-not-allowed'
                        : 'text-gray-300 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    Próximo
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {totalRecords === 0 ? (
          <div className="p-8 text-center">
            <Fuel className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-white mb-2">
              Nenhum abastecimento encontrado
            </h4>
            <p className="text-gray-400">
              Ajuste os filtros ou registre novos abastecimentos.
            </p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-700">
              {paginatedRecords.map((record) => {
                const responsible = responsibles.find(r => r.id === record.responsibleId);
                const vehicle = vehicles.find(v => v.id === record.vehicleId);
                const isHighlighted = record.id === highlightedRecordId;
                
                return (
                  <div 
                    key={record.id} 
                    className={`p-6 transition-colors ${
                      isHighlighted 
                        ? 'bg-blue-900/30 border-l-4 border-blue-500' 
                        : 'hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="bg-blue-600 p-2 rounded-lg">
                            <Fuel className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium text-white">
                              {vehicle?.plate} - {vehicle?.model}
                            </h4>
                            <div className="flex items-center space-x-4 mt-1">
                              <div className="flex items-center text-sm text-gray-300">
                                <User className="h-4 w-4 mr-1" />
                                {responsible?.name}
                              </div>
                              <div className="flex items-center text-sm text-gray-300">
                                <Calendar className="h-4 w-4 mr-1" />
                                {new Date(record.date).toLocaleDateString('pt-BR')} às {new Date(record.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                            {record.averagePanel && (
                              <p className="text-sm text-blue-400 font-medium">
                                Painel: {record.averagePanel} km/l
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 mb-3">
                          {record.fuelTypes.map(type => (
                            <span
                              key={type}
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                type === 'DIESEL' 
                                  ? 'bg-orange-600 text-white' 
                                  : 'bg-green-600 text-white'
                              }`}
                            >
                              {type}
                            </span>
                          ))}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          {(record.dieselDailyStart || record.dieselDailyEnd) && (
                            <div>
                              <span className="text-gray-400">DIESEL:</span>
                              <span className="text-orange-400 font-medium ml-1">
                                {record.dieselDailyStart && `${record.dieselDailyStart}L início`}
                                {record.dieselDailyStart && record.dieselDailyEnd && ' / '}
                                {record.dieselDailyEnd && `${record.dieselDailyEnd}L final`}
                              </span>
                            </div>
                          )}
                          {record.dieselTotalRefueled && (
                            <div>
                              <span className="text-gray-400">Abastecido:</span>
                              <span className="text-orange-400 font-medium ml-1">{record.dieselTotalRefueled}L</span>
                            </div>
                          )}
                          {(record.arlaDailyStart || record.arlaDailyEnd) && (
                            <div>
                              <span className="text-gray-400">ARLA:</span>
                              <span className="text-green-400 font-medium ml-1">
                                {record.arlaDailyStart && `${record.arlaDailyStart}L início`}
                                {record.arlaDailyStart && record.arlaDailyEnd && ' / '}
                                {record.arlaDailyEnd && `${record.arlaDailyEnd}L final`}
                              </span>
                            </div>
                          )}
                          {record.arlaTotalRefueled && (
                            <div>
                              <span className="text-gray-400">Abastecido:</span>
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
                        
                        {record.observations && (
                          <p className="text-sm text-gray-300 mt-3 italic">
                            "{record.observations}"
                          </p>
                        )}
                        
                        {/* Status Badge */}
                        <div className="mt-3">
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
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        {/* Botão de Status */}
                        {record.status === 'PENDENTE' && (
                          <button
                            onClick={() => onUpdateStatus(record.id, 'CONCLUIDO')}
                            className="p-2 text-green-400 hover:bg-green-600/20 rounded-lg transition-colors"
                            title="Marcar como concluído"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        {record.status === 'CONCLUIDO' && (
                          <button
                            onClick={() => onUpdateStatus(record.id, 'PENDENTE')}
                            className="p-2 text-yellow-400 hover:bg-yellow-600/20 rounded-lg transition-colors"
                            title="Marcar como pendente"
                          >
                            <Clock className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => onView(record)}
                          className="p-2 text-blue-400 hover:bg-blue-600/20 rounded-lg transition-colors"
                          title="Visualizar detalhes"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onEdit(record)}
                          className="p-2 text-yellow-400 hover:bg-yellow-600/20 rounded-lg transition-colors"
                          title="Editar abastecimento"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDelete(record.id)}
                          className="p-2 text-red-400 hover:bg-red-600/20 rounded-lg transition-colors"
                          title="Excluir abastecimento"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Controles de Paginação */}
            {totalPages > 1 && (
              <div className="p-6 border-t border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    Mostrando {startIndex + 1} a {Math.min(endIndex, totalRecords)} de {totalRecords} abastecimentos
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {/* Botão Anterior */}
                    <button
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === 1
                          ? 'text-gray-500 cursor-not-allowed'
                          : 'text-gray-300 hover:text-white hover:bg-gray-700'
                      }`}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Anterior
                    </button>

                    {/* Números das páginas */}
                    <div className="flex items-center space-x-1">
                      {(() => {
                        const pages = [];
                        const maxVisiblePages = 5;
                        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                        
                        // Ajustar startPage se endPage for menor que maxVisiblePages
                        if (endPage - startPage + 1 < maxVisiblePages) {
                          startPage = Math.max(1, endPage - maxVisiblePages + 1);
                        }

                        // Primeira página
                        if (startPage > 1) {
                          pages.push(
                            <button
                              key={1}
                              onClick={() => goToPage(1)}
                              className="px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                            >
                              1
                            </button>
                          );
                          if (startPage > 2) {
                            pages.push(
                              <span key="ellipsis1" className="px-2 text-gray-500">...</span>
                            );
                          }
                        }

                        // Páginas visíveis
                        for (let i = startPage; i <= endPage; i++) {
                          pages.push(
                            <button
                              key={i}
                              onClick={() => goToPage(i)}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                i === currentPage
                                  ? 'bg-blue-600 text-white'
                                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
                              }`}
                            >
                              {i}
                            </button>
                          );
                        }

                        // Última página
                        if (endPage < totalPages) {
                          if (endPage < totalPages - 1) {
                            pages.push(
                              <span key="ellipsis2" className="px-2 text-gray-500">...</span>
                            );
                          }
                          pages.push(
                            <button
                              key={totalPages}
                              onClick={() => goToPage(totalPages)}
                              className="px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                            >
                              {totalPages}
                            </button>
                          );
                        }

                        return pages;
                      })()}
                    </div>

                    {/* Botão Próximo */}
                    <button
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === totalPages
                          ? 'text-gray-500 cursor-not-allowed'
                          : 'text-gray-300 hover:text-white hover:bg-gray-700'
                      }`}
                    >
                      Próximo
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FuelList;
