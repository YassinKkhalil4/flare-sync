
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiKeyService, ApiKeyData } from '@/services/apiKeyService';
import { useToast } from '@/hooks/use-toast';

export const useApiKeys = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: apiKeys = [], isLoading, error } = useQuery({
    queryKey: ['apiKeys'],
    queryFn: async () => {
      const result = await ApiKeyService.getUserApiKeys();
      if (result.error) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });

  const storeKeysMutation = useMutation({
    mutationFn: (apiKeys: Record<string, string>) => ApiKeyService.storeApiKeys(apiKeys),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
      toast({
        title: 'Success',
        description: 'API keys saved successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteKeyMutation = useMutation({
    mutationFn: (keyId: string) => ApiKeyService.deleteApiKey(keyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apiKeys'] });
      toast({
        title: 'Success',
        description: 'API key deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const testKeyMutation = useMutation({
    mutationFn: ({ keyName, keyValue }: { keyName: string; keyValue: string }) => 
      ApiKeyService.testApiKey(keyName, keyValue),
    onSuccess: (data) => {
      if (data.valid) {
        toast({
          title: 'Success',
          description: 'API key is valid',
        });
      } else {
        toast({
          title: 'Invalid Key',
          description: 'The API key is not valid',
          variant: 'destructive',
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    apiKeys,
    isLoading,
    error,
    storeKeys: storeKeysMutation.mutate,
    deleteKey: deleteKeyMutation.mutate,
    testKey: testKeyMutation.mutate,
    isStoringKeys: storeKeysMutation.isPending,
    isDeletingKey: deleteKeyMutation.isPending,
    isTestingKey: testKeyMutation.isPending,
  };
};
