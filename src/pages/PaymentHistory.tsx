
import React from 'react';
import { usePaymentHistory } from '@/hooks/usePaymentHistory';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, FileText } from 'lucide-react';
import TransactionsTab from '@/components/payment/TransactionsTab';
import InvoicesTab from '@/components/payment/InvoicesTab';

const PaymentHistory: React.FC = () => {
  const { transactions, invoices, isLoading, error } = usePaymentHistory();

  const formatCurrency = (amount: number, currency: string = 'USD') => 
    new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency 
    }).format(amount);

  const formatDate = (dateString: string) => 
    new Date(dateString).toLocaleDateString();

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error loading payment history: {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Payment History</h1>
      
      <Tabs defaultValue="transactions">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="transactions">
            <DollarSign className="mr-2 h-4 w-4" /> Transactions
          </TabsTrigger>
          <TabsTrigger value="invoices">
            <FileText className="mr-2 h-4 w-4" /> Invoices
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <TransactionsTab 
            transactions={transactions}
            isLoading={isLoading}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
          />
        </TabsContent>

        <TabsContent value="invoices">
          <InvoicesTab 
            invoices={invoices}
            isLoading={isLoading}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PaymentHistory;
