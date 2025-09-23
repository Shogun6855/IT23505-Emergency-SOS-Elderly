import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Platform } from 'react-native';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import SOSButton from './components/SOSButton';
import LocationTracker from './components/LocationTracker';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);

  useEffect(() => {
    (async () => {
      // Request location permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      // Request notification permissions
      const { status: notificationStatus } = await Notifications.requestPermissionsAsync();
      if (notificationStatus !== 'granted') {
        Alert.alert('Notification permissions are required for emergency alerts');
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  const handleEmergency = async () => {
    if (isEmergencyActive) {
      // Cancel emergency (if implemented)
      setIsEmergencyActive(false);
      Alert.alert('Emergency Cancelled', 'Emergency alert has been cancelled.');
      return;
    }

    Alert.alert(
      'Emergency Alert',
      'Are you sure you want to send an emergency alert? This will notify all your caregivers.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Send Emergency Alert',
          style: 'destructive',
          onPress: async () => {
            setIsEmergencyActive(true);
            
            try {
              // Get current location
              const currentLocation = await Location.getCurrentPositionAsync({});
              
              // TODO: Send emergency alert to backend
              console.log('Emergency triggered at:', currentLocation);
              
              // Send local notification
              await Notifications.scheduleNotificationAsync({
                content: {
                  title: '🚨 Emergency Alert Sent',
                  body: 'Your caregivers have been notified of your emergency.',
                  sound: true,
                },
                trigger: null,
              });

            } catch (error) {
              console.error('Error sending emergency alert:', error);
              Alert.alert('Error', 'Failed to send emergency alert. Please try again.');
              setIsEmergencyActive(false);
            }
          },
        },
      ]
    );
  };

  let text = 'Waiting..';
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = JSON.stringify(location);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Emergency SOS</Text>
        <Text style={styles.subtitle}>Mobile Emergency Alert System</Text>
      </View>

      <View style={styles.mainContent}>
        <SOSButton 
          onPress={handleEmergency}
          isActive={isEmergencyActive}
        />
        
        {isEmergencyActive && (
          <View style={styles.activeAlert}>
            <Text style={styles.activeAlertText}>
              🚨 EMERGENCY ACTIVE
            </Text>
            <Text style={styles.activeAlertSubtext}>
              Caregivers have been notified
            </Text>
          </View>
        )}
      </View>

      <View style={styles.locationInfo}>
        <LocationTracker location={location} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          ⚠️ Only use in real emergencies
        </Text>
        <Text style={styles.footerSubtext}>
          For life-threatening emergencies, call 911 immediately
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#dc3545',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  activeAlert: {
    marginTop: 30,
    padding: 20,
    backgroundColor: '#dc3545',
    borderRadius: 10,
    alignItems: 'center',
  },
  activeAlertText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  activeAlertSubtext: {
    color: '#fff',
    fontSize: 14,
  },
  locationInfo: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  footerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc3545',
    marginBottom: 5,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
  },
});