import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../context/SocketContext';
import { useActiveUsers } from '../../hooks/useActiveUsers';
import { emergencyAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import MedicationManagement from './MedicationManagement';
import MedicationNotifications from './MedicationNotifications';

const ElderDashboard = () => {
  const { user, logout } = useAuth();
  const { connected } = useSocket();
  const { activeUsers, loading } = useActiveUsers();
  const toast = useToast();
  const [emergencyInProgress, setEmergencyInProgress] = useState(false);
  const [activeTab, setActiveTab] = useState('emergency');

  const handleEmergencyTrigger = async () => {
    if (emergencyInProgress) return;

    setEmergencyInProgress(true);
    
    try {
      // Get user's location if possible
      let latitude = null;
      let longitude = null;
      let address = "Location not available";

      if (navigator.geolocation) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 0
            });
          });
          
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;
          address = `Lat: ${latitude.toFixed(6)}, Long: ${longitude.toFixed(6)}`;
        } catch (locationError) {
          console.warn('Could not get location:', locationError);
        }
      }

      // Hardcoded emergency data as requested
      const emergencyData = {
        latitude,
        longitude,
        address,
        notes: "EMERGENCY ALERT: Elder needs immediate assistance! This is a test emergency from the SOS button."
      };

      console.log('Triggering emergency with data:', emergencyData);

      const response = await emergencyAPI.trigger(emergencyData);
      
      if (response.data.success) {
        toast.success(
          `🚨 Emergency alert sent to ${response.data.notifiedCaregivers} caregiver(s)!`,
          6000
        );
        console.log('Emergency triggered successfully:', response.data);
      } else {
        throw new Error(response.data.message || 'Failed to send emergency alert');
      }

    } catch (error) {
      console.error('Emergency trigger failed:', error);
      toast.error(
        `Failed to send emergency alert: ${error.response?.data?.message || error.message}`,
        8000
      );
    } finally {
      setEmergencyInProgress(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-emergency-600 rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-sm font-bold">🚨</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Emergency SOS</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {user?.name}</span>
              <button
                onClick={logout}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Navigation Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('emergency')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'emergency'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🚨 Emergency SOS
              </button>
              <button
                onClick={() => setActiveTab('medications')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'medications'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                💊 Medications
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'emergency' && (
            <>
              {/* Emergency Section */}
              <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Emergency Alert System
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  Press the button below if you need immediate help
                </p>
                
                {/* Emergency Button */}
                <div className="flex justify-center">
                  <button 
                    onClick={handleEmergencyTrigger}
                    disabled={emergencyInProgress || !connected}
                    className={`
                      w-48 h-48 rounded-full flex items-center justify-center text-white text-2xl font-bold
                      transition-all duration-200 transform hover:scale-105 active:scale-95
                      ${emergencyInProgress 
                        ? 'bg-yellow-500 cursor-wait animate-pulse' 
                        : connected 
                          ? 'bg-red-600 hover:bg-red-700 shadow-lg hover:shadow-xl cursor-pointer' 
                          : 'bg-gray-400 cursor-not-allowed'
                      }
                      ${emergencyInProgress ? 'animate-bounce' : ''}
                    `}
                  >
                    <div className="text-center">
                      <div className="text-6xl mb-2">
                        {emergencyInProgress ? '⏳' : '🚨'}
                      </div>
                      <div className="text-xl">
                        {emergencyInProgress ? 'SENDING...' : 'EMERGENCY'}
                      </div>
                      {!connected && (
                        <div className="text-sm mt-1">
                          DISCONNECTED
                        </div>
                      )}
                    </div>
                  </button>
                </div>
                
                <p className="text-sm text-gray-500 mt-6">
                  ⚠️ Only use in real emergencies. This will notify all your caregivers immediately with your location.
                </p>
                {!connected && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                    <p className="text-red-800 text-sm">
                      <span className="font-bold">⚠️ Warning:</span> You are currently disconnected. 
                      The emergency button will not work until connection is restored.
                    </p>
                  </div>
                )}
                {activeUsers.activeCaregivers === 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                    <p className="text-yellow-800 text-sm">
                      <span className="font-bold">ℹ️ Notice:</span> No caregivers are currently online. 
                      Emergency notifications will still be sent via SMS and email.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                      <span className="text-blue-600">👥</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Active Caregivers
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {loading ? '...' : activeUsers.activeCaregivers}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                      <span className="text-green-600">✅</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        System Status
                      </dt>
                      <dd className={`text-lg font-medium ${connected ? 'text-green-600' : 'text-red-600'}`}>
                        {connected ? 'Connected' : 'Disconnected'}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                      <span className="text-yellow-600">📍</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Location Sharing
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        Enabled
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
            <h3 className="text-lg font-medium text-blue-900 mb-4">
              How to Use Emergency SOS
            </h3>
            <ul className="space-y-2 text-blue-800">
              <li className="flex items-start">
                <span className="font-bold mr-2">1.</span>
                Press the large red emergency button above when you need help
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">2.</span>
                Your location will be automatically shared with your caregivers
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">3.</span>
                All your caregivers will receive immediate notifications via SMS and email
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">4.</span>
                Wait for help to arrive or call 911 if it's a life-threatening emergency
              </li>
            </ul>
          </div>
            </>
          )}

          {/* Medications Tab */}
          {activeTab === 'medications' && (
            <MedicationManagement />
          )}
        </div>
      </main>
      
      {/* Medication Notifications */}
      <MedicationNotifications />
    </div>
  );
};

export default ElderDashboard;