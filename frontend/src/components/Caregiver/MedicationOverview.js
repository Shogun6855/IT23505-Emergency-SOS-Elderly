import React, { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useToast } from '../../context/ToastContext';

const MedicationOverview = ({ elders }) => {
  const { socket } = useSocket();
  const toast = useToast();
  const [medicationAlerts, setMedicationAlerts] = useState([]);

  useEffect(() => {
    if (!socket) return;

    // Listen for medication events from elders
    socket.on('medication-taken', (data) => {
      toast.success(`✅ ${data.elderName} took their medication`, 5000);
    });

    socket.on('medication-missed', (data) => {
      toast.error(`⚠️ ${data.elderName} missed their medication`, 8000);
      setMedicationAlerts(prev => [...prev, {
        id: Date.now(),
        type: 'missed',
        elderName: data.elderName,
        medication: data.medication,
        timestamp: data.timestamp
      }]);
    });

    socket.on('medication-reminder-caregiver', (data) => {
      toast.info(`💊 Reminder: ${data.elderName} should take ${data.medicationName}`, 6000);
    });

    socket.on('medication-auto-missed', (data) => {
      toast.error(`🚨 ${data.elderName} automatically missed their medication`, 10000);
      setMedicationAlerts(prev => [...prev, {
        id: Date.now(),
        type: 'auto-missed',
        elderName: data.elderName,
        medicationId: data.medicationId,
        scheduledTime: data.scheduledTime,
        timestamp: data.timestamp
      }]);
    });

    return () => {
      socket.off('medication-taken');
      socket.off('medication-missed');
      socket.off('medication-reminder-caregiver');
      socket.off('medication-auto-missed');
    };
  }, [socket, toast]);

  const dismissAlert = (alertId) => {
    setMedicationAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Medication Monitoring
        </h3>
        
        {elders && elders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {elders.map((elder) => (
              <div key={elder.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{elder.name}</h4>
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                </div>
                <p className="text-sm text-gray-600">
                  Last active: {elder.last_login ? new Date(elder.last_login).toLocaleDateString() : 'Never'}
                </p>
                <div className="mt-3 text-xs text-gray-500">
                  <p>📊 Medication adherence: --</p>
                  <p>💊 Active medications: --</p>
                  <p>⏰ Next scheduled: --</p>
                </div>
              </div>
            ))}
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
                    <span className={`text-lg ${
                      alert.type === 'missed' || alert.type === 'auto-missed' ? '⚠️' : '💊'
                    }`}>
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">
                        {alert.elderName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {alert.type === 'auto-missed' ? 'Automatically missed medication' : 'Missed medication'}
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
            <div className="text-2xl font-bold text-green-600">--</div>
            <div className="text-sm text-gray-600">Taken</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">--</div>
            <div className="text-sm text-gray-600">Missed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">--</div>
            <div className="text-sm text-gray-600">Upcoming</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">--%</div>
            <div className="text-sm text-gray-600">Adherence</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicationOverview;