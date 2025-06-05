
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PaymentService, PaymentIntent, PaymentMethod, Invoice } from '@/services/paymentService';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';

export const usePaymentService = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: paymentMethods, isLoading: isLoadingMethods } = useQuery({
    queryKey: ['paymentMethods', user?.id],
    queryFn: () => PaymentService.getPaymentMethods(),
    enabled: !!user?.id,
  });

  const { data: invoices, isLoading: isLoadingInvoices } = useQuery({
    queryKey: ['invoices', user?.id],
    queryFn: () => PaymentService.getInvoices(),
    enabled: !!user?.id,
  });

  const createPaymentIntentMutation = useMutation({
    mutationFn: (params: {
      amount: number;
      currency: string;
      description?: string;
      metadata?: Record<string, string>;
    }) => PaymentService.createPaymentIntent(params),
    onSuccess: () => {
      toast({
        title: 'Payment Intent Created',
        description: 'Payment is ready to be processed.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Payment Failed',
        description: error instanceof Error ? error.message : 'Failed to create payment',
        variant: 'destructive',
      });
    },
  });

  const confirmPaymentMutation = useMutation({
    mutationFn: (paymentIntentId: string) => PaymentService.confirmPayment(paymentIntentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({
        title: 'Payment Confirmed',
        description: 'Your payment has been processed successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Payment Failed',
        description: error instanceof Error ? error.message : 'Payment confirmation failed',
        variant: 'destructive',
      });
    },
  });

  const addPaymentMethodMutation = useMutation({
    mutationFn: (paymentMethodId: string) => PaymentService.addPaymentMethod(paymentMethodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentMethods'] });
      toast({
        title: 'Payment Method Added',
        description: 'Your payment method has been saved.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to Add Payment Method',
        description: error instanceof Error ? error.message : 'Could not save payment method',
        variant: 'destructive',
      });
    },
  });

  const createInvoiceMutation = useMutation({
    mutationFn: (params: {
      amount: number;
      currency: string;
      dueDate?: string;
      items: any[];
      description?: string;
    }) => PaymentService.createInvoice(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({
        title: 'Invoice Created',
        description: 'Invoice has been created successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Invoice Creation Failed',
        description: error instanceof Error ? error.message : 'Failed to create invoice',
        variant: 'destructive',
      });
    },
  });

  const processPayment = async (params: {
    amount: number;
    currency: string;
    description?: string;
    metadata?: Record<string, string>;
  }) => {
    setIsProcessing(true);
    try {
      const paymentIntent = await createPaymentIntentMutation.mutateAsync(params);
      return paymentIntent;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    paymentMethods,
    invoices,
    isLoadingMethods,
    isLoadingInvoices,
    isProcessing,
    processPayment,
    confirmPayment: confirmPaymentMutation.mutate,
    addPaymentMethod: addPaymentMethodMutation.mutate,
    createInvoice: createInvoiceMutation.mutate,
    isConfirmingPayment: confirmPaymentMutation.isPending,
    isAddingPaymentMethod: addPaymentMethodMutation.isPending,
    isCreatingInvoice: createInvoiceMutation.isPending,
  };
};
