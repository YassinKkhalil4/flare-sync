
import React from 'react';
import { Invoice } from '@/hooks/usePaymentHistory';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface InvoicesTabProps {
  invoices: Invoice[];
  isLoading: boolean;
  formatCurrency: (amount: number, currency?: string) => string;
  formatDate: (dateString: string) => string;
}

const InvoicesTab: React.FC<InvoicesTabProps> = ({ 
  invoices, 
  isLoading, 
  formatCurrency, 
  formatDate 
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoices</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Table>
            <TableHeader>
              <TableRow>
                {['Invoice #', 'Date', 'Amount', 'Status', 'Actions'].map((header) => (
                  <TableHead key={header}>{header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3].map((_, index) => (
                <TableRow key={index}>
                  {[1, 2, 3, 4, 5].map((cell) => (
                    <TableCell key={cell}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    No invoices found
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>{invoice.invoice_number}</TableCell>
                    <TableCell>{formatDate(invoice.created_at)}</TableCell>
                    <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                    <TableCell>
                      <span className={`
                        px-2 py-1 rounded text-xs capitalize
                        ${invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                          invoice.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'}
                      `}>
                        {invoice.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {invoice.pdf_url && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(invoice.pdf_url, '_blank')}
                        >
                          View PDF
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default InvoicesTab;
