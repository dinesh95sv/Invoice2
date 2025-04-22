// src/screens/invoices/InvoiceListScreen.js
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { database } from '../../database';
import { Q } from '@nozbe/watermelondb';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import SwipeableRow from '../../components/common/SwipeableRow';
import Text from '../../components/common/Text';
import { colors } from '../../styles/colors';
import { formatDate, formatCurrency } from '../../utils/formatUtils';

const InvoiceListScreen = ({ navigation }) => {
  const [invoices, setInvoices] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadInvoices = async () => {
    try {
      const invoicesCollection = database.get('invoices');
      const invoiceRecords = await invoicesCollection
        .query(Q.sortBy('date', Q.desc))
        .fetch();
      
      // Fetch customer data for each invoice
      const enhancedInvoices = await Promise.all(
        invoiceRecords.map(async (invoice) => {
          const customer = await invoice.customer.fetch();
          return {
            ...invoice,
            customerName: customer.name,
          };
        })
      );
      
      setInvoices(enhancedInvoices);
    } catch (error) {
      console.error('Failed to load invoices:', error);
      Alert.alert('Error', 'Failed to load invoices');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadInvoices();

    // Subscribe to navigation focus events
    const unsubscribe = navigation.addListener('focus', () => {
      loadInvoices();
    });

    return unsubscribe;
  }, [navigation]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadInvoices();
  };

  const handleInvoicePress = (invoice) => {
    navigation.navigate('InvoiceDetail', { invoiceId: invoice.id });
  };

  const handleCreateInvoice = () => {
    navigation.navigate('CreateInvoice');
  };

  const handleDeleteInvoice = async (invoice) => {
    try {
      await database.write(async () => {
        await invoice.markAsDeleted();
      });
      loadInvoices(); // Refresh list
    } catch (error) {
      console.error('Error deleting invoice:', error);
      Alert.alert('Error', 'Could not delete invoice');
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

  const renderInvoiceItem = ({ item }) => (
    <SwipeableRow
      onDelete={() => handleDeleteInvoice(item)}
      onEdit={() => navigation.navigate('CreateInvoice', { invoice: item })}
    >
      <TouchableOpacity onPress={() => handleInvoicePress(item)}>
        <Card style={styles.invoiceCard}>
          <View style={styles.invoiceHeader}>
            <Text style={styles.invoiceNumber}>#{item.invoiceNumber}</Text>
            <Text 
              style={[
                styles.status, 
                { color: getStatusColor(item.status) }
              ]}
            >
              {item.status}
            </Text>
          </View>
          
          <Text style={styles.customerName}>{item.customerName}</Text>
          <Text style={styles.date}>{formatDate(item.date)}</Text>
          
          <View style={styles.invoiceFooter}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalAmount}>{formatCurrency(item.totalAmount)}</Text>
          </View>
        </Card>
      </TouchableOpacity>
    </SwipeableRow>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={invoices}
        keyExtractor={(item) => item.id}
        renderItem={renderInvoiceItem}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={styles.listContent}
      />
      <Button 
        title="Create Invoice" 
        onPress={handleCreateInvoice} 
        style={styles.createButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: 16,
  },
  invoiceCard: {
    padding: 16,
    marginBottom: 8,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  invoiceNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  status: {
    fontWeight: '600',
  },
  customerName: {
    fontSize: 18,
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  invoiceFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    marginRight: 8,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  createButton: {
    margin: 16,
  },
});

export default InvoiceListScreen;