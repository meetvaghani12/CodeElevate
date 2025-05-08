"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"

interface VerificationResponse {
  isValid: boolean;
  message: string;
  invoiceData?: {
    planName: string;
    status: string;
    startDate: string;
    endDate: string;
  };
}

export default function InvoiceVerificationPage() {
  const params = useParams();
  const [verificationData, setVerificationData] = useState<VerificationResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyInvoice = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/stripe/verify-invoice/${params.id}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        const data = await response.json();
        setVerificationData(data);
      } catch (error) {
        console.error('Error verifying invoice:', error);
        setVerificationData({
          isValid: false,
          message: 'Failed to verify invoice. Please try again later.',
        });
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      verifyInvoice();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container max-w-2xl">
        <div className="flex justify-start mb-8">
          <Link href="/">
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        <Card className="p-8">
          <div className="text-center mb-8">
            {verificationData?.isValid ? (
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            ) : (
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            )}
            <h1 className="text-3xl font-bold mb-4">
              {verificationData?.isValid ? 'Valid Invoice' : 'Invalid Invoice'}
            </h1>
            <p className="text-muted-foreground mb-6">{verificationData?.message}</p>
          </div>

          {verificationData?.isValid && verificationData.invoiceData && (
            <div className="space-y-6">
              <div className="border-t pt-6">
                <h2 className="text-xl font-semibold mb-4">Invoice Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Plan</p>
                    <p className="font-medium">{verificationData.invoiceData.planName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-medium">{verificationData.invoiceData.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Start Date</p>
                    <p className="font-medium">
                      {new Date(verificationData.invoiceData.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">End Date</p>
                    <p className="font-medium">
                      {new Date(verificationData.invoiceData.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
} 