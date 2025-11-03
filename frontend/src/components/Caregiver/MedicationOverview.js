import React, { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useToast } from '../../context/ToastContext';
import { medicationAPI } from '../../services/api';

const MedicationOverview = ({ elders }) => {
  const { socket } = useSocket();
  const toast = useToast();
  const [medicationAlerts, setMedicationAlerts] = useState([]);
  const [medicationData, setMedicationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [overviewStats, setOverviewStats] = useState({
    taken: 0,
    missed: 0,
    upcoming: 0,
    adherence: 0
  });

  // Fetch medication data for all elders
  const fetchMedicationData = async () => {
    try {
      setLoading(true);
      const response = await medicationAPI.getCaregiverMedications();
      if (response.data.success) {
        setMedicationData(response.data.data || []);
        
        // Calculate overview statistics
        let totalTaken = 0;
        let totalMissed = 0;
        let totalUpcoming = 0;
        let totalAdherence = 0;
        let elderCount = 0;

        response.data.data.forEach(elderData => {
          totalTaken += elderData.todayStats.taken;
          totalMissed += elderData.todayStats.missed;
          totalUpcoming += elderData.todayStats.pending;
          totalAdherence += elderData.todayStats.adherence;
          elderCount++;
        });

        setOverviewStats({
          taken: totalTaken,
          missed: totalMissed,
          upcoming: totalUpcoming,
          adherence: elderCount > 0 ? Math.round(totalAdherence / elderCount) : 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch medication data:', error);
      toast.error('Failed to load medication data', 5000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicationData();
    
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchMedicationData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [elders]);

  useEffect(() => {
    if (!socket) return;

    // Listen for medication events from elders
    const handleMedicationTaken = (data) => {
      toast.success(`✅ ${data.elderName} took their medication`, 5000);
      fetchMedicationData(); // Refresh data
    };

    const handleMedicationMissed = (data) => {
      toast.error(`⚠️ ${data.elderName} missed their medication`, 8000);
      setMedicationAlerts(prev => [...prev, {
        id: Date.now(),
        type: 'missed',
        elderName: data.elderName,
        medication: data.medication,
        timestamp: data.timestamp
      }]);
      fetchMedicationData(); // Refresh data
    };

    const handleMedicationReminder = (data) => {
      toast.info(`💊 Reminder: ${data.elderName} should take ${data.medicationName}`, 6000);
    };

    const handleMedicationAutoMissed = (data) => {
      toast.error(`🚨 ${data.elderName} automatically missed their medication`, 10000);
      setMedicationAlerts(prev => [...prev, {
        id: Date.now(),
        type: 'auto-missed',
        elderName: data.elderName,
        medicationId: data.medicationId,
        scheduledTime: data.scheduledTime,
        timestamp: data.timestamp
      }]);
      fetchMedicationData(); // Refresh data
    };

    socket.on('medication-taken', handleMedicationTaken);
    socket.on('medication-missed', handleMedicationMissed);
    socket.on('medication-reminder-caregiver', handleMedicationReminder);
    socket.on('medication-auto-missed', handleMedicationAutoMissed);

    return () => {
      socket.off('medication-taken', handleMedicationTaken);
      socket.off('medication-missed', handleMedicationMissed);
      socket.off('medication-reminder-caregiver', handleMedicationReminder);
      socket.off('medication-auto-missed', handleMedicationAutoMissed);
    };
  }, [socket, toast]);

  const dismissAlert = (alertId) => {
    setMedicationAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatTimeOnly = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Get medication data for a specific elder
  const getElderMedicationData = (elderId) => {
    return medicationData.find(data => data.elderId === elderId) || null;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Medication Monitoring
          </h3>
          <button
            onClick={fetchMedicationData}
            disabled={loading}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {loading ? '🔄 Loading...' : '🔄 Refresh'}
          </button>
        </div>
        
        {loading && medicationData.length === 0 ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading medication data...</p>
          </div>
        ) : elders && elders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {elders.map((elder) => {
              const elderMedData = getElderMedicationData(elder.id);
              
              return (
                <div key={elder.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{elder.name}</h4>
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Last active: {elder.last_login ? new Date(elder.last_login).toLocaleDateString() : 'Never'}
                  </p>
                  
                  {elderMedData ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">📊 Medication adherence:</span>
                        <span className="font-semibold text-blue-600">
                          {elderMedData.weekAdherence}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">💊 Active medications:</span>
                        <span className="font-semibold text-gray-900">
                          {elderMedData.activeMedications}
                        </span>
                      </div>
                      {elderMedData.nextScheduled ? (
                        <div className="flex justify-between">
                          <span className="text-gray-600">⏰ Next scheduled:</span>
                          <span className="font-semibold text-green-600">
                            {formatTimeOnly(elderMedData.nextScheduled.time)}
                          </span>
                        </div>
                      ) : (
                        <div className="flex justify-between">
                          <span className="text-gray-600">⏰ Next scheduled:</span>
                          <span className="text-gray-400">None</span>
                        </div>
                      )}
                      {elderMedData.todayStats.total > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs text-gray-500 mb-1">Today's Status:</p>
                          <div className="flex gap-2 text-xs">
                            <span className="text-green-600">✓ {elderMedData.todayStats.taken}</span>
                            <span className="text-red-600">✗ {elderMedData.todayStats.missed}</span>
                            <span className="text-yellow-600">⏳ {elderMedData.todayStats.pending}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2 text-sm text-gray-500">
                      <p>📊 Medication adherence: --</p>
                      <p>💊 Active medications: --</p>
                      <p>⏰ Next scheduled: --</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No elders assigned</p>
        )}
      </div>

      {/* Recent Medication Alerts */}
      {medicationAlerts.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Medication Alerts
          </h3>
          <div className="space-y-3">
            {medicationAlerts.slice(-5).reverse().map((alert) => (
              <div
                key={alert.id}
                className={`flex items-start justify-between p-3 rounded-lg ${
                  alert.type === 'missed' || alert.type === 'auto-missed'
                    ? 'bg-red-50 border border-red-200'
                    : 'bg-yellow-50 border border-yellow-200'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">
                      {alert.type === 'missed' || alert.type === 'auto-missed' ? '⚠️' : '💊'}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">
                        {alert.elderName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {alert.type === 'auto-missed' ? 'Automatically missed medication' : 'Missed medication'}
                        {alert.medication && `: ${alert.medication}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatTime(alert.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => dismissAlert(alert.id)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Medication Statistics Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Today's Medication Overview
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {overviewStats.taken}
            </div>
            <div className="text-sm text-gray-600">Taken</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {overviewStats.missed}
            </div>
            <div className="text-sm text-gray-600">Missed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {overviewStats.upcoming}
            </div>
            <div className="text-sm text-gray-600">Upcoming</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {overviewStats.adherence}%
            </div>
            <div className="text-sm text-gray-600">Adherence</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicationOverview;
