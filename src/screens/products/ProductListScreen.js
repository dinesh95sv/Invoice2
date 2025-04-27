import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
// import { Q } from '@nozbe/watermelondb';

import { database } from '../../database';
import Product from '../../database/models/Product';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import SwipeableRow from '../../components/common/SwipeableRow';

import colors from '../../styles/colors';
import spacing from '../../styles/spacing';
import fonts from '../../styles/fonts';
import { formatCurrency } from '../../utils/formatUtils';

const ProductListScreen = () => {
  const navigation = useNavigation();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch products from the database
  const fetchProducts = async () => {
    try {
      const productsCollection = database.get('products');
      const productsData = await productsCollection.query().fetch();
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
      Alert.alert('Error', 'Failed to load products');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchProducts();

    // Subscribe to changes in the products collection
    const subscription = database.get('products')
      .query()
      .observe()
      .subscribe(productsData => {
        setProducts(productsData);
      });

    // Clean up subscription on unmount
    return () => subscription.unsubscribe();
  }, []);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  // Navigate to add product screen
  const navigateToAddProduct = () => {
    navigation.navigate('AddProduct');
  };

  // Navigate to product detail screen
  const navigateToProductDetail = (product) => {
    navigation.navigate('ProductDetail', { productId: product.id });
  };

  // Handle product deletion
  const handleDeleteProduct = async (product) => {
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
              // Product will be removed from the UI due to the subscription
            } catch (error) {
              console.error('Error deleting product:', error);
              Alert.alert('Error', 'Failed to delete product');
            }
          },
        },
      ]
    );
  };

  // Render product item
  const renderProductItem = ({ item }) => {
    const rightActions = [
      {
        text: 'Edit',
        color: colors.info,
        onPress: () => navigateToProductDetail(item),
        icon: 'create-outline',
      },
      {
        text: 'Delete',
        color: colors.error,
        onPress: () => handleDeleteProduct(item),
        icon: 'trash-outline',
      },
    ];

    return (
      <SwipeableRow rightActions={rightActions}>
        <TouchableOpacity
          style={styles.productCard}
          onPress={() => navigateToProductDetail(item)}
          activeOpacity={0.7}
        >
          <Card>
            <View style={styles.productContent}>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productDescription} numberOfLines={1}>
                  {item.description || 'No description'}
                </Text>
              </View>
              <View style={styles.productPrice}>
                <Text style={styles.priceText}>{formatCurrency(item.price)}</Text>
                {/* <Text style={styles.stockText}>Stock: {item.stock}</Text> */}
              </View>
            </View>
          </Card>
        </TouchableOpacity>
      </SwipeableRow>
    );
  };

  // Render empty list placeholder
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="cube-outline" size={64} color={colors.gray400} />
      <Text style={styles.emptyText}>No products found</Text>
      <Text style={styles.emptySubtext}>Add your first product to get started</Text>
      <Button
        title="Add Product"
        onPress={navigateToAddProduct}
        style={styles.emptyButton}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={renderProductItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={!isLoading && renderEmptyList()}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={navigateToAddProduct}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={30} color={colors.white} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: spacing.medium,
    paddingBottom: spacing.xxlarge, // Extra padding for FAB
  },
  productCard: {
    marginBottom: spacing.medium,
  },
  productContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
    marginRight: spacing.medium,
  },
  productName: {
    ...fonts.style.subtitle1,
    color: colors.textDark,
    marginBottom: spacing.tiny,
  },
  productDescription: {
    ...fonts.style.body2,
    color: colors.textLight,
  },
  productPrice: {
    alignItems: 'flex-end',
  },
  priceText: {
    ...fonts.style.subtitle1,
    color: colors.primary,
    marginBottom: spacing.tiny,
  },
  stockText: {
    ...fonts.style.caption,
    color: colors.textLight,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxlarge,
  },
  emptyText: {
    ...fonts.style.heading3,
    color: colors.textDark,
    marginTop: spacing.medium,
  },
  emptySubtext: {
    ...fonts.style.body2,
    color: colors.textLight,
    marginTop: spacing.small,
    marginBottom: spacing.large,
    textAlign: 'center',
  },
  emptyButton: {
    minWidth: 150,
  },
  addButton: {
    position: 'absolute',
    right: spacing.large,
    bottom: spacing.large,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: colors.black,
    shadowOffset: spacing.shadowOffset,
    shadowOpacity: 0.3,
    shadowRadius: spacing.shadowRadius,
  },
});

export default ProductListScreen;