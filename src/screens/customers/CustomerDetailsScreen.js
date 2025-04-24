import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { withDatabase } from '@nozbe/watermelondb/DatabaseProvider';
import withObservables from '@nozbe/with-observables';
import { Q } from '@nozbe/watermelondb';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import List from '../../components/common/List';
import CustomerForm from '../../components/CustomerForm';
import { database } from '../../database';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';
import { fonts } from '../../styles/fonts';
import { validateEmail, validatePhone } from '../../utils/validators';

const CustomerDetailScreen = ({ navigation, route, customer, invoices }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formValues, setFormValues] = useState({
    name: '',
    phone: '',
    gstin: '',
    email: '',
    address: '',
  });

  useEffect(() => {
    if (customer) {
      setFormValues({
        name: customer.name,
        gstin: customer.gstin,
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
      });
    }
  }, [customer]);

  useEffect(() => {
    navigation.setOptions({
      title: customer ? customer.name : 'Customer Details',
      headerRight: () => (
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={() => setIsEditing(!isEditing)}
        >
          <Text style={styles.headerButtonText}>{isEditing ? 'Cancel' : 'Edit'}</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, customer, isEditing]);


  // const validateForm = () => {
  //   if (!formValues.name.trim()) {
  //     Alert.alert('Validation Error', 'Customer name is required');
  //     return false;
  //   }

  //   if (formValues.email && !validateEmail(formValues.email)) {
  //     Alert.alert('Validation Error', 'Please enter a valid email address');
  //     return false;
  //   }

  //   if (formValues.phone && !validatePhone(formValues.phone)) {
  //     Alert.alert('Validation Error', 'Please enter a valid phone number');
  //     return false;
  //   }

  //   return true;
  // };

  const handleSave = async (customerData) => {
    setIsSaving(true);
    try {
      await database.write(async () => {
        await customer.update(cust => {
          cust.name = customerData.name;
          cust.phone = customerData.phone;
          cust.gstin = customerData.gstin;
          cust.email = customerData.email;
          cust.address = customerData.address;
        });
      });
      
      setIsEditing(false);
      Alert.alert('Success', 'Customer updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update customer');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCustomer = async () => {
    if (invoices.length > 0) {
      Alert.alert(
        'Cannot Delete Customer',
        'This customer has associated invoices. Please delete the invoices first.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this customer? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await database.write(async () => {
                await customer.markAsDeleted();
              });
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete customer');
              console.error(error);
            }
          }
        }
      ]
    );
  };

  const handleInvoicePress = (invoice) => {
    navigation.navigate('InvoiceDetail', { invoiceId: invoice.id });
  };

  const renderInvoiceItem = ({ item }) => ({
    title: `Invoice #${item.invoiceNumber}`,
    subtitle: new Date(item.date).toLocaleDateString(),
    rightText: item.totalAmount ? `$${item.totalAmount.toFixed(2)}` : '',
    onPress: () => handleInvoicePress(item),
  });

  const handleCreateInvoice = () => {
    navigation.navigate('CreateInvoice', { customerId: customer.id });
  };

  if (!customer) {
    return (
      <View style={styles.centered}>
        <Text>Loading customer details...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {isEditing ? (
        <View style={styles.formContainer}>
          <CustomerForm 
            customer={customer}
            mode="edit"
            onSave={(customerData) => handleSave(customerData)}
            onCancel={() => setIsSaving(false)}
            isSubmitting={isSaving}
          />
        </View>
      ) : (
        <>
          <Card style={styles.detailsCard}>
            <Text style={styles.cardTitle}>Customer Information</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Name:</Text>
              <Text style={styles.detailValue}>{customer.name}</Text>
            </View>
            {customer.email && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Email:</Text>
                <Text style={styles.detailValue}>{customer.email}</Text>
              </View>
            )}
            {customer.phone && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Phone:</Text>
                <Text style={styles.detailValue}>{customer.phone}</Text>
              </View>
            )}
            {customer.address && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Address:</Text>
                <Text style={styles.detailValue}>{customer.address}</Text>
              </View>
            )}
            {customer.city && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>City:</Text>
                <Text style={styles.detailValue}>{customer.city}</Text>
              </View>
            )}
            {customer.zipCode && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Zip Code:</Text>
                <Text style={styles.detailValue}>{customer.zipCode}</Text>
              </View>
            )}
            {customer.country && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Country:</Text>
                <Text style={styles.detailValue}>{customer.country}</Text>
              </View>
            )}
            {customer.notes && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Notes:</Text>
                <Text style={styles.detailValue}>{customer.notes}</Text>
              </View>
            )}
          </Card>

          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Invoices</Text>
              <Button 
                title="Create Invoice" 
                onPress={handleCreateInvoice}
                small
              />
            </View>
            
            <List
              data={invoices}
              renderItem={renderInvoiceItem}
              emptyText="No invoices found for this customer"
              maxHeight={300}
            />
          </View>

          <View style={styles.deleteButtonContainer}>
            <Button 
              title="Delete Customer" 
              onPress={handleDeleteCustomer}
              type="secondary"
            />
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButton: {
    paddingHorizontal: spacing.medium,
  },
  headerButtonText: {
    color: colors.primary,
    fontSize: fonts.size.medium,
  },
  formContainer: {
    padding: spacing.medium,
  },
  buttonContainer: {
    marginTop: spacing.medium,
  },
  detailsCard: {
    margin: spacing.medium,
    padding: spacing.medium,
  },
  cardTitle: {
    fontSize: fonts.size.large,
    fontWeight: fonts.weight.bold,
    marginBottom: spacing.medium,
    color: colors.text,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: spacing.small,
  },
  detailLabel: {
    flex: 1,
    fontSize: fonts.size.medium,
    fontWeight: fonts.weight.medium,
    color: colors.textSecondary,
  },
  detailValue: {
    flex: 2,
    fontSize: fonts.size.medium,
    color: colors.text,
  },
  sectionContainer: {
    margin: spacing.medium,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.small,
  },
  sectionTitle: {
    fontSize: fonts.size.large,
    fontWeight: fonts.weight.bold,
    color: colors.text,
  },
  deleteButtonContainer: {
    margin: spacing.medium,
    marginTop: spacing.large,
  },
});

// Enhance the component with WatermelonDB observations
const enhancedComponent = withObservables(['route'], ({ route, database }) => {
  const customerId = route.params?.customerId;
  
  return {
    customer: database.collections
      .get('customers')
      .findAndObserve(customerId),
    invoices: database.collections
      .get('invoices')
      .query(Q.where('customer_id', customerId))
      .observe(),
  };
});

export default withDatabase(enhancedComponent(CustomerDetailScreen));