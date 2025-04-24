import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView, Text } from 'react-native';
import { withDatabase } from '@nozbe/watermelondb/DatabaseProvider';
import CustomerForm from '../../components/CustomerForm';
import Button from '../../components/common/Button';
import { database } from '../../database';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';
import { fonts } from '../../styles/fonts';
import { validateEmail, validatePhone } from '../../utils/validators';

const AddCustomerScreen = ({ navigation }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const [formValues, setFormValues] = useState({
  //   name: '',
  //   gstin: '',
  //   phone: '',
  //   email: '',
  //   address: '',
  // });

  // const handleValueChange = (field, value) => {
  //   setFormValues({
  //     ...formValues,
  //     [field]: value,
  //   });
  // };

  const onCancelChange = () => {
    navigation.goBack();
  }

  // const validateForm = () => {
  //   if (!formValues.name.trim()) {
  //     Alert.alert('Validation Error', 'Customer name is required');
  //     return false;
  //   }

  //   if (formValues.email && !validateEmail(formValues.email)) {
  //     Alert.alert('Validation Error', 'Please enter a valid email address');
  //     return false;
  //   }

  //   if (formValues.phone && !validatePhone(formValues.phone)) {
  //     Alert.alert('Validation Error', 'Please enter a valid phone number');
  //     return false;
  //   }

  //   return true;
  // };

  const handleSubmit = async (customerData) => {
    setIsSubmitting(true);
    try {
      await database.write(async () => {
        await database.get('customers').create(customer => {
          customer.name = customerData.name;
          customergstin = customerData.gstin;
          customer.phone = customerData.phone;
          customer.email = customerData.email;
          customer.address = customerData.address;
        });
      });
      
      Alert.alert('Success', 'Customer created successfully');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to create customer');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Add New Customer</Text>
      </View>
      
      <View style={styles.formContainer}>
        <CustomerForm 
          customer={null}
          mode="create"
          onSave={(customerData) => handleSubmit(customerData)}
          onCancel={onCancelChange}
          isSubmitting={isSubmitting}
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
  headerContainer: {
    padding: spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerText: {
    fontSize: fonts.size.large,
    fontWeight: fonts.weight.bold,
    color: colors.text,
  },
  formContainer: {
    padding: spacing.medium,
  },
});

export default withDatabase(AddCustomerScreen);