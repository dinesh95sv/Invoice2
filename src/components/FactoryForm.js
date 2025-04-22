import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { database } from '../database';

const FactoryForm = ({ factory, onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gstin, setGstin] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (factory) {
      setName(factory.name || '');
      setLocation(factory.location || '');
      setContactPerson(factory.contactPerson || '');
      setContactPhone(factory.contactPhone || '');
      setEmail(factory.email || '');
      setGstin(factory.gstin || '');
    }
  }, [factory]);

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Factory name is required');
      return false;
    }
    
    if (!location.trim()) {
      Alert.alert('Validation Error', 'Factory location is required');
      return false;
    }
    
    if (email && !email.match(/^\S+@\S+\.\S+$/)) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return false;
    }
    
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await database.write(async () => {
        if (factory) {
          await factory.update(record => {
            record.name = name;
            record.location = location;
            record.contactPerson = contactPerson;
            record.contactPhone = contactPhone;
            record.email = email;
            record.gstin = gstin;
          });
        } else {
          await database.collections.get('factories').create(record => {
            record.name = name;
            record.location = location;
            record.contactPerson = contactPerson;
            record.contactPhone = contactPhone;
            record.email = email;
            record.gstin = gstin;
          });
        }
      });
      
      onSave && onSave();
    } catch (error) {
      console.error('Error saving factory:', error);
      Alert.alert('Error', 'Failed to save factory information');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{factory ? 'Edit Factory' : 'Add New Factory'}</Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Name *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Factory name"
          autoCapitalize="words"
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Location *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={location}
          onChangeText={setLocation}
          placeholder="Factory address"
          multiline
          numberOfLines={3}
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Contact Person</Text>
        <TextInput
          style={styles.input}
          value={contactPerson}
          onChangeText={setContactPerson}
          placeholder="Name of contact person"
          autoCapitalize="words"
        />
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Contact Phone</Text>
        <TextInput
          style={styles.input}
          value={contactPhone}
          onChangeText={setContactPhone}
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
        <Text style={styles.label}>GSTIN</Text>
        <TextInput
          style={styles.input}
          value={gstin}
          onChangeText={setGstin}
          placeholder="GSTIN number"
          autoCapitalize="characters"
        />
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.cancelButton]} 
          onPress={onCancel}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.saveButton, isLoading && styles.disabledButton]} 
          onPress={handleSave}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>{isLoading ? 'Saving...' : 'Save'}</Text>
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
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 30,
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

export default FactoryForm;