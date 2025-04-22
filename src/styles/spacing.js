/**
 * Spacing constants for consistent layout
 */

// Base unit for spacing
const baseUnit = 4;

export default {
  // Basic spacing values
  tiny: baseUnit, // 4
  small: baseUnit * 2, // 8
  medium: baseUnit * 4, // 16
  large: baseUnit * 6, // 24
  xlarge: baseUnit * 8, // 32
  xxlarge: baseUnit * 12, // 48
  
  // Common layout spacing
  screenPadding: baseUnit * 4, // 16
  sectionPadding: baseUnit * 6, // 24
  cardPadding: baseUnit * 4, // 16
  itemSpacing: baseUnit * 3, // 12
  rowSpacing: baseUnit * 4, // 16
  columnSpacing: baseUnit * 4, // 16
  
  // Form element spacing
  inputHeight: baseUnit * 12, // 48
  inputPadding: baseUnit * 3, // 12
  buttonHeight: baseUnit * 12, // 48
  buttonPadding: baseUnit * 4, // 16
  
  // Icon sizes
  iconSmall: baseUnit * 5, // 20
  iconMedium: baseUnit * 6, // 24
  iconLarge: baseUnit * 8, // 32
  
  // Border radius
  borderRadiusSmall: baseUnit, // 4
  borderRadiusMedium: baseUnit * 2, // 8
  borderRadiusLarge: baseUnit * 4, // 16
  borderRadiusRound: 9999, // Fully rounded corners
  
  // Shadow properties
  shadowOffset: {
    width: 0,
    height: baseUnit, // 4
  },
  shadowRadius: baseUnit, // 4
  shadowOpacity: 0.1,
  
  // Utility method to get multiples of the base unit
  unit: (multiplier = 1) => baseUnit * multiplier,
};