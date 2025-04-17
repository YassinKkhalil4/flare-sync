
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePaymentHistory } from '@/hooks/usePaymentHistory';
import { DollarSign, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const PaymentHistoryWidget = () => {
  const { transactions, isLoading } = usePaymentHistory();
  
  // Only show the 5 most recent transactions
  const recentTransactions = transactions.slice(0, 5);
  
  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <DollarSign className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-md">Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-primary"></div>
          </div>
        ) : recentTransactions.length === 0 ? (
          <p className="text-center text-muted-foreground py-6">No transactions yet</p>
        ) : (
          <ul className="space-y-2">
            {recentTransactions.map(transaction => (
              <li key={transaction.id} className="flex items-center justify-between rounded-lg p-3 text-sm bg-background">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-2">
                    {getStatusIcon(transaction.status)}
                  </div>
                  <div>
                    <p className="font-medium">{transaction.description || 'Payment'}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(transaction.created_at)}
                    </p>
                  </div>
                </div>
                <div className="font-medium">
                  {formatCurrency(transaction.amount, transaction.currency)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentHistoryWidget;
