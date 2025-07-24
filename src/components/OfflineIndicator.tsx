import React from 'react';
import { Wifi, WifiOff, RefreshCw, AlertCircle, CheckCircle, Clock, Database } from 'lucide-react';
import { useOfflineSync } from '../hooks/useOfflineSync';

const OfflineIndicator: React.FC = () => {
  const {
    isOnline,
    isSyncing,
    lastSyncTime,
    syncError,
    forcSync,
    hasPendingData,
    getPendingCount
  } = useOfflineSync();

  const pendingCount = getPendingCount();

  if (isOnline && !isSyncing && !hasPendingData() && !syncError) {
    return null; // Não mostrar nada quando tudo está normal
  }

  return (
    <div className="fixed top-20 right-4 z-40 max-w-sm">
      <div className={`rounded-lg shadow-lg border p-4 ${
        isOnline 
          ? 'bg-gray-800/95 border-gray-600 backdrop-blur-sm' 
          : 'bg-red-900/90 border-red-600/50'
      }`}>
        <div className="flex items-center space-x-3">
          {/* Ícone de status */}
          <div className={`p-2 rounded-full ${
            isOnline 
              ? 'bg-green-600' 
              : 'bg-red-600'
          }`}>
            {isOnline ? (
              <Wifi className="h-4 w-4 text-white" />
            ) : (
              <WifiOff className="h-4 w-4 text-white" />
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h4 className={`font-medium ${
                isOnline ? 'text-white' : 'text-red-100'
              }`}>
                {isOnline ? 'Online' : 'Modo Offline'}
              </h4>
              
              {isSyncing && (
                <RefreshCw className="h-4 w-4 text-blue-400 animate-spin" />
              )}
            </div>

            <div className="mt-1 space-y-1">
              {/* Status de sincronização */}
              {isSyncing && (
                <div className="flex items-center space-x-1">
                  <RefreshCw className="h-3 w-3 text-blue-400 animate-spin" />
                  <span className="text-xs text-blue-400">Sincronizando...</span>
                </div>
              )}

              {/* Erro de sincronização */}
              {syncError && (
                <div className="flex items-center space-x-1">
                  <AlertCircle className="h-3 w-3 text-red-400" />
                  <span className="text-xs text-red-400">{syncError}</span>
                </div>
              )}

              {/* Dados pendentes */}
              {hasPendingData() && (
                <div className="flex items-center space-x-1">
                  <Database className="h-3 w-3 text-yellow-400" />
                  <span className="text-xs text-yellow-400">
                    {pendingCount.total} item{pendingCount.total !== 1 ? 's' : ''} aguardando sincronização
                  </span>
                </div>
              )}

              {/* Última sincronização */}
              {lastSyncTime && isOnline && !isSyncing && (
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-3 w-3 text-green-400" />
                  <span className="text-xs text-green-400">
                    Última sync: {lastSyncTime.toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
              )}

              {/* Instruções offline */}
              {!isOnline && (
                <p className="text-xs text-red-200">
                  ⚡ Modo offline ativo. Continue trabalhando normalmente - os dados serão sincronizados automaticamente quando a conexão for restaurada.
                </p>
              )}
            </div>
          </div>

          {/* Botão de sincronização manual */}
          {isOnline && hasPendingData() && !isSyncing && (
            <button
              onClick={forcSync}
              className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              title="Sincronizar agora"
            >
              <RefreshCw className="h-4 w-4 text-white" />
            </button>
          )}
        </div>

        {/* Detalhes dos dados pendentes */}
        {hasPendingData() && (
          <div className="mt-3 pt-3 border-t border-gray-600">
            <div className="text-xs text-gray-300 space-y-1">
              {pendingCount.responsibles > 0 && (
                <div>• {pendingCount.responsibles} responsável{pendingCount.responsibles !== 1 ? 'is' : ''}</div>
              )}
              {pendingCount.vehicles > 0 && (
                <div>• {pendingCount.vehicles} veículo{pendingCount.vehicles !== 1 ? 's' : ''}</div>
              )}
              {pendingCount.fuelRecords > 0 && (
                <div>• {pendingCount.fuelRecords} abastecimento{pendingCount.fuelRecords !== 1 ? 's' : ''}</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfflineIndicator;