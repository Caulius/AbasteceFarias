import React, { useState } from 'react';
import { Download, X, Smartphone, Monitor, Wifi, Zap } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

const PWAInstallPrompt: React.FC = () => {
  const { isInstallable, isInstalled, installPWA } = usePWA();
  const [isDismissed, setIsDismissed] = useState(false);

  if (!isInstallable || isInstalled || isDismissed) {
    return null;
  }

  const handleInstall = async () => {
    const success = await installPWA();
    if (!success) {
      setIsDismissed(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg border border-blue-500 p-4">
        <div className="flex items-start space-x-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <Download className="h-5 w-5 text-white" />
          </div>
          
          <div className="flex-1">
            <h4 className="font-semibold text-white mb-1">
              Instalar App
            </h4>
            <p className="text-blue-100 text-sm mb-3">
              Instale o Sistema de Abastecimento no seu dispositivo para acesso rápido e uso offline.
            </p>
            
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="flex items-center space-x-1 text-xs text-blue-200">
                <Smartphone className="h-3 w-3" />
                <span>Acesso Mobile</span>
              </div>
              <div className="flex items-center space-x-1 text-xs text-blue-200">
                <Monitor className="h-3 w-3" />
                <span>Acesso Desktop</span>
              </div>
              <div className="flex items-center space-x-1 text-xs text-blue-200">
                <Wifi className="h-3 w-3" />
                <span>Funciona Offline</span>
              </div>
              <div className="flex items-center space-x-1 text-xs text-blue-200">
                <Zap className="h-3 w-3" />
                <span>Acesso Rápido</span>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={handleInstall}
                className="flex-1 bg-white text-blue-600 px-3 py-2 rounded-lg font-medium text-sm hover:bg-blue-50 transition-colors flex items-center justify-center space-x-1"
              >
                <Download className="h-4 w-4" />
                <span>Instalar</span>
              </button>
              <button
                onClick={handleDismiss}
                className="px-3 py-2 text-blue-200 hover:text-white transition-colors rounded-lg hover:bg-white/10"
                title="Dispensar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;