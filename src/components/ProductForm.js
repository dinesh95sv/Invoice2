import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { database } from '../database';

const ProductForm = ({ product, onSave, onCancel, factories }) => {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [factorySearch, setFactorySearch] = useState('');
  const [showFactoryDropdown, setShowFactoryDropdown] = useState(false);
  const [factory, setFactory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const getFactoryInfo = (factoryId) => {
    const factory = factories.find(factory => factory.id === factoryId);
    setFactory(factory);
  }

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setSku(product.sku || '');
      setDescription(product.description || '');
      setPrice(product.price ? product.price.toString() : '');
      getFactoryInfo(product.factoryId);
    }
    
  }, [product]);

  useEffect(() => {

  }, [factorySearch])

  const filteredFactories = factories.filter(factory => 
    factory.name.toLowerCase().includes(factorySearch.toLowerCase())
  );
  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Product name is required');
      return false;
    }
    
    if (!price.trim() || isNaN(parseFloat(price)) || parseFloat(price) < 0) {
      Alert.alert('Validation Error', 'Please enter a valid price');
      return false;
    }
    
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    const data = {
      name: name,
      sku: sku,
      description: description,
      price: price,
      factoryId: factory.id,
    }
    onSave & onSave(data)
  };

  const selectFactory = (factory) => {
    setFactory(factory);
    setShowFactoryDropdown(false);
    setFactorySearch('');
  };

  const renderFactoryItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.dropdownItem} 
      onPress={() => selectFactory(item)}
    >
      <Text style={styles.dropdownItemText}>{item.name}</Text>
      {item.gstin && <Text style={styles.dropdownItemSubtext}>{item.gstin}</Text>}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{product ? 'Edit Product' : 'Add New Product'}</Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Name *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Product name"
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>SKU</Text>
        <TextInput
          style={styles.input}
          value={sku}
          onChangeText={setSku}
          placeholder="Stock Keeping Unit"
        />
      </View>

      <View style={styles.formGroup}>
        <View style={styles.dropdownContainer}>
          <Input
            label="Factory"
            value={factory ? factory.name : ''}
            onChangeText={setFactorySearch}
            placeholder="Search Factory"
            onFocus={() => setShowFactoryDropdown(true)}
            editable={!selectedCustomer}
          />
          
          {showFactoryDropdown && (
            <Card style={styles.dropdown}>
              <FlatList
                data={filteredFactories}
                renderItem={renderFactoryItem}
                keyExtractor={item => item.id}
                ListEmptyComponent={
                  <Text style={styles.emptyListText}>No Factory found</Text>
                }
              />
            </Card>
          )}
        </View>
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Product description"
          multiline
          numberOfLines={4}
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Price *</Text>
        <TextInput
          style={styles.input}
          value={price}
          onChangeText={setPrice}
          placeholder="0.00"
          keyboardType="decimal-pad"
        />
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.cancelButton]} 
          onPress={onCancel}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.saveButton, isLoading && styles.disabledButton]} 
          onPress={handleSave}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>{isLoading ? 'Saving...' : 'Save'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 30,
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
  emptyListText: {
    padding: spacing.medium,
    textAlign: 'center',
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  saveButton: {
    backgroundColor: '#007bff',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

const enhancedComponent = withObservables([], () => ({
  factories: database.collections.get('factories').query().observe(),
}));

export default withDatabase(enhancedComponent(ProductForm));