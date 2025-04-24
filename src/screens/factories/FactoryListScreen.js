// src/screens/factories/FactoryListScreen.js
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { database } from '../../database';
import { Q } from '@nozbe/watermelondb';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import SwipeableRow from '../../components/common/SwipeableRow';
import Text from '../../components/common/Text';
import { colors } from '../../styles/colors';

const FactoryListScreen = ({ navigation }) => {
  const [factories, setFactories] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadFactories = async () => {
    try {
      const factoriesCollection = database.get('factories');
      const factoryRecords = await factoriesCollection.query().fetch();
      setFactories(factoryRecords);
    } catch (error) {
      console.error('Failed to load factories:', error);
      Alert.alert('Error', 'Failed to load factories');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadFactories();

    // Subscribe to navigation focus events
    const unsubscribe = navigation.addListener('focus', () => {
      loadFactories();
    });

    return unsubscribe;
  }, [navigation]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadFactories();
  };

  const handleFactoryPress = (factory) => {
    navigation.navigate('FactoryDetail', { factoryId: factory.id });
  };

  const handleAddFactory = () => {
    navigation.navigate('AddFactory');
  };

  const handleDeleteFactory = async (factory) => {
    try {
      await database.write(async () => {
        await factory.markAsDeleted();
      });
      loadFactories(); // Refresh list
    } catch (error) {
      console.error('Error deleting factory:', error);
      Alert.alert('Error', 'Could not delete factory');
    }
  };

  const renderFactoryItem = ({ item }) => (
    <SwipeableRow
      onDelete={() => handleDeleteFactory(item)}
      onEdit={() => navigation.navigate('AddFactory', { factory: item })}
    >
      <TouchableOpacity onPress={() => handleFactoryPress(item)}>
        <Card style={styles.factoryCard}>
          <Text style={styles.factoryName}>{item.name}</Text>
          <Text style={styles.factoryDetail}>{item.gstin}</Text>
          <Text style={styles.factoryDetail}>{item.address}</Text>
          <Text style={styles.factoryDetail}>{item.phone}</Text>
        </Card>
      </TouchableOpacity>
    </SwipeableRow>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={factories}
        keyExtractor={(item) => item.id}
        renderItem={renderFactoryItem}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={styles.listContent}
      />
      <Button 
        title="Add Factory" 
        onPress={handleAddFactory} 
        style={styles.addButton}
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
  factoryCard: {
    padding: 16,
    marginBottom: 8,
  },
  factoryName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  factoryDetail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  addButton: {
    margin: 16,
  },
});

export default FactoryListScreen;