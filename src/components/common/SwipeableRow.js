import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { RectButton, Swipeable } from 'react-native-gesture-handler';
import { FontAwesome5 } from '@expo/vector-icons';

const SwipeableRow = ({
  children,
  onEdit,
  onDelete,
}) => {
  const renderRightActions = (progress, dragX) => {
    const trans = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [0, 80],
      extrapolate: 'clamp',
    });
    
    return (
      <View style={styles.rightActionsContainer}>
        {onEdit && (
          <Animated.View style={{ flex: 1, transform: [{ translateX: trans }] }}>
            <RectButton
              style={[styles.rightAction, styles.editAction]}
              onPress={onEdit}
            >
              <FontAwesome5 name="edit" size={16} color="#FFF" />
              <Text style={styles.actionText}>Edit</Text>
            </RectButton>
          </Animated.View>
        )}
        {onDelete && (
          <Animated.View style={{ flex: 1, transform: [{ translateX: trans }] }}>
            <RectButton
              style={[styles.rightAction, styles.deleteAction]}
              onPress={onDelete}
            >
              <FontAwesome5 name="trash-alt" size={16} color="#FFF" />
              <Text style={styles.actionText}>Delete</Text>
            </RectButton>
          </Animated.View>
        )}
      </View>
    );
  };

  return (
    <Swipeable
      friction={2}
      rightThreshold={40}
      renderRightActions={renderRightActions}
    >
      {children}
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  rightActionsContainer: {
    width: 160,
    flexDirection: 'row',
  },
  rightAction: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAction: {
    backgroundColor: '#3498db',
  },
  deleteAction: {
    backgroundColor: '#FF3B30',
  },
  actionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    padding: 4,
  },
});

export default SwipeableRow;