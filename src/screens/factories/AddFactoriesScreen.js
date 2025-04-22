// src/screens/factories/AddFactoryScreen.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { database } from '../../database';
import FactoryForm from '../../components/FactoryForm';
import Button from '../../components/common/Button';
import { colors } from '../../styles/colors';

const AddFactoryScreen = ({ route, navigation }) => {
  const editingFactory = route.params?.factory;
  const isEditing = !!editingFactory;
  
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    contactInfo: '',
    description: '',
  });
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditing) {
      // Pre-fill the form with existing factory data
      setFormData({
        name: editingFactory.name,
        location: editingFactory.location,
        contactInfo: editingFactory.contactInfo,
        description: editingFactory.description || '',
      });
    }
  }, [editingFactory]);

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Factory name is required');
      return;
    }
    
    if (!formData.location.trim()) {
      Alert.alert('Error', 'Factory location is required');
      return;
    }

    try {
      setLoading(true);
      
      await database.write(async () => {
        if (isEditing) {
          // Update existing factory
          await editingFactory.update((factory) => {
            factory.name = formData.name;
            factory.location = formData.location;
            factory.contactInfo = formData.contactInfo;
            factory.description = formData.description;
          });
        } else {
          // Create new factory
          const factoriesCollection = database.get('factories');
          await factoriesCollection.create((factory) => {
            factory.name = formData.name;
            factory.location = formData.location;
            factory.contactInfo = formData.contactInfo;
            factory.description = formData.description;
          });
        }
      });
      
      // Success message and navigate back
      Alert.alert(
        'Success',
        isEditing ? 'Factory updated successfully' : 'Factory added successfully',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error saving factory:', error);
      Alert.alert('Error', 'Failed to save factory');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <FactoryForm
          formData={formData}
          onChange={handleFormChange}
        />
        
        <Button
          title={isEditing ? 'Update Factory' : 'Add Factory'}
          onPress={handleSubmit}
          loading={loading}
          style={styles.submitButton}
        />
        
        <Button
          title="Cancel"
          onPress={() => navigation.goBack()}
          type="outline"
          style={styles.cancelButton}
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
  formContainer: {
    padding: 16,
  },
  submitButton: {
    marginTop: 24,
  },
  cancelButton: {
    marginTop: 12,
    marginBottom: 24,
  },
});

export default AddFactoryScreen;