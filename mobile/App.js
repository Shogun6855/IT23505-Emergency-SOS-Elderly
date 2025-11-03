import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Platform } from 'react-native';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import * as Battery from 'expo-battery';
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
  const [batteryLevel, setBatteryLevel] = useState(null);
  const [batteryAlertSent, setBatteryAlertSent] = useState(false);

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

      // Battery monitoring
      if (Platform.OS !== 'web') {
        // Get initial battery level
        const level = await Battery.getBatteryLevelAsync();
        setBatteryLevel(Math.round(level * 100));

        // Monitor battery level changes
        const subscription = Battery.addBatteryLevelListener(({ batteryLevel }) => {
          const percentage = Math.round(batteryLevel * 100);
          setBatteryLevel(percentage);
          checkBatteryLevel(percentage);
        });

        // Check battery level every 30 seconds
        const batteryCheckInterval = setInterval(async () => {
          const level = await Battery.getBatteryLevelAsync();
          const percentage = Math.round(level * 100);
          setBatteryLevel(percentage);
          checkBatteryLevel(percentage);
        }, 30000);

        return () => {
          subscription.remove();
          clearInterval(batteryCheckInterval);
        };
      }
    })();
  }, []);

  const checkBatteryLevel = async (level) => {
    // If battery is 15% or less and we haven't sent an alert yet
    if (level <= 15 && !batteryAlertSent) {
      setBatteryAlertSent(true);
      
      try {
        // TODO: Send battery alert to backend API
        // await batteryAPI.reportBatteryLevel(level, Platform.OS);
        console.log(`Low battery alert: ${level}%`);
        
        // Show local notification
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '🔋 Low Battery',
            body: `Your battery is at ${level}%. Caregivers will be notified.`,
            sound: true,
          },
          trigger: null,
        });

        // Reset alert flag after 1 hour (to allow new alerts if battery continues to drop)
        setTimeout(() => {
          setBatteryAlertSent(false);
        }, 60 * 60 * 1000);
      } catch (error) {
        console.error('Error reporting battery level:', error);
      }
    }
    
    // Reset alert flag if battery goes above 20%
    if (level > 20) {
      setBatteryAlertSent(false);
    }
  };

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
        {batteryLevel !== null && (
          <View style={styles.batteryInfo}>
            <Text style={styles.batteryLabel}>Battery Level:</Text>
            <Text style={[
              styles.batteryLevel,
              batteryLevel <= 15 && styles.batteryLow
            ]}>
              {batteryLevel}%
            </Text>
            {batteryLevel <= 15 && (
              <Text style={styles.batteryWarning}>
                ⚠️ Low battery alert sent to caregivers
              </Text>
            )}
          </View>
        )}
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
  batteryInfo: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 5,
    alignItems: 'center',
  },
  batteryLabel: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 5,
  },
  batteryLevel: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#28a745',
  },
  batteryLow: {
    color: '#dc3545',
  },
  batteryWarning: {
    fontSize: 12,
    color: '#dc3545',
    marginTop: 5,
    fontStyle: 'italic',
  },
});