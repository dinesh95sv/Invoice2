import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, FlatList, Alert } from 'react-native';
import { withDatabase } from '@nozbe/watermelondb/DatabaseProvider';
import withObservables from '@nozbe/with-observables';
import Input from './common/Input';
import Button from './common/Button';
import Card from './common/Card';
import { database } from '../database';
import { colors } from '../styles/colors';
import { fonts } from '../styles/fonts';
import { spacing } from '../styles/spacing';
import { formatDate } from '../utils/dateUtils';
import { formatCurrency } from '../utils/formatUtils';

const InvoiceForm = ({ 
  formData, 
  onValueChange, 
  onAddItem, 
  onRemoveItem, 
  onUpdateItem, 
  customers, 
  factories,
  products,
  selectedCustomer
}) => {
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showFactoryDropdown, setShowFactoryDropdown] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState('1');
  const [customerSearch, setCustomerSearch] = useState('');
  const [factorySearch, setFactorySearch] = useState('');
  const [productSearch, setProductSearch] = useState('');

  useEffect(() => {
    if (selectedCustomer) {
      onValueChange('customerId', selectedCustomer.id);
    }
  }, [selectedCustomer]);

  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const filteredFactories = factories.filter(factory => 
    factory.name.toLowerCase().includes(factorySearch.toLowerCase())
  );

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const handleSelectCustomer = (customer) => {
    onValueChange('customerId', customer.id);
    setShowCustomerDropdown(false);
    setCustomerSearch('');
  };

  const handleSelectFactory = (factory) => {
    onValueChange('factoryId', factory.id);
    setShowFactoryDropdown(false);
    setFactorySearch('');
  }

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setShowProductDropdown(false);
    setProductSearch('');
  };

  const handleAddItem = () => {
    if (!selectedProduct) {
      Alert.alert('Error', 'Please select a product first');
      return;
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    const newItem = {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      quantity: qty,
      unitPrice: selectedProduct.price,
      total: selectedProduct.price * qty
    };

    onAddItem(newItem);
    setSelectedProduct(null);
    setQuantity('1');
  };

  const renderCustomerItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.dropdownItem} 
      onPress={() => handleSelectCustomer(item)}
    >
      <Text style={styles.dropdownItemText}>{item.name}</Text>
      {item.gstin && <Text style={styles.dropdownItemSubtext}>{item.gstin}</Text>}
    </TouchableOpacity>
  );

  const renderFactoryItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.dropdownItem} 
      onPress={() => handleSelectFactory(item)}
    >
      <Text style={styles.dropdownItemText}>{item.name}</Text>
      {item.gstin && <Text style={styles.dropdownItemSubtext}>{item.gstin}</Text>}
    </TouchableOpacity>
  );

  const renderProductItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.dropdownItem} 
      onPress={() => handleSelectProduct(item)}
    >
      <Text style={styles.dropdownItemText}>{item.name}</Text>
      <Text style={styles.dropdownItemSubtext}>
        {formatCurrency(item.price)}
      </Text>
    </TouchableOpacity>
  );

  const renderInvoiceItem = ({ item, index }) => (
    <View style={styles.invoiceItem}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.productName}</Text>
        <Text style={styles.itemDetails}>
          {item.quantity} x {formatCurrency(item.unitPrice)} = {formatCurrency(item.total)}
        </Text>
      </View>
      <TouchableOpacity 
        style={styles.removeButton}
        onPress={() => onRemoveItem(index)}
      >
        <Text style={styles.removeButtonText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  const getCurrentFactory = () => {
    if (formData.factoryId) {
      return factories.find(f => f.id === formData.factoryId);
    }
    return null;
  };

  const getCurrentCustomer = () => {
    if (formData.customerId) {
      return customers.find(c => c.id === formData.customerId);
    }
    return null;
  };

  const customer = getCurrentCustomer();
  const factory = getCurrentFactory();

  const handlePreviewInvoice = async () => {
      try {
        setGeneratingPdf(true);
        
        await previewInvoicePDF({
          formData,
          factory,
          customer,
          items: formData.items,
        });
      } catch (error) {
        console.error('Error sharing invoice:', error);
        Alert.alert('Error', 'Could not share invoice');
      } finally {
        setGeneratingPdf(false);
      }
    };


  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Invoice Information</Text>
        
        <Input
          label="Invoice Number"
          value={formData.invoiceNumber}
          onChangeText={(text) => onValueChange('invoiceNumber', text)}
          placeholder="Enter invoice number"
        />
        
        <Input
          label="Date"
          value={formData.date}
          onChangeText={(text) => onValueChange('date', text)}
          placeholder="YYYY-MM-DD"
        />
        
        <Input
          label="Due Date"
          value={formData.dueDate}
          onChangeText={(text) => onValueChange('dueDate', text)}
          placeholder="YYYY-MM-DD"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Factory Information</Text>
        
        <View style={styles.dropdownContainer}>
          <Input
            label="Factory"
            value={factory ? factory.name : ''}
            onChangeText={setFactorySearch}
            placeholder="Search Factories"
            onFocus={() => setShowFactoryDropdown(true)}
            editable={!selectedFactory}
          />
          
          {showFactoryDropdown && (
            <Card style={styles.dropdown}>
              <FlatList
                data={filteredFactories}
                renderItem={renderFactoryItem}
                keyExtractor={item => item.id}
                ListEmptyComponent={
                  <Text style={styles.emptyListText}>No Factories found</Text>
                }
              />
            </Card>
          )}
        </View>
        
        {factory && (
          <Card style={styles.customerCard}>
            <Text style={styles.customerName}>{factory.name}</Text>
            <Text style={styles.customerDetail}>{factory.gstin}</Text>
            {factory.email && <Text style={styles.customerDetail}>{factory.email}</Text>}
            {factory.phone && <Text style={styles.customerDetail}>{factory.phone}</Text>}
            {factory.address && (
              <Text style={styles.customerDetail}>
                {factory.address}
              </Text>
            )}
          </Card>
        )}
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Customer Information</Text>
        
        <View style={styles.dropdownContainer}>
          <Input
            label="Customer"
            value={customer ? customer.name : ''}
            onChangeText={setCustomerSearch}
            placeholder="Search customers"
            onFocus={() => setShowCustomerDropdown(true)}
            editable={!selectedCustomer}
          />
          
          {showCustomerDropdown && (
            <Card style={styles.dropdown}>
              <FlatList
                data={filteredCustomers}
                renderItem={renderCustomerItem}
                keyExtractor={item => item.id}
                ListEmptyComponent={
                  <Text style={styles.emptyListText}>No customers found</Text>
                }
              />
            </Card>
          )}
        </View>
        
        {customer && (
          <Card style={styles.customerCard}>
            <Text style={styles.customerName}>{customer.name}</Text>
            <Text style={styles.customerDetail}>{customer.gstin}</Text>
            {customer.email && <Text style={styles.customerDetail}>{customer.email}</Text>}
            {customer.phone && <Text style={styles.customerDetail}>{customer.phone}</Text>}
            {customer.address && (
              <Text style={styles.customerDetail}>
                {customer.address}
              </Text>
            )}
          </Card>
        )}
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Invoice Items</Text>
        
        <View style={styles.itemForm}>
          <View style={styles.dropdownContainer}>
            <Input
              label="Product"
              value={selectedProduct ? selectedProduct.name : productSearch}
              onChangeText={setProductSearch}
              placeholder="Search products"
              onFocus={() => setShowProductDropdown(true)}
            />
            
            {showProductDropdown && (
              <Card style={styles.dropdown}>
                <FlatList
                  data={filteredProducts}
                  renderItem={renderProductItem}
                  keyExtractor={item => item.id}
                  ListEmptyComponent={
                    <Text style={styles.emptyListText}>No products found</Text>
                  }
                />
              </Card>
            )}
          </View>
          
          <View style={styles.itemFormRow}>
            <View style={styles.quantityInput}>
              <Input
                label="Quantity"
                value={quantity}
                onChangeText={setQuantity}
                placeholder="1"
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.addButtonContainer}>
              <Button
                title="Add Item"
                onPress={handleAddItem}
                disabled={!selectedProduct}
              />
            </View>
          </View>
        </View>
        
        <View style={styles.itemsList}>
          {formData.items.length > 0 ? (
            <FlatList
              data={formData.items}
              renderItem={renderInvoiceItem}
              keyExtractor={(item, index) => index.toString()}
            />
          ) : (
            <Text style={styles.emptyListText}>No items added to invoice</Text>
          )}
        </View>
        
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>Total Amount:</Text>
          <Text style={styles.totalValue}>
            {formatCurrency(formData.items.reduce((sum, item) => sum + item.total, 0))}
          </Text>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Additional Information</Text>
        
        <Input
          label="Notes"
          value={formData.notes}
          onChangeText={(text) => onValueChange('notes', text)}
          placeholder="Add any notes or payment instructions"
          multiline
          numberOfLines={4}
        />
        
        <Input
          label="Terms and Conditions"
          value={formData.terms}
          onChangeText={(text) => onValueChange('terms', text)}
          placeholder="Terms and conditions for this invoice"
          multiline
          numberOfLines={4}
        />
      </View>
      <View style={styles.buttonsSection}>
        <Button
          title="Preview Invoice"
          onPress={handlePreviewInvoice}
          loading={generatingPdf}
          style={styles.actionButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: spacing.large,
  },
  sectionTitle: {
    fontSize: fonts.size.medium,
    fontWeight: fonts.weight.bold,
    marginBottom: spacing.small,
    color: colors.text,
  },
  dropdownContainer: {
    position: 'relative',
    zIndex: 1,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    maxHeight: 200,
    zIndex: 10,
  },
  dropdownItem: {
    padding: spacing.small,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropdownItemText: {
    fontSize: fonts.size.medium,
    color: colors.text,
  },
  dropdownItemSubtext: {
    fontSize: fonts.size.small,
    color: colors.textSecondary,
    marginTop: spacing.tiny,
  },
  customerCard: {
    padding: spacing.small,
    marginTop: spacing.small,
  },
  customerName: {
    fontSize: fonts.size.medium,
    fontWeight: fonts.weight.bold,
    color: colors.text,
  },
  customerDetail: {
    fontSize: fonts.size.small,
    color: colors.textSecondary,
    marginTop: spacing.tiny,
  },
  itemForm: {
    marginBottom: spacing.medium,
  },
  itemFormRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: spacing.small,
  },
  quantityInput: {
    flex: 1,
    marginRight: spacing.small,
  },
  addButtonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  itemsList: {
    marginBottom: spacing.medium,
  },
  invoiceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.small,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: fonts.size.medium,
    fontWeight: fonts.weight.medium,
    color: colors.text,
  },
  itemDetails: {
    fontSize: fonts.size.small,
    color: colors.textSecondary,
    marginTop: spacing.tiny,
  },
  removeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: colors.white,
    fontSize: fonts.size.medium,
    fontWeight: fonts.weight.bold,
  },
  emptyListText: {
    padding: spacing.medium,
    textAlign: 'center',
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingVertical: spacing.small,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: {
    fontSize: fonts.size.medium,
    fontWeight: fonts.weight.bold,
    marginRight: spacing.small,
    color: colors.text,
  },
  totalValue: {
    fontSize: fonts.size.large,
    fontWeight: fonts.weight.bold,
    color: colors.primary,
  },
});

// Enhance the component with WatermelonDB observations
const enhancedComponent = withObservables([], () => ({
  customers: database.collections.get('customers').query().observe(),
  factories: database.collections.get('factories').query().observe(),
  products: database.collections.get('products').query().observe(),
}));

export default withDatabase(enhancedComponent(InvoiceForm));