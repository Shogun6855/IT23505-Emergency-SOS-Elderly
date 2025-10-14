import React, { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useToast } from '../../context/ToastContext';

const MedicationOverview = ({ elders }) => {
  const { socket } = useSocket();
  const toast = useToast();
  const [medicationAlerts, setMedicationAlerts] = useState([]);
  const [stats, setStats] = useState({ taken: 0, missed: 0, upcoming: 0, adherence: 0 });

  const MAX_ALERTS = 20;

  const recomputeStats = (alerts) => {
    const taken = alerts.filter(a => a.type === 'taken').length;
    const missed = alerts.filter(a => a.type === 'missed' || a.type === 'auto-missed').length;
    const total = taken + missed;
    const adherence = total > 0 ? Math.round((taken / total) * 100) : 0;
    setStats({ taken, missed, upcoming: 0, adherence });
  };

  useEffect(() => {
    if (!socket) return;

    // Listen for medication events from elders
    socket.on('medication-taken', (data) => {
      toast.success(`✅ ${data.elderName} took their medication`, 5000);
      setMedicationAlerts(prev => {
        const next = [...prev, {
          id: Date.now(),
          type: 'taken',
          elderName: data.elderName,
          medication: data.medication,
          timestamp: data.timestamp
        }];
        // Cap list size
        const capped = next.slice(-MAX_ALERTS);
        recomputeStats(capped);
        return capped;
      });
    });

    socket.on('medication-missed', (data) => {
      toast.error(`⚠️ ${data.elderName} missed their medication`, 8000);
      setMedicationAlerts(prev => {
        const next = [...prev, {
          id: Date.now(),
          type: 'missed',
          elderName: data.elderName,
          medication: data.medication,
          timestamp: data.timestamp
        }];
        const capped = next.slice(-MAX_ALERTS);
        recomputeStats(capped);
        return capped;
      });
    });

    socket.on('medication-reminder-caregiver', (data) => {
      toast.info(`💊 Reminder: ${data.elderName} should take ${data.medicationName}`, 6000);
    });

    socket.on('medication-auto-missed', (data) => {
      toast.error(`🚨 ${data.elderName} automatically missed their medication`, 10000);
      setMedicationAlerts(prev => {
        const next = [...prev, {
          id: Date.now(),
          type: 'auto-missed',
          elderName: data.elderName,
          medicationId: data.medicationId,
          scheduledTime: data.scheduledTime,
          timestamp: data.timestamp
        }];
        const capped = next.slice(-MAX_ALERTS);
        recomputeStats(capped);
        return capped;
      });
    });

    return () => {
      socket.off('medication-taken');
      socket.off('medication-missed');
      socket.off('medication-reminder-caregiver');
      socket.off('medication-auto-missed');
    };
  }, [socket, toast]);

  const dismissAlert = (alertId) => {
    setMedicationAlerts(prev => {
      const next = prev.filter(alert => alert.id !== alertId);
      recomputeStats(next);
      return next;
    });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const clearAllAlerts = () => {
    setMedicationAlerts([]);
    recomputeStats([]);
  };

  const resetToday = () => {
    if (window.confirm('Reset today\'s medication alerts and stats?')) {
      setMedicationAlerts([]);
      setStats({ taken: 0, missed: 0, upcoming: 0, adherence: 0 });
    }
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
                  <p>📊 Medication adherence: {stats.adherence}%</p>
                  <p>💊 Taken/Missed today: {stats.taken}/{stats.missed}</p>
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
          <div className="flex justify-end mb-3">
            <button
              onClick={clearAllAlerts}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Clear All
            </button>
          </div>
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
                        {alert.elderName} {alert.medication?.name ? `• ${alert.medication.name}` : ''}
                      </p>
                      <p className="text-sm text-gray-600">
                        {alert.type === 'taken' ? 'Medication taken' : alert.type === 'auto-missed' ? 'Automatically missed medication' : 'Missed medication'}
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
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Today's Medication Overview
          </h3>
          <button
            onClick={resetToday}
            className="px-3 py-1 text-sm bg-gray-100 border border-gray-200 rounded-md hover:bg-gray-200"
          >
            Reset Today
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.taken}</div>
            <div className="text-sm text-gray-600">Taken</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.missed}</div>
            <div className="text-sm text-gray-600">Missed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.upcoming}</div>
            <div className="text-sm text-gray-600">Upcoming</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.adherence}%</div>
            <div className="text-sm text-gray-600">Adherence</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicationOverview;