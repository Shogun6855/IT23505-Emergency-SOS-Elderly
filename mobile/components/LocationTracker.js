import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const LocationTracker = ({ location }) => {
  if (!location) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>📍 Location Status</Text>
        <Text style={styles.status}>Getting location...</Text>
      </View>
    );
  }

  const { latitude, longitude } = location.coords;
  const timestamp = new Date(location.timestamp).toLocaleString();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📍 Current Location</Text>
      <View style={styles.locationInfo}>
        <Text style={styles.coordinate}>
          Latitude: {latitude.toFixed(6)}
        </Text>
        <Text style={styles.coordinate}>
          Longitude: {longitude.toFixed(6)}
        </Text>
        <Text style={styles.timestamp}>
          Updated: {timestamp}
        </Text>
      </View>
      <View style={styles.statusIndicator}>
        <View style={styles.statusDot} />
        <Text style={styles.statusText}>Location tracking active</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#343a40',
    marginBottom: 10,
  },
  locationInfo: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  coordinate: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 3,
    fontFamily: 'monospace',
  },
  timestamp: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 5,
  },
  status: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#28a745',
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: '500',
  },
});

export default LocationTracker;