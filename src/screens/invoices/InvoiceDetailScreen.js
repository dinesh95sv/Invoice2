// src/screens/invoices/InvoiceDetailScreen.js
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Share, ActivityIndicator } from 'react-native';
import { database } from '../../database';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Text from '../../components/common/Text';
import List from '../../components/common/List';
import { colors } from '../../styles/colors';
import { formatDate, formatCurrency } from '../../utils/formatUtils';
import { generateAndShareInvoicePDF } from '../../services/pdfService';

const InvoiceDetailScreen = ({ route, navigation }) => {
  const { invoiceId } = route.params;
  const [invoice, setInvoice] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [factory, setFactory] = useState(null);
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  useEffect(() => {
    loadInvoiceDetails();
  }, [invoiceId]);

  const loadInvoiceDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch invoice details
      const invoiceCollection = database.get('invoices');
      const invoiceRecord = await invoiceCollection.find(invoiceId);
      setInvoice(invoiceRecord);
      
      // Fetch customer information
      const customerRecord = await invoiceRecord.customer.fetch();
      setCustomer(customerRecord);
      // Fetch factory information
      const factoryRecord = await invoiceRecord.factory.fetch();
      setFactory(factoryRecord);
      
      // Fetch invoice items
      const items = await invoiceRecord.items.fetch();
      
      // Fetch product information for each item
      const enhancedItems = await Promise.all(
        items.map(async (item) => {
          const product = await item.product.fetch();
          return {
            ...item,
            productName: product.name,
          };
        })
      );
      
      setInvoiceItems(enhancedItems);
    } catch (error) {
      console.error('Failed to load invoice details:', error);
      Alert.alert('Error', 'Could not load invoice details');
    } finally {
      setLoading(false);
    }
  };

  const handleEditInvoice = () => {
    navigation.navigate('CreateInvoice', { invoice });
  };

  const handleDeleteInvoice = async () => {
    Alert.alert(
      'Delete Invoice',
      'Are you sure you want to delete this invoice? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await database.write(async () => {
                await invoice.markAsDeleted();
              });
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting invoice:', error);
              Alert.alert('Error', 'Could not delete invoice');
            }
          },
        },
      ]
    );
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      await database.write(async () => {
        await invoice.update((inv) => {
          inv.status = newStatus;
        });
      });
      
      // Refresh invoice data
      loadInvoiceDetails();
      
      Alert.alert('Success', 'Invoice status updated');
    } catch (error) {
      console.error('Error updating invoice status:', error);
      Alert.alert('Error', 'Could not update invoice status');
    }
  };

  const handleShareInvoice = async () => {
    try {
      setGeneratingPdf(true);
      
      await generateAndShareInvoicePDF({
        invoice,
        factory,
        customer,
        items: invoiceItems,
      });
    } catch (error) {
      console.error('Error sharing invoice:', error);
      Alert.alert('Error', 'Could not share invoice');
    } finally {
      setGeneratingPdf(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PAID':
        return colors.success;
      case 'PENDING':
        return colors.warning;
      case 'OVERDUE':
        return colors.danger;
      default:
        return colors.textSecondary;
    }
  };

  if (loading || !invoice || !customer || !factory) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.invoiceHeader}>
        <View style={styles.headerRow}>
          <Text style={styles.invoiceNumber}>Invoice #{invoice.invoiceNumber}</Text>
          <Text 
            style={[
              styles.status, 
              { color: getStatusColor(invoice.status) }
            ]}
          >
            {invoice.status}
          </Text>
        </View>
        
        <Text style={styles.date}>Date: {formatDate(invoice.date)}</Text>
        {invoice.dueDate && (
          <Text style={styles.date}>Due Date: {formatDate(invoice.dueDate)}</Text>
        )}
      </Card>

      <Card style={styles.detailsCard}>
        <Text style={styles.sectionTitle}>Factory</Text>
        <Text style={styles.customerName}>{factory.name}</Text>
        <Text style={styles.customerDetail}>{factory.gstin}</Text>
        <Text style={styles.customerDetail}>{factory.phone}</Text>
        {factory.email && (
        <Text style={styles.customerDetail}>{factory.email}</Text>
        )}
        {factory.address && (
          <Text style={styles.customerDetail}>{factory.address}</Text>
        )}
      </Card>

      <Card style={styles.detailsCard}>
        <Text style={styles.sectionTitle}>Customer</Text>
        <Text style={styles.customerName}>{customer.name}</Text>
        <Text style={styles.customerDetail}>{customer.gstin}</Text>
        <Text style={styles.customerDetail}>{customer.phone}</Text>
        {customer.email && (
        <Text style={styles.customerDetail}>{customer.email}</Text>
        )}
        {customer.address && (
          <Text style={styles.customerDetail}>{customer.address}</Text>
        )}
      </Card>

      <Card style={styles.itemsCard}>
        <Text style={styles.sectionTitle}>Items</Text>
        {invoiceItems.map((item) => (
          <View key={item.id} style={styles.item}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemName}>{item.productName}</Text>
              <Text style={styles.itemTotal}>
                {formatCurrency(item.quantity * item.unitPrice)}
              </Text>
            </View>
            <Text style={styles.itemDetail}>
              {item.quantity} x {formatCurrency(item.unitPrice)}
            </Text>
          </View>
        ))}
        
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>{formatCurrency(invoice.totalAmount)}</Text>
        </View>
      </Card>

      {invoice.notes && (
        <Card style={styles.notesCard}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Text style={styles.notesText}>{invoice.notes}</Text>
        </Card>
      )}

      <View style={styles.buttonsSection}>
        <Button
          title="Share Invoice"
          onPress={handleShareInvoice}
          loading={generatingPdf}
          style={styles.actionButton}
        />
        
        {invoice.status !== 'PAID' && (
          <Button
            title="Mark as Paid"
            onPress={() => handleUpdateStatus('PAID')}
            style={[styles.actionButton, styles.paidButton]}
          />
        )}
        
        <Button
          title="Edit Invoice"
          onPress={handleEditInvoice}
          style={styles.actionButton}
        />
        
        <Button
          title="Delete Invoice"
          onPress={handleDeleteInvoice}
          style={[styles.actionButton, styles.deleteButton]}
          type="danger"
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  invoiceHeader: {
    padding: 16,
    margin: 16,
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  invoiceNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  status: {
    fontSize: 16,
    fontWeight: '600',
  },
  date: {
    fontSize: 16,
    marginBottom: 4,
  },
  detailsCard: {
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: colors.primary,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  customerDetail: {
    fontSize: 14,
    marginBottom: 4,
    color: colors.textSecondary,
  },
  itemsCard: {
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  item: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 16,
    flex: 1,
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemDetail: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  notesCard: {
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  notesText: {
    fontSize: 14,
  },
  buttonsSection: {
    padding: 16,
    marginBottom: 16,
  },
  actionButton: {
    marginBottom: 12,
  },
  paidButton: {
    backgroundColor: colors.success,
  },
  deleteButton: {
    backgroundColor: colors.danger,
  },
});

export default InvoiceDetailScreen;
