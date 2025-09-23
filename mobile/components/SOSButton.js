import React from 'react';
import { StyleSheet, Text, TouchableOpacity, Animated, Vibration } from 'react-native';

const SOSButton = ({ onPress, isActive }) => {
  const scaleAnim = new Animated.Value(1);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    // Vibrate to provide haptic feedback
    Vibration.vibrate([0, 100, 50, 100]);
    onPress();
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={[
          styles.button,
          isActive ? styles.buttonActive : styles.buttonInactive
        ]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
        <Text style={styles.emoji}>🚨</Text>
        <Text style={styles.text}>
          {isActive ? 'ACTIVE' : 'EMERGENCY'}
        </Text>
        <Text style={styles.subtext}>
          {isActive ? 'Tap to cancel' : 'Tap for help'}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
  },
  buttonInactive: {
    backgroundColor: '#dc3545',
  },
  buttonActive: {
    backgroundColor: '#28a745',
  },
  emoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtext: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
  },
});

export default SOSButton;