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
  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    country: '',
    notes: '',
  });

  const handleValueChange = (field, value) => {
    setFormValues({
      ...formValues,
      [field]: value,
    });
  };

  const validateForm = () => {
    if (!formValues.name.trim()) {
      Alert.alert('Validation Error', 'Customer name is required');
      return false;
    }

    if (formValues.email && !validateEmail(formValues.email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return false;
    }

    if (formValues.phone && !validatePhone(formValues.phone)) {
      Alert.alert('Validation Error', 'Please enter a valid phone number');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await database.write(async () => {
        await database.get('customers').create(customer => {
          customer.name = formValues.name;
          customer.email = formValues.email;
          customer.phone = formValues.phone;
          customer.address = formValues.address;
          customer.city = formValues.city;
          customer.zipCode = formValues.zipCode;
          customer.country = formValues.country;
          customer.notes = formValues.notes;
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
          values={formValues}
          onValueChange={handleValueChange}
        />
      </View>
      
      <View style={styles.buttonContainer}>
        <Button 
          title="Save Customer" 
          onPress={handleSubmit} 
          loading={isSubmitting}
          disabled={isSubmitting}
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
  buttonContainer: {
    padding: spacing.medium,
    marginTop: spacing.small,
  },
});

export default withDatabase(AddCustomerScreen);