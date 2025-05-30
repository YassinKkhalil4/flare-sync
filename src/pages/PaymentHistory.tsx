
import React from 'react';
import { usePaymentHistory } from '@/hooks/usePaymentHistory';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, CreditCard, Receipt } from 'lucide-react';
import { format } from 'date-fns';

const PaymentHistory: React.FC = () => {
  const { transactions, invoices, isLoading, error } = usePaymentHistory();

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Loading payment history...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center text-red-500">Error loading payment history</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Payment History</h1>
      
      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="invoices" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Invoices
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                View all your payment transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactions && transactions.length > 0 ? (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{transaction.description || 'Payment'}</h3>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(transaction.created_at), 'PPP')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Payment Method: {transaction.payment_method || 'N/A'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          ${transaction.amount.toFixed(2)} {transaction.currency.toUpperCase()}
                        </p>
                        <Badge 
                          variant={transaction.status === 'completed' ? 'default' : 'destructive'}
                        >
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No transactions yet</h3>
                  <p className="text-muted-foreground">
                    Your payment transactions will appear here
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Invoice History</CardTitle>
              <CardDescription>
                Download and manage your invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              {invoices && invoices.length > 0 ? (
                <div className="space-y-4">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">Invoice #{invoice.invoice_number}</h3>
                        <p className="text-sm text-muted-foreground">
                          Issued: {format(new Date(invoice.created_at), 'PPP')}
                        </p>
                        {invoice.due_date && (
                          <p className="text-sm text-muted-foreground">
                            Due: {format(new Date(invoice.due_date), 'PPP')}
                          </p>
                        )}
                      </div>
                      <div className="text-right flex items-center gap-4">
                        <div>
                          <p className="font-semibold">
                            ${invoice.amount.toFixed(2)}
                          </p>
                          <Badge 
                            variant={invoice.status === 'paid' ? 'default' : 'destructive'}
                          >
                            {invoice.status}
                          </Badge>
                        </div>
                        {invoice.pdf_url && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(invoice.pdf_url, '_blank')}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No invoices yet</h3>
                  <p className="text-muted-foreground">
                    Your invoices will appear here when available
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PaymentHistory;
