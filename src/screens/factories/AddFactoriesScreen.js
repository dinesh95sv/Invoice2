// src/screens/factories/AddFactoryScreen.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { withDatabase } from '@nozbe/watermelondb/DatabaseProvider';
import { database } from '../../database';
import FactoryForm from '../../components/FactoryForm';
import Button from '../../components/common/Button';
import { colors } from '../../styles/colors';

const AddFactoryScreen = ({ route, navigation }) => {
  const editingFactory = route.params?.factory;
  const isEditing = !!editingFactory;
  const [loading, setLoading] = useState(false);

  const onCancelChange = () => {
    navigation.goBack();
  }

  const handleSubmit = async (factoryData) => {
    setLoading(true);
    try {
      await database.write(async () => {
        if (isEditing) {
          // Update existing factory
          await editingFactory.update((factory) => {
            factory.name = factoryData.name;
            factory.gstin = factoryData.gstin;
            factory.phone = factoryData.phone;
            factory.address = factoryData.address;
          });
        } else {
          // Create new factory
          await database.get('factories').create((factory) => {
            factory.name = factoryData.name;
            factory.gstin = factoryData.gstin;
            factory.phone = factoryData.phone;
            factory.address = factoryData.address;
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
          factory={isEditing ? editingFactory : null}
          mode={isEditing ? "edit" : "create"}
          onSave={(factoryData) => handleSubmit(factoryData)}
          onCancel={onCancelChange}
          isSubmitting={loading}
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

export default withDatabase(AddFactoryScreen);