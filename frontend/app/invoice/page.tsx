"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { ArrowLeft, Download, CheckCircle } from "lucide-react"
import Link from "next/link"
import { QRCodeSVG } from "qrcode.react"
import { PDFDownloadLink } from '@react-pdf/renderer'
import { InvoicePDF } from "./InvoicePDF"

interface InvoiceData {
  subscriptionId: string;
  planName: string;
  amount: number;
  billingCycle: string;
  status: string;
  startDate: string;
  endDate: string;
  features: string[];
}

interface PDFDownloadLinkProps {
  loading: boolean;
}

export default function InvoicePage() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvoiceData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          window.location.href = '/signin';
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/stripe/invoice`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch invoice data');
        }

        const data = await response.json();
        if (!data.subscriptionId || !data.planName) {
          throw new Error('Invalid invoice data received');
        }
        setInvoiceData(data);
      } catch (error) {
        console.error('Error fetching invoice:', error);
        setError(error instanceof Error ? error.message : 'Failed to load invoice');
      } finally {
        setLoading(false);
      }
    };

    if (searchParams.get('success')) {
      fetchInvoiceData();
    }
  }, [searchParams]);

  const handleDownloadInvoice = () => {
    if (!invoiceData || !user) return;
    
    return (
      <PDFDownloadLink
        document={<InvoicePDF invoiceData={invoiceData} userData={user} />}
        fileName={`invoice-${invoiceData.subscriptionId}.pdf`}
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Error Loading Invoice</h1>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Link href="/dashboard">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  if (!invoiceData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">No Invoice Found</h1>
        <Link href="/dashboard">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <Link href="/dashboard">
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          {handleDownloadInvoice()}
        </div>

        <Card className="p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Invoice</h1>
              <p className="text-muted-foreground">
                Thank you for your subscription!
              </p>
            </div>
            <div className="text-right">
              <p className="font-medium">Invoice Date</p>
              <p className="text-muted-foreground">
                {new Date(invoiceData.startDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h2 className="font-semibold mb-2">Bill To</h2>
              <p>{user?.firstName} {user?.lastName}</p>
              <p>{user?.email}</p>
            </div>
            <div className="text-right">
              <h2 className="font-semibold mb-2">Subscription Details</h2>
              <p>Plan: {invoiceData.planName}</p>
              <p>Billing Cycle: {invoiceData.billingCycle}</p>
              <p>Status: <span className="text-green-600">{invoiceData.status}</span></p>
            </div>
          </div>

          <div className="border-t border-b py-4 mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{invoiceData.planName} Plan</h3>
                <p className="text-muted-foreground">
                  {invoiceData.billingCycle} subscription
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">₹{invoiceData.amount}</p>
                <p className="text-muted-foreground">
                  per {invoiceData.billingCycle === 'monthly' ? 'month' : 'year'}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-semibold mb-4">Included Features</h3>
            <ul className="grid grid-cols-2 gap-4">
              {invoiceData.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-primary mr-2" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">
                Subscription Period
              </p>
              <p>
                {new Date(invoiceData.startDate).toLocaleDateString()} - {new Date(invoiceData.endDate).toLocaleDateString()}
              </p>
            </div>
            <div className="text-center">
              <QRCodeSVG
                value={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/invoice/${invoiceData.subscriptionId}`}
                size={128}
                level="H"
                includeMargin={true}
              />
              <p className="text-sm text-muted-foreground mt-2">
                Scan to verify
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 