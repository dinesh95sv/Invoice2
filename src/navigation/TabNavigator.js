import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome5 } from '@expo/vector-icons';

// Screens
import ProductListScreen from '../screens/products/ProductListScreen';
import CustomerListScreen from '../screens/customers/CustomerListScreen';
import CreateInvoiceScreen from '../screens/invoices/CreateInvoiceScreen';
import InvoiceListScreen from '../screens/invoices/InvoiceListScreen';
import FactoryListScreen from '../screens/factories/FactoryListScreen';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="CreateInvoice"
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerShown: true,
      }}
    >
      <Tab.Screen
        name="Products"
        component={ProductListScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="box" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Customers"
        component={CustomerListScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="user-friends" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="CreateInvoice"
        component={CreateInvoiceScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="file-invoice-dollar" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Invoices"
        component={InvoiceListScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="file-invoice" size={size} color={color} />
          ),
          title: 'View Invoices'
        }}
      />
      <Tab.Screen
        name="Factories"
        component={FactoryListScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="industry" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;