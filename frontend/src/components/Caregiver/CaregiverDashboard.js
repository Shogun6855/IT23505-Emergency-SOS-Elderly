import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../context/SocketContext';
import { useActiveUsers } from '../../hooks/useActiveUsers';
import { emergencyAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const CaregiverDashboard = () => {
  const { user, logout } = useAuth();
  const { connected, socket } = useSocket();
  const { activeUsers, loading } = useActiveUsers();
  const [activeEmergencies, setActiveEmergencies] = useState([]);
  const [emergenciesLoading, setEmergenciesLoading] = useState(true);
  const toast = useToast();

  // Fetch active emergencies
  const fetchActiveEmergencies = async () => {
    try {
      setEmergenciesLoading(true);
      const response = await emergencyAPI.getActive();
      if (response.data.success) {
        setActiveEmergencies(response.data.emergencies);
        console.log('Active emergencies:', response.data.emergencies);
      }
    } catch (error) {
      console.error('Failed to fetch active emergencies:', error);
      toast.error('Failed to load active emergencies', 5000);
    } finally {
      setEmergenciesLoading(false);
    }
  };

  // Handle emergency resolution
  const handleResolveEmergency = async (emergencyId) => {
    try {
      const response = await emergencyAPI.resolve(emergencyId, 'Emergency resolved by caregiver via dashboard');
      if (response.data.success) {
        toast.success('Emergency marked as resolved', 4000);
        // Remove from active emergencies list
        setActiveEmergencies(prev => prev.filter(e => e.id !== emergencyId));
      }
    } catch (error) {
      console.error('Failed to resolve emergency:', error);
      toast.error('Failed to resolve emergency', 5000);
    }
  };

  // Load active emergencies on component mount
  useEffect(() => {
    fetchActiveEmergencies();
  }, []);

  // Listen for new emergency alerts via socket
  useEffect(() => {
    if (socket && connected) {
      const handleNewEmergency = (emergencyData) => {
        console.log('New emergency received:', emergencyData);
        
        // Add to active emergencies list
        setActiveEmergencies(prev => [emergencyData, ...prev]);
        
        // Show toast notification (this will be in addition to the SocketContext toast)
        toast.error(
          `🚨 NEW EMERGENCY: ${emergencyData.elderName}`,
          10000 // Don't auto-dismiss too quickly for emergencies
        );
      };

      socket.on('new-emergency', handleNewEmergency);

      return () => {
        socket.off('new-emergency', handleNewEmergency);
      };
    }
  }, [socket, connected]);

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
              <h1 className="text-2xl font-bold text-gray-900">Emergency SOS - Caregiver</h1>
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
          {/* Active Emergencies */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Active Emergencies
                </h2>
                <button
                  onClick={fetchActiveEmergencies}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Refresh
                </button>
              </div>
              
              {emergenciesLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading emergencies...</p>
                </div>
              ) : activeEmergencies.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">✅</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Active Emergencies
                  </h3>
                  <p className="text-gray-500">
                    All your elders are safe. You'll be notified immediately if anyone needs help.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeEmergencies.map((emergency) => (
                    <div key={emergency.id} className="border border-red-200 bg-red-50 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <span className="text-2xl mr-3">🚨</span>
                            <h3 className="text-lg font-bold text-red-800">
                              {emergency.elderName || emergency.elder_name}
                            </h3>
                            <span className="ml-2 px-2 py-1 bg-red-600 text-white text-xs rounded-full">
                              CRITICAL
                            </span>
                          </div>
                          
                          <div className="space-y-2 text-sm text-red-700">
                            <div className="flex items-center">
                              <span className="font-semibold mr-2">📍 Location:</span>
                              <span>{emergency.location || emergency.address || 'Location not available'}</span>
                            </div>
                            <div className="flex items-center">
                              <span className="font-semibold mr-2">📞 Phone:</span>
                              <span>{emergency.elderPhone || emergency.elder_phone || 'Not available'}</span>
                            </div>
                            <div className="flex items-center">
                              <span className="font-semibold mr-2">⏰ Time:</span>
                              <span>{new Date(emergency.time || emergency.created_at).toLocaleString()}</span>
                            </div>
                            {(emergency.notes) && (
                              <div className="flex items-start">
                                <span className="font-semibold mr-2">📝 Notes:</span>
                                <span>{emergency.notes}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleResolveEmergency(emergency.id)}
                          className="ml-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                          Mark Resolved
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Elder List */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                People Under Your Care
              </h2>
              
              <div className="text-center py-12">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Elders Assigned
                </h3>
                <p className="text-gray-500">
                  Elders need to add you as their caregiver to appear here.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                        Active Elders
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {loading ? '...' : activeUsers.activeElders}
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
                    <div className="w-8 h-8 bg-red-100 rounded-md flex items-center justify-center">
                      <span className="text-red-600">🚨</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Active Emergencies
                      </dt>
                      <dd className={`text-lg font-medium ${activeEmergencies.length > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                        {emergenciesLoading ? '...' : activeEmergencies.length}
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
                        Resolved Today
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        0
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
                    <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                      <span className="text-purple-600">📱</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Connection Status
                      </dt>
                      <dd className={`text-lg font-medium ${connected ? 'text-green-600' : 'text-red-600'}`}>
                        {connected ? 'Connected' : 'Disconnected'}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions for Caregivers */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-6">
            <h3 className="text-lg font-medium text-green-900 mb-4">
              How Emergency Notifications Work
            </h3>
            <ul className="space-y-2 text-green-800">
              <li className="flex items-start">
                <span className="font-bold mr-2">📱</span>
                You'll receive instant notifications via SMS, email, and in-app alerts
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">📍</span>
                Emergency alerts include the elder's exact location and timestamp
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">⚡</span>
                Respond quickly by contacting the elder or going to their location
              </li>
              <li className="flex items-start">
                <span className="font-bold mr-2">✅</span>
                Mark emergencies as resolved once you've provided help
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CaregiverDashboard;