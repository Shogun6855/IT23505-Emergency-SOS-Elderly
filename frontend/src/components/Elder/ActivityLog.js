import React, { useState, useEffect } from 'react';
import { activityAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const ActivityLog = () => {
  const toast = useToast();
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    activity_type: '',
    description: '',
    mood: '',
    energy_level: '',
    notes: ''
  });

  useEffect(() => {
    fetchActivities();
    fetchStats();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await activityAPI.getActivities({ days: 7 });
      if (response.data.success) {
        setActivities(response.data.activities);
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      toast.error('Failed to load activities', 3000);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await activityAPI.getStats({ days: 30 });
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await activityAPI.logActivity(formData);
      if (response.data.success) {
        toast.success('Activity logged successfully', 3000);
        setShowAddModal(false);
        setFormData({
          activity_type: '',
          description: '',
          mood: '',
          energy_level: '',
          notes: ''
        });
        fetchActivities();
        fetchStats();
      }
    } catch (error) {
      console.error('Failed to log activity:', error);
      toast.error('Failed to log activity', 3000);
    }
  };

  const getMoodEmoji = (mood) => {
    const moodEmojis = {
      'excellent': '😄',
      'good': '🙂',
      'okay': '😐',
      'tired': '😴',
      'unwell': '🤒'
    };
    return moodEmojis[mood] || '😐';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Activity Log</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          + Log Activity
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Average Energy</div>
            <div className="text-2xl font-bold text-blue-600">
              {stats.averageEnergy || 'N/A'}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Total Activities (30 days)</div>
            <div className="text-2xl font-bold text-green-600">
              {stats.totalActivities}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-600">Most Common Activity</div>
            <div className="text-lg font-semibold text-gray-900">
              {stats.activityTypes[0]?.activity_type || 'N/A'}
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activities (Last 7 Days)</h3>
        {activities.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No activities logged yet</p>
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-900">{activity.activity_type}</span>
                      {activity.mood && (
                        <span className="text-xl">{getMoodEmoji(activity.mood)}</span>
                      )}
                    </div>
                    {activity.description && (
                      <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                    )}
                    <div className="flex gap-4 text-xs text-gray-500">
                      <span>📅 {new Date(activity.activity_date).toLocaleDateString()}</span>
                      {activity.energy_level && (
                        <span>⚡ Energy: {activity.energy_level}/10</span>
                      )}
                      {activity.mood && (
                        <span>Mood: {activity.mood}</span>
                      )}
                    </div>
                    {activity.notes && (
                      <p className="text-sm text-gray-600 mt-2 italic">{activity.notes}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Log Activity</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Activity Type *
                </label>
                <select
                  name="activity_type"
                  value={formData.activity_type}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select activity</option>
                  <option value="Exercise">Exercise</option>
                  <option value="Walk">Walk</option>
                  <option value="Meal">Meal</option>
                  <option value="Social">Social Activity</option>
                  <option value="Rest">Rest</option>
                  <option value="Medical">Medical Appointment</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mood
                  </label>
                  <select
                    name="mood"
                    value={formData.mood}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select mood</option>
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="okay">Okay</option>
                    <option value="tired">Tired</option>
                    <option value="unwell">Unwell</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Energy Level (1-10)
                  </label>
                  <input
                    type="number"
                    name="energy_level"
                    value={formData.energy_level}
                    onChange={handleChange}
                    min="1"
                    max="10"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Log Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityLog;

