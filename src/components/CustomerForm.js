import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
// import { database } from '../database';
// import { Customer } from '../database/model/Customer';

const CustomerForm = ({ customer, mode, onSave, onCancel, isSubmitting }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [gstin, setGstin] = useState('');

  useEffect(() => {
    if (customer) {
      setName(customer.name || '');
      setEmail(customer.email || '');
      setPhone(customer.phone || '');
      setAddress(customer.address || '');
      setGstin(customer.gstin || '');
    }
  }, [customer]);

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Customer name is required');
      return false;
    }

    if (!gstin.trim()) {
      Alert.alert('Validation Error', 'Customer GST No. is required');
      return false;
    }

    if (!phone.trim()) {
      Alert.alert('Validation Error', 'Customer Phone No. is required');
      return false;
    }
    
    if (email && !email.match(/^\S+@\S+\.\S+$/)) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return false;
    }
    
    return true;
  };

  const handleCancel = () => {
    setName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setGstin('');

    onCancel && onCancel()
  }

  const handleSave = () => {
    if (!validateForm()) return;
    
    const customerData = {
      name : name,
      gstin : gstin,
      phone : phone,
      email : email,
      address : address
    } 
    onSave(customerData);
    // try {
    //   await database.write(async () => {
    //     if (mode === "edit") {
    //       await customer.update(record => {
    //         record.name = name;
    //         record.email = email;
    //         record.phone = phone;
    //         record.address = address;
    //         record.gstin = gstin;
    //       });
    //     } else {
    //       const newCustomer = await database.collections.get('customers').create(record => {
    //         record.name = name;
    //         record.email = email;
    //         record.phone = phone;
    //         record.address = address;
    //         record.gstin = gstin;
    //       });
    //     }
    //   });
      
    //   onSave && onSave();
    // } catch (error) {
    //   console.error('Error saving customer:', error);
    //   Alert.alert('Error', 'Failed to save customer information');
    // } finally {
    //   setIsLoading(false);
    // }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{mode === "edit" ? 'Edit Customer' : 'Add New Customer'}</Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Name *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Customer name"
          autoCapitalize="words"
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>GSTIN *</Text>
        <TextInput
          style={styles.input}
          value={gstin}
          maxLength={15}
          onChangeText={(gstText) => setGstin(gstText.toUpperCase())}
          placeholder="GSTIN number"
          // autoCapitalize="characters"
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Phone No.</Text>
        <TextInput
          style={styles.input}
          value={phone}
          maxLength={10}
          onChangeText={setPhone}
          placeholder="Phone number"
          keyboardType="phone-pad"
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="email@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Address</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={address}
          onChangeText={setAddress}
          placeholder="Full address"
          multiline
          numberOfLines={4}
        />
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.cancelButton]} 
          onPress={handleCancel}
          disabled={isSubmitting}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.saveButton, isSubmitting && styles.disabledButton]} 
          onPress={handleSave}
          disabled={isSubmitting}
        >
          <Text style={styles.buttonText}>{isSubmitting ? 'Saving...' : 'Save'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  saveButton: {
    backgroundColor: '#007bff',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CustomerForm;