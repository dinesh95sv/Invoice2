import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './TabNavigator';

// Screens - Products
import ProductDetailScreen from '../screens/products/ProductDetailScreen';
import AddProductScreen from '../screens/products/AddProductScreen';

// Screens - Customers
import CustomerDetailScreen from '../screens/customers/CustomerDetailScreen';
import AddCustomerScreen from '../screens/customers/AddCustomerScreen';

// Screens - Factories
import FactoryDetailScreen from '../screens/factories/FactoryDetailScreen';
import AddFactoryScreen from '../screens/factories/AddFactoryScreen';

// Screens - Invoices
import InvoiceDetailScreen from '../screens/invoices/InvoiceDetailScreen';
import CreateInvoiceScreen from '../screens/invoices/CreateInvoiceScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Main"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Main" component={TabNavigator} />
      
      {/* Product Screens */}
      <Stack.Screen 
        name="ProductDetail" 
        component={ProductDetailScreen} 
        options={{ headerShown: true, title: 'Product Details' }}
      />
      <Stack.Screen 
        name="AddProduct" 
        component={AddProductScreen} 
        options={{ headerShown: true, title: 'Add Product' }}
      />
      
      {/* Customer Screens */}
      <Stack.Screen 
        name="CustomerDetail" 
        component={CustomerDetailScreen} 
        options={{ headerShown: true, title: 'Customer Details' }}
      />
      <Stack.Screen 
        name="AddCustomer" 
        component={AddCustomerScreen} 
        options={{ headerShown: true, title: 'Add Customer' }}
      />
      
      {/* Factory Screens */}
      <Stack.Screen 
        name="FactoryDetail" 
        component={FactoryDetailScreen} 
        options={{ headerShown: true, title: 'Factory Details' }}
      />
      <Stack.Screen 
        name="AddFactory" 
        component={AddFactoryScreen} 
        options={{ headerShown: true, title: 'Add Factory' }}
      />
      
      {/* Invoice Screens */}
      <Stack.Screen 
        name="InvoiceDetail" 
        component={InvoiceDetailScreen} 
        options={{ headerShown: true, title: 'Invoice Details' }}
      />
      {/* <Stack.Screen 
        name="CreateInvoice" 
        component={CreateInvoiceScreen} 
        options={{ headerShown: true, title: 'Create Invoice' }}
      /> */}
    </Stack.Navigator>
  );
};

export default AppNavigator;