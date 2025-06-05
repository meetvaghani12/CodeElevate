"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { ArrowLeft, Download, CheckCircle } from "lucide-react"
import Link from "next/link"
import { QRCodeSVG } from "qrcode.react"
import { PDFDownloadLink } from '@react-pdf/renderer'
import { InvoicePDF } from "./InvoicePDF"

interface InvoiceData {
  id: string
  amount: number
  status: string
  date: string
  items: Array<{
    description: string
    quantity: number
    price: number
  }>
}

function InvoiceContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      const invoiceId = searchParams.get('id');
      if (!invoiceId) {
        setIsLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          window.location.href = '/signin';
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/stripe/invoice/${invoiceId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch invoice data');
        }

        const data = await response.json();
        if (!data.id || !data.amount || !data.status || !data.date || !data.items) {
          throw new Error('Invalid invoice data received');
        }
        setInvoice(data);
      } catch (error) {
        console.error('Error fetching invoice:', error);
        setError(error instanceof Error ? error.message : 'Failed to load invoice');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoice();
  }, [searchParams]);

  const handleDownloadInvoice = () => {
    if (!invoice || !user) return;
    
    return (
      <PDFDownloadLink
        document={<InvoicePDF invoiceData={invoice} userData={user} />}
        fileName={`invoice-${invoice.id}.pdf`}
      >
        {({ loading }: PDFDownloadLinkProps) => (
          <Button disabled={loading}>
            <Download className="mr-2 h-4 w-4" />
            {loading ? 'Preparing...' : 'Download Invoice'}
          </Button>
        )}
      </PDFDownloadLink>
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin" />
          <p className="mt-4">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error Loading Invoice</CardTitle>
            <CardDescription>
              {error}
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-end space-x-4">
            <Button variant="outline" onClick={() => window.print()}>
              Print Invoice
            </Button>
            <Link href="/dashboard">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invoice Not Found</CardTitle>
            <CardDescription>
              The requested invoice could not be found.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Invoice #{invoice.id}</CardTitle>
          <CardDescription>
            Date: {new Date(invoice.date).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Items</h3>
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Description</th>
                    <th className="text-right py-2">Quantity</th>
                    <th className="text-right py-2">Price</th>
                    <th className="text-right py-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2">{item.description}</td>
                      <td className="text-right py-2">{item.quantity}</td>
                      <td className="text-right py-2">${item.price.toFixed(2)}</td>
                      <td className="text-right py-2">
                        ${(item.quantity * item.price).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between items-center pt-4">
              <span className="font-semibold">Total Amount:</span>
              <span className="font-semibold">${invoice.amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold">Status:</span>
              <span className={`capitalize ${
                invoice.status === 'paid' ? 'text-green-600' : 
                invoice.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {invoice.status}
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-4">
          <Button variant="outline" onClick={() => window.print()}>
            Print Invoice
          </Button>
          {handleDownloadInvoice()}
        </CardFooter>
      </Card>
    </div>
  );
}

export default function InvoicePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin" />
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    }>
      <InvoiceContent />
    </Suspense>
  );
} 