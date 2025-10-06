import React, { useEffect, useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useToast } from '../../context/ToastContext';
import { medicationAPI } from '../../services/api';

const MedicationNotifications = () => {
  const { socket } = useSocket();
  const toast = useToast();
  const [activeReminders, setActiveReminders] = useState([]);

  useEffect(() => {
    if (!socket) return;

    // Listen for medication reminders
    socket.on('medication-reminder', (reminder) => {
      showMedicationReminder(reminder);
    });

    return () => {
      socket.off('medication-reminder');
    };
  }, [socket]);

  const showMedicationReminder = (reminder) => {
    const reminderTime = new Date(reminder.scheduledTime).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });

    // Add to active reminders
    setActiveReminders(prev => [...prev, reminder]);

    // Show toast notification
    toast.info(
      `💊 Time for your medication: ${reminder.medicationName} (${reminder.dosage}) - Scheduled at ${reminderTime}`,
      10000 // 10 seconds
    );

    // Play notification sound (optional)
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Medication Reminder', {
        body: `Time to take ${reminder.medicationName} (${reminder.dosage})`,
        icon: '/medication-icon.png',
        badge: '/medication-badge.png'
      });
    }
  };

  const markReminderTaken = async (reminder) => {
    try {
      await medicationAPI.markMedicationTaken(reminder.id);
      setActiveReminders(prev => prev.filter(r => r.id !== reminder.id));
      toast.success(`✅ ${reminder.medicationName} marked as taken!`);
    } catch (error) {
      toast.error('Failed to mark medication as taken');
    }
  };

  const markReminderMissed = async (reminder) => {
    try {
      await medicationAPI.markMedicationMissed(reminder.id, 'Marked as missed by user');
      setActiveReminders(prev => prev.filter(r => r.id !== reminder.id));
      toast.info(`${reminder.medicationName} marked as missed`);
    } catch (error) {
      toast.error('Failed to mark medication as missed');
    }
  };

  const dismissReminder = (reminderId) => {
    setActiveReminders(prev => prev.filter(r => r.id !== reminderId));
  };

  if (activeReminders.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      {activeReminders.map((reminder) => {
        const reminderTime = new Date(reminder.scheduledTime).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        });

        return (
          <div
            key={reminder.id}
            className="bg-white border-l-4 border-blue-500 rounded-lg shadow-lg p-4 animate-bounce"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-lg">💊</span>
                </div>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-semibold text-gray-900">
                  Medication Reminder
                </h3>
                <p className="text-sm text-gray-700 mt-1">
                  <strong>{reminder.medicationName}</strong> ({reminder.dosage})
                </p>
                <p className="text-xs text-gray-500">
                  Scheduled for {reminderTime}
                </p>
                {reminder.instructions && (
                  <p className="text-xs text-blue-600 mt-1">
                    {reminder.instructions}
                  </p>
                )}
                
                {/* Action Buttons */}
                <div className="mt-3 flex space-x-2">
                  <button
                    onClick={() => markReminderTaken(reminder)}
                    className="bg-green-600 text-white text-xs px-3 py-1 rounded hover:bg-green-700 transition-colors"
                  >
                    Take Now
                  </button>
                  <button
                    onClick={() => markReminderMissed(reminder)}
                    className="bg-red-600 text-white text-xs px-3 py-1 rounded hover:bg-red-700 transition-colors"
                  >
                    Mark Missed
                  </button>
                  <button
                    onClick={() => dismissReminder(reminder.id)}
                    className="bg-gray-300 text-gray-700 text-xs px-3 py-1 rounded hover:bg-gray-400 transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MedicationNotifications;