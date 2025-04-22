import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { database } from '../../database';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import SwipeableRow from '../../components/common/SwipeableRow';

import colors from '../../styles/colors';
import spacing from '../../styles/spacing';
import fonts from '../../styles/fonts';
import { formatPhoneNumber } from '../../utils/formatUtils';

const CustomerListScreen = () => {
  const navigation = useNavigation();
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch customers from the database
  const fetchCustomers = async () => {
    try {
      const customersCollection = database.get('customers');
      const customersData = await customersCollection.query().fetch();
      setCustomers(customersData);
    } catch (error) {
      console.error('Error fetching customers:', error);
      Alert.alert('Error', 'Failed to load customers');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchCustomers();

    // Subscribe to changes in the customers collection
    const subscription = database.get('customers')
      .query()
      .observe()
      .subscribe(customersData => {
        setCustomers(customersData);
      });

    // Clean up subscription on unmount
    return () => subscription.unsubscribe();
  }, []);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchCustomers();
  };

  // Navigate to add customer screen
  const navigateToAddCustomer = () => {
    navigation.navigate('AddCustomer');
  };

  // Navigate to customer detail screen
  const navigateToCustomerDetail = (customer) => {
    navigation.navigate('CustomerDetail', { customerId: customer.id });
  };

  // Handle customer deletion
  const handleDeleteCustomer = async (customer) => {
    Alert.alert(
      'Delete Customer',
      `Are you sure you want to delete ${customer.name}?`,
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
              // Customer will be removed from the UI due to the subscription
            } catch (error) {
              console.error('Error deleting customer:', error);
              Alert.alert('Error', 'Failed to delete customer');
            }
          },
        },
      ]
    );
  };

  // Render customer item
  const renderCustomerItem = ({ item }) => {
    const rightActions = [
      {
        text: 'Edit',
        color: colors.info,
        onPress: () => navigateToCustomerDetail(item),
        icon: 'create-outline',
      },
      {
        text: 'Delete',
        color: colors.error,
        onPress: () => handleDeleteCustomer(item),
        icon: 'trash-outline',
      },
    ];

    return (
      <SwipeableRow rightActions={rightActions}>
        <TouchableOpacity
          style={styles.customerCard}
          onPress={() => navigateToCustomerDetail(item)}
          activeOpacity={0.7}
        >
          <Card>
            <View style={styles.customerContent}>
              <View style={styles.customerInfo}>
                <Text style={styles.customerName}>{item.name}</Text>
                <Text style={styles.customerEmail}>{item.email || 'No email'}</Text>
                {item.phone ? (
                  <Text style={styles.customerPhone}>{formatPhoneNumber(item.phone)}</Text>
                ) : null}
              </View>
              <View style={styles.customerActions}>
                <Ionicons
                  name="chevron-forward"
                  size={24}
                  color={colors.gray400}
                />
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
      <Ionicons name="people-outline" size={64} color={colors.gray400} />
      <Text style={styles.emptyText}>No customers found</Text>
      <Text style={styles.emptySubtext}>Add your first customer to get started</Text>
      <Button
        title="Add Customer"
        onPress={navigateToAddCustomer}
        style={styles.emptyButton}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={customers}
        keyExtractor={(item) => item.id}
        renderItem={renderCustomerItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={!isLoading && renderEmptyList()}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={navigateToAddCustomer}
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
  buttonContainer: {
    padding: spacing.medium,
  },
});

export default CustomerListScreen;