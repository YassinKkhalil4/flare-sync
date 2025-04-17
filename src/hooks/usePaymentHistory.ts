
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method?: string;
  description?: string;
  created_at: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'void' | 'uncollectible';
  due_date?: string;
  pdf_url?: string;
  items?: any[];
  created_at: string;
}

export const usePaymentHistory = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Fetch transactions for current user
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        // Fetch invoices for current user
        const { data: invoicesData, error: invoicesError } = await supabase
          .from('invoices')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (transactionsError) throw transactionsError;
        if (invoicesError) throw invoicesError;

        // Type casting the data to match our interface definitions
        setTransactions(transactionsData?.map(transaction => ({
          ...transaction,
          status: transaction.status as 'pending' | 'completed' | 'failed' | 'refunded'
        })) || []);
        
        setInvoices(invoicesData?.map(invoice => ({
          ...invoice,
          status: invoice.status as 'draft' | 'sent' | 'paid' | 'void' | 'uncollectible'
        })) || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentHistory();
  }, [user]);

  return { transactions, invoices, isLoading, error };
};
