import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../context/SocketContext';
import { useActiveUsers } from '../../hooks/useActiveUsers';
import { emergencyAPI, checkInAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import MedicationManagement from './MedicationManagement';
import MedicationNotifications from './MedicationNotifications';
import MedicationReports from './MedicationReports';
import AssignCaregiver from './AssignCaregiver';
import MedicalProfile from './MedicalProfile';
import Appointments from './Appointments';
import ActivityLog from './ActivityLog';

const ElderDashboard = () => {
  const { user, logout } = useAuth();
  const { connected } = useSocket();
  const { activeUsers, loading } = useActiveUsers();
  const toast = useToast();
  const [emergencyInProgress, setEmergencyInProgress] = useState(false);
  const [activeTab, setActiveTab] = useState('emergency');
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [lastCheckIn, setLastCheckIn] = useState(null);
  const [hoursSinceCheckIn, setHoursSinceCheckIn] = useState(0);

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

  // Load last check-in
  useEffect(() => {
    loadLastCheckIn();
  }, []);

  // Update hours since check-in
  useEffect(() => {
    if (!lastCheckIn) return;
    
    const updateHours = () => {
      const now = new Date();
      const lastCheckInDate = new Date(lastCheckIn.check_in_time);
      const hours = Math.floor((now - lastCheckInDate) / (1000 * 60 * 60));
      setHoursSinceCheckIn(hours);
    };

    updateHours();
    const interval = setInterval(updateHours, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [lastCheckIn]);

  const loadLastCheckIn = async () => {
    try {
      const response = await checkInAPI.getLastCheckIn();
      if (response.data.success && response.data.checkIn) {
        setLastCheckIn(response.data.checkIn);
        const now = new Date();
        const lastCheckInDate = new Date(response.data.checkIn.check_in_time);
        const hours = Math.floor((now - lastCheckInDate) / (1000 * 60 * 60));
        setHoursSinceCheckIn(hours);
      }
    } catch (error) {
      console.error('Failed to load check-in:', error);
    }
  };

  const handleCheckIn = async () => {
    setCheckInLoading(true);
    try {
      const response = await checkInAPI.checkIn(6); // 6 hours reminder
      if (response.data.success) {
        toast.success('✅ Check-in recorded! Caregivers will be notified if you don\'t check in within 6 hours.', 5000);
        loadLastCheckIn();
      }
    } catch (error) {
      toast.error('Failed to record check-in. Please try again.');
      console.error('Check-in error:', error);
    } finally {
      setCheckInLoading(false);
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
              <button
                onClick={() => setActiveTab('caregivers')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'caregivers'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                👥 Caregivers
              </button>
              <button
                onClick={() => setActiveTab('medical')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'medical'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                🏥 Medical Profile
              </button>
              <button
                onClick={() => setActiveTab('appointments')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'appointments'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📅 Appointments
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'activity'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📊 Activity
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'reports'
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                📈 Reports
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

          {/* Caregivers Quick Access */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 overflow-hidden shadow-lg rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center">
                    <span className="text-2xl mr-2">👥</span>
                    Manage Your Caregivers
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Add caregivers to receive emergency alerts and notifications. They'll be notified when you trigger SOS or need assistance.
                  </p>
                  <button
                    onClick={() => setActiveTab('caregivers')}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
                  >
                    <span className="mr-2">+</span>
                    Add or Manage Caregivers
                  </button>
                </div>
                <div className="ml-4 text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {activeUsers.activeCaregivers || 0}
                  </div>
                  <div className="text-sm text-gray-600">Caregivers Online</div>
                </div>
              </div>
            </div>
          </div>

          {/* I'm Okay Check-in Section */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  I'm Okay Check-in
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Let your caregivers know you're doing well. If you don't check in within 6 hours, they'll be automatically notified.
                </p>
                <button
                  onClick={handleCheckIn}
                  disabled={checkInLoading}
                  className={`
                    px-6 py-3 rounded-lg font-medium text-white
                    transition-all duration-200 transform hover:scale-105 active:scale-95
                    ${checkInLoading 
                      ? 'bg-gray-400 cursor-wait' 
                      : 'bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg'
                    }
                  `}
                >
                  {checkInLoading ? 'Recording...' : "✓ I'm Okay"}
                </button>
                {lastCheckIn && (
                  <div className="mt-4 text-sm text-gray-600">
                    <p>Last check-in: {new Date(lastCheckIn.check_in_time).toLocaleString()}</p>
                    <p className="mt-1">
                      {hoursSinceCheckIn < 1 
                        ? 'Checked in less than an hour ago' 
                        : `Checked in ${hoursSinceCheckIn} hour${hoursSinceCheckIn !== 1 ? 's' : ''} ago`
                      }
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Next reminder: {new Date(lastCheckIn.next_reminder_time).toLocaleString()}
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

          {/* Caregivers Tab */}
          {activeTab === 'caregivers' && (
            <AssignCaregiver />
          )}

          {/* Medical Profile Tab */}
          {activeTab === 'medical' && (
            <MedicalProfile />
          )}

          {/* Appointments Tab */}
          {activeTab === 'appointments' && (
            <Appointments />
          )}

          {/* Activity Log Tab */}
          {activeTab === 'activity' && (
            <ActivityLog />
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <MedicationReports />
          )}
        </div>
      </main>
      
      {/* Medication Notifications */}
      <MedicationNotifications />
    </div>
  );
};

export default ElderDashboard;