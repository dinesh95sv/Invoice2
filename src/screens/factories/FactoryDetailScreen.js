// src/screens/factories/FactoryDetailScreen.js
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { database } from '../../database';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Text from '../../components/common/Text';
import List from '../../components/common/List';
import { colors } from '../../styles/colors';

const FactoryDetailScreen = ({ route, navigation }) => {
  const { factoryId } = route.params;
  const [factory, setFactory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFactoryDetails();
  }, [factoryId]);

  const loadFactoryDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch factory details
      const factoryCollection = database.get('factories');
      const factoryRecord = await factoryCollection.find(factoryId);
      setFactory(factoryRecord);
      
      // Fetch products associated with this factory
      const factoryProducts = await factoryRecord.products.fetch();
      setProducts(factoryProducts);
    } catch (error) {
      console.error('Failed to load factory details:', error);
      Alert.alert('Error', 'Could not load factory details');
    } finally {
      setLoading(false);
    }
  };

  const handleEditFactory = () => {
    navigation.navigate('AddFactory', { factory });
  };

  const handleDeleteFactory = async () => {
    Alert.alert(
      'Delete Factory',
      'Are you sure you want to delete this factory? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await database.write(async () => {
                await factory.markAsDeleted();
              });
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting factory:', error);
              Alert.alert('Error', 'Could not delete factory');
            }
          },
        },
      ]
    );
  };

  const handleProductPress = (product) => {
    navigation.navigate('ProductDetail', { productId: product.id });
  };

  if (loading || !factory) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading factory details...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.factoryDetails}>
        <Text style={styles.factoryName}>{factory.name}</Text>
        <Text style={styles.sectionTitle}>Location</Text>
        <Text style={styles.detailText}>{factory.location}</Text>
        
        <Text style={styles.sectionTitle}>Contact Information</Text>
        <Text style={styles.detailText}>{factory.contactInfo}</Text>
        
        {factory.description && (
          <>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.detailText}>{factory.description}</Text>
          </>
        )}
      </Card>

      <Card style={styles.productsCard}>
        <Text style={styles.sectionTitle}>Products</Text>
        {products.length > 0 ? (
          <List
            data={products}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <List.Item
                title={item.name}
                subtitle={`$${item.price}`}
                onPress={() => handleProductPress(item)}
              />
            )}
          />
        ) : (
          <Text style={styles.emptyText}>No products associated with this factory</Text>
        )}
      </Card>

      <View style={styles.buttonsContainer}>
        <Button 
          title="Edit Factory" 
          onPress={handleEditFactory} 
          style={styles.editButton} 
        />
        <Button 
          title="Delete Factory" 
          onPress={handleDeleteFactory} 
          style={styles.deleteButton}
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
  factoryDetails: {
    padding: 16,
    margin: 16,
  },
  factoryName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
    color: colors.primary,
  },
  detailText: {
    fontSize: 16,
    marginBottom: 8,
  },
  productsCard: {
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  emptyText: {
    fontStyle: 'italic',
    color: colors.textSecondary,
    textAlign: 'center',
    marginVertical: 16,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 24,
  },
  editButton: {
    flex: 1,
    marginRight: 8,
  },
  deleteButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: colors.danger,
  },
});

export default FactoryDetailScreen;
