import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { database } from '../../database';
import { Q } from '@nozbe/watermelondb';
import ProductForm from '../../components/ProductForm';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';

import colors from '../../styles/colors';
import spacing from '../../styles/spacing';
import fonts from '../../styles/fonts';
import { formatCurrency } from '../../utils/formatUtils';

const ProductDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { productId } = route.params;
  
  const [product, setProduct] = useState(null);
  const [factory, setFactory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch product data
  const fetchProduct = async () => {
    try {
      const productRecord = await database.get('products').find(productId);
      const factory = await database.get('factories').query(Q.where('id', productRecord.factoryId))
      setProduct(productRecord);
      setFactory(factory);
    } catch (error) {
      console.error('Error fetching product:', error);
      Alert.alert('Error', 'Failed to load product details');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  // Load product data on mount
  useEffect(() => {
    fetchProduct();
  }, [productId]);

  // Handle product update
  const handleUpdateProduct = async (updatedData) => {
    try {
      await database.write(async () => {
        await product.update((p) => {
          p.name = updatedData.name;
          p.description = updatedData.description;
          p.price = parseFloat(updatedData.price) || 0;
          p.factoryId = updatedData.factoryId;
          p.sku = updatedData.sku;
        });
      });
      
      setIsEditing(false);
      // Refresh product data
      fetchProduct();
      Alert.alert('Success', 'Product updated successfully');
    } catch (error) {
      console.error('Error updating product:', error);
      Alert.alert('Error', 'Failed to update product');
    }
  };

  // Handle product deletion
  const handleDeleteProduct = async () => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete ${product.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await database.write(async () => {
                await product.markAsDeleted();
              });
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting product:', error);
              Alert.alert('Error', 'Failed to delete product');
            }
          },
        },
      ]
    );
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };

  // Cancel editing
  const handleCancel = () => {
    setIsEditing(false);
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Edit mode
  if (isEditing) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Card style={styles.formCard}>
          <ProductForm
            initialData={{
              name: product.name,
              description: product.description,
              price: product.price.toString(),
              sku: product.sku,
              factoryId: product.factoryId
            }}
            onSave={handleUpdateProduct}
            onCancel={handleCancel}
          />
        </Card>
      </ScrollView>
    );
  }

  // View mode
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Card style={styles.detailCard}>
        <View style={styles.header}>
          <Text style={styles.productName}>{product.name}</Text>
          <TouchableOpacity onPress={toggleEditMode} style={styles.editButton}>
            <Ionicons name="create-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.priceContainer}>
          <Text style={styles.price}>{formatCurrency(product.price)}</Text>
        </View>
        
        {product.sku ? (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>SKU:</Text>
            <Text style={styles.infoValue}>{product.sku}</Text>
          </View>
        ) : null}

        {factory ? (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Factory:</Text>
            <Text style={styles.infoValue}>{factory.name}</Text>
          </View>
        ) : null}
        
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionLabel}>Description</Text>
          <Text style={styles.description}>
            {product.description || 'No description available'}
          </Text>
        </View>
      </Card>
      
      <Button
        title="Delete Product"
        onPress={handleDeleteProduct}
        style={styles.deleteButton}
        type="outline"
        color={colors.error}
      />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailCard: {
    marginBottom: spacing.medium,
  },
  formCard: {
    marginBottom: spacing.medium,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.medium,
  },
  productName: {
    ...fonts.style.heading2,
    color: colors.textDark,
    flex: 1,
  },
  editButton: {
    padding: spacing.small,
    marginLeft: spacing.small,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.medium,
    paddingBottom: spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  price: {
    ...fonts.style.heading3,
    color: colors.primary,
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockLabel: {
    ...fonts.style.body2,
    color: colors.textLight,
    marginRight: spacing.small,
  },
  stockValue: {
    ...fonts.style.subtitle1,
  },
  inStock: {
    color: colors.success,
  },
  outOfStock: {
    color: colors.error,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: spacing.medium,
  },
  infoLabel: {
    ...fonts.style.body2,
    color: colors.textLight,
    width: 80,
  },
  infoValue: {
    ...fonts.style.body1,
    color: colors.textDark,
    flex: 1,
  },
  descriptionContainer: {
    marginTop: spacing.small,
  },
  descriptionLabel: {
    ...fonts.style.subtitle1,
    color: colors.textDark,
    marginBottom: spacing.small,
  },
  description: {
    ...fonts.style.body1,
    color: colors.text,
  },
  deleteButton: {
    marginTop: spacing.medium,
  },
});

export default ProductDetailScreen;