import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
  },
  section: {
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  column: {
    flex: 1,
  },
  rightAlign: {
    textAlign: 'right',
  },
  label: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    marginBottom: 8,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    marginVertical: 20,
  },
  planSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e5e5',
    marginBottom: 20,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  planSubtitle: {
    fontSize: 12,
    color: '#666666',
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 10,
  },
  featureText: {
    fontSize: 12,
    marginLeft: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 30,
  },
  qrSection: {
    alignItems: 'center',
  },
  qrLabel: {
    fontSize: 10,
    color: '#666666',
    marginTop: 8,
  },
  status: {
    color: '#22c55e',
  },
});

interface InvoicePDFProps {
  invoiceData: {
    subscriptionId: string;
    planName: string;
    amount: number;
    billingCycle: string;
    status: string;
    startDate: string;
    endDate: string;
    features: string[];
  };
  userData: {
    firstName: string;
    lastName?: string;
    email: string;
  };
}

export const InvoicePDF = ({ invoiceData, userData }: InvoicePDFProps) => {
  const verificationUrl = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/invoice/verify/${invoiceData.subscriptionId}`;
  
  // Use the QR code generation API endpoint
  const qrCodeUrl = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/api/generate-qr?text=${encodeURIComponent(verificationUrl)}`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Invoice</Text>
          <Text style={styles.subtitle}>Thank you for your subscription!</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.grid}>
            <View style={styles.column}>
              <Text style={styles.label}>Bill To</Text>
              <Text style={styles.value}>{userData.firstName} {userData.lastName}</Text>
              <Text style={styles.value}>{userData.email}</Text>
            </View>
            <View style={[styles.column, styles.rightAlign]}>
              <Text style={styles.label}>Invoice Date</Text>
              <Text style={styles.value}>{new Date(invoiceData.startDate).toLocaleDateString()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <View style={styles.grid}>
            <View style={styles.column}>
              <Text style={styles.label}>Subscription Details</Text>
              <Text style={styles.value}>Plan: {invoiceData.planName}</Text>
              <Text style={styles.value}>Billing Cycle: {invoiceData.billingCycle}</Text>
              <Text style={[styles.value, styles.status]}>Status: {invoiceData.status}</Text>
            </View>
          </View>
        </View>

        <View style={styles.planSection}>
          <View>
            <Text style={styles.planTitle}>{invoiceData.planName} Plan</Text>
            <Text style={styles.planSubtitle}>{invoiceData.billingCycle} subscription</Text>
          </View>
          <View style={styles.rightAlign}>
            <Text style={styles.amount}>₹{invoiceData.amount.toLocaleString('en-IN')}</Text>
            <Text style={styles.planSubtitle}>
              per {invoiceData.billingCycle === 'monthly' ? 'month' : 'year'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.featuresTitle}>Included Features</Text>
          <View style={styles.featuresGrid}>
            {invoiceData.features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Text style={styles.featureText}>• {feature}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <View>
            <Text style={styles.label}>Subscription Period</Text>
            <Text style={styles.value}>
              {new Date(invoiceData.startDate).toLocaleDateString()} - {new Date(invoiceData.endDate).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.qrSection}>
            <Image
              src={qrCodeUrl}
              style={{ width: 128, height: 128 }}
            />
            <Text style={styles.qrLabel}>Scan to verify</Text>
            <Text style={[styles.value, { fontSize: 8, textAlign: 'center', marginTop: 4 }]}>
              {verificationUrl}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}; 