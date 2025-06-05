
import { supabase } from '@/integrations/supabase/client';

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  client_secret?: string;
}

export interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
}

export interface Invoice {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'void' | 'uncollectible';
  due_date?: string;
  pdf_url?: string;
  items: any;
  created_at: string;
}

export class PaymentService {
  static async createPaymentIntent(params: {
    amount: number;
    currency: string;
    description?: string;
    metadata?: Record<string, string>;
  }): Promise<PaymentIntent> {
    const { data, error } = await supabase.functions.invoke('create-payment-intent', {
      body: params
    });

    if (error) throw error;
    return data;
  }

  static async confirmPayment(paymentIntentId: string): Promise<PaymentIntent> {
    const { data, error } = await supabase.functions.invoke('confirm-payment', {
      body: { paymentIntentId }
    });

    if (error) throw error;
    return data;
  }

  static async getPaymentMethods(): Promise<PaymentMethod[]> {
    const { data, error } = await supabase.functions.invoke('get-payment-methods');

    if (error) throw error;
    return data?.paymentMethods || [];
  }

  static async addPaymentMethod(paymentMethodId: string): Promise<PaymentMethod> {
    const { data, error } = await supabase.functions.invoke('add-payment-method', {
      body: { paymentMethodId }
    });

    if (error) throw error;
    return data;
  }

  static async removePaymentMethod(paymentMethodId: string): Promise<boolean> {
    const { data, error } = await supabase.functions.invoke('remove-payment-method', {
      body: { paymentMethodId }
    });

    if (error) throw error;
    return data.success;
  }

  static async createInvoice(params: {
    amount: number;
    currency: string;
    dueDate?: string;
    items: any[];
    description?: string;
  }): Promise<Invoice> {
    const { data, error } = await supabase.functions.invoke('create-invoice', {
      body: params
    });

    if (error) throw error;
    return data;
  }

  static async getInvoices(): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  static async payInvoice(invoiceId: string): Promise<PaymentIntent> {
    const { data, error } = await supabase.functions.invoke('pay-invoice', {
      body: { invoiceId }
    });

    if (error) throw error;
    return data;
  }

  static async refundPayment(paymentIntentId: string, amount?: number): Promise<boolean> {
    const { data, error } = await supabase.functions.invoke('refund-payment', {
      body: { paymentIntentId, amount }
    });

    if (error) throw error;
    return data.success;
  }
}
