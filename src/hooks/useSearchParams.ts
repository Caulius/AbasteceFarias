import { useMemo } from 'react';

export const useSearchParams = () => {
  return useMemo(() => {
    return new URLSearchParams(window.location.search);
  }, []);
};