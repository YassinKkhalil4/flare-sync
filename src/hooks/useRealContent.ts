
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { StorageService } from '@/services/storageService';
import { errorHandler } from '@/utils/errorHandler';

export const useRealContent = () => {
  const { user } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const initializeContentSystem = async () => {
      if (!user) return;

      try {
        // Initialize storage using static method
        const storageResult = await StorageService.initializeStorage();
        
        if (!storageResult.success) {
          throw new Error(storageResult.error || 'Storage initialization failed');
        }

        setIsInitialized(true);
        setInitError(null);
      } catch (error) {
        console.error('Content system initialization error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setInitError(errorMessage);
        errorHandler.logError(error as Error, 'Content system initialization', user.id);
      }
    };

    initializeContentSystem();
  }, [user]);

  return {
    isInitialized,
    initError,
  };
};
