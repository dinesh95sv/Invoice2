import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { database } from '../../database';
import ProductForm from '../../components/ProductForm';
import Card from '../../components/common/Card';

import colors from '../../styles/colors';
import spacing from '../../styles/spacing';

const AddProductScreen = () => {
  const navigation = useNavigation();

  // Initial empty form data
  const initialData = {
    name: '',
    description: '',
    price: '',
    stock: '',
    sku: '',
  };

  // Handle form submission
  const handleCreateProduct = async (formData) => {
    try {
      // Create new product in database
      await database.write(async () => {
        const productsCollection = database.get('products');
        await productsCollection.create((product) => {
          product.name = formData.name;
          product.description = formData.description || '';
          product.price = parseFloat(formData.price) || 0;
          product.stock = parseInt(formData.stock, 10) || 0;
          product.sku = formData.sku || '';
        });
      });

      // Show success message
      Alert.alert('Success', 'Product created successfully');
      
      // Navigate back to product list
      navigation.goBack();
    } catch (error) {
      console.error('Error creating product:', error);
      Alert.alert('Error', 'Failed to create product');
    }
  };

  // Handle cancel button
  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Card style={styles.formCard}>
        <ProductForm
          initialData={initialData}
          onSubmit={handleCreateProduct}
          onCancel={handleCancel}
        />
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: spacing.medium,
  },
  formCard: {
    marginBottom: spacing.medium,
  },
});

export default AddProductScreen;