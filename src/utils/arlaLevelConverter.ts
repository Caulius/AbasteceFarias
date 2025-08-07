// Tabela de conversão de CM para Volume (Litros) - ARLA
export const arlaLevelTable: { [key: string]: number } = {
  '0.10': 100,
  '0.25': 250,
  '0.50': 500,
  '0.75': 750,
  '1.00': 1000,
  '1.25': 1250,
  '1.50': 1500,
  '1.75': 1750,
  '2.00': 2000
};

/**
 * Converte medida em centímetros para volume em litros - ARLA
 * @param cm - Medida em centímetros (formato: "1.50")
 * @returns Volume em litros ou null se não encontrado
 */
export const convertArlaLevelCmToVolume = (cm: string): number | null => {
  const normalizedCm = parseFloat(cm).toFixed(2);
  return arlaLevelTable[normalizedCm] || null;
};

/**
 * Busca o valor em CM mais próximo para um volume específico - ARLA
 * @param volume - Volume em litros
 * @returns Medida em CM ou null se não encontrado
 */
export const findClosestArlaCmForVolume = (volume: number): string | null => {
  let closestCm = null;
  let smallestDiff = Infinity;
  
  for (const [cm, vol] of Object.entries(arlaLevelTable)) {
    const diff = Math.abs(vol - volume);
    if (diff < smallestDiff) {
      smallestDiff = diff;
      closestCm = cm;
    }
  }
  
  return closestCm;
};

/**
 * Obtém todas as opções de CM disponíveis para um select - ARLA
 * @returns Array de opções ordenadas
 */
export const getArlaCmOptions = (): Array<{ value: string; label: string }> => {
  return Object.keys(arlaLevelTable)
    .sort((a, b) => parseFloat(a) - parseFloat(b))
    .map(cm => ({
      value: cm,
      label: `${cm} cm`
    }));
};
