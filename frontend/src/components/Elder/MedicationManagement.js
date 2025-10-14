import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import { medicationAPI } from '../../services/api';

const MedicationManagement = () => {
  const [medications, setMedications] = useState([]);
  const [todaysMeds, setTodaysMeds] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    frequency: 'daily',
    timeSlots: ['08:00'],
    instructions: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: ''
  });

  const frequencyOptions = [
    { value: 'daily', label: 'Once Daily', slots: 1 },
    { value: 'twice_daily', label: 'Twice Daily', slots: 2 },
    { value: 'three_times_daily', label: 'Three Times Daily', slots: 3 },
    { value: 'custom', label: 'Custom', slots: 0 }
  ];

  useEffect(() => {
    fetchMedications();
    fetchTodaysMedications();
  }, []);

  const fetchMedications = async () => {
    try {
      const response = await medicationAPI.getUserMedications();
      setMedications(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch medications');
    }
  };

  const fetchTodaysMedications = async () => {
    try {
      const response = await medicationAPI.getTodaysMedications();
      setTodaysMeds(response.data.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch today\'s medications');
      setLoading(false);
    }
  };

  const handleFrequencyChange = (frequency) => {
    const option = frequencyOptions.find(opt => opt.value === frequency);
    let defaultSlots = [];
    
    switch (frequency) {
      case 'daily':
        defaultSlots = ['08:00'];
        break;
      case 'twice_daily':
        defaultSlots = ['08:00', '20:00'];
        break;
      case 'three_times_daily':
        defaultSlots = ['08:00', '14:00', '20:00'];
        break;
      default:
        defaultSlots = ['08:00'];
    }

    setNewMedication(prev => ({
      ...prev,
      frequency,
      timeSlots: defaultSlots
    }));
  };

  const addTimeSlot = () => {
    setNewMedication(prev => ({
      ...prev,
      timeSlots: [...prev.timeSlots, '08:00']
    }));
  };

  const removeTimeSlot = (index) => {
    setNewMedication(prev => ({
      ...prev,
      timeSlots: prev.timeSlots.filter((_, i) => i !== index)
    }));
  };

  const updateTimeSlot = (index, time) => {
    setNewMedication(prev => ({
      ...prev,
      timeSlots: prev.timeSlots.map((slot, i) => i === index ? time : slot)
    }));
  };

  const testConnection = async () => {
    try {
      console.log('Testing API connection...');
      console.log('Current token:', localStorage.getItem('token')?.substring(0, 50) + '...');
      const response = await medicationAPI.getUserMedications();
      console.log('API connection successful:', response);
      toast.success('API connection working!');
    } catch (error) {
      console.error('API connection failed:', error);
      if (error.response?.status === 401) {
        toast.error('Authentication failed - please log out and log back in');
      } else {
        toast.error('API connection failed: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const refreshToken = async () => {
    try {
      console.log('Refreshing authentication...');
      localStorage.removeItem('token');
      toast.success('Please log in again to refresh your session');
      // Redirect to login after a short delay
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (error) {
      console.error('Error refreshing token:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newMedication.name.trim() || !newMedication.dosage.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    console.log('Submitting medication:', newMedication);
    console.log('Token exists:', !!localStorage.getItem('token'));

    try {
      const response = await medicationAPI.addMedication(newMedication);
      console.log('Medication added successfully:', response);
      toast.success('Medication added successfully!');
      setShowAddForm(false);
      setNewMedication({
        name: '',
        dosage: '',
        frequency: 'daily',
        timeSlots: ['08:00'],
        instructions: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: ''
      });
      fetchMedications();
      fetchTodaysMedications();
    } catch (error) {
      console.error('Error adding medication:', error);
      console.error('Error response:', error.response);
      toast.error(error.response?.data?.message || 'Failed to add medication');
    }
  };

  const markAsTaken = async (logId) => {
    try {
      await medicationAPI.markMedicationTaken(logId);
      toast.success('Medication marked as taken!');
      fetchTodaysMedications();
    } catch (error) {
      toast.error('Failed to update medication status');
    }
  };

  const markAsMissed = async (logId) => {
    try {
      await medicationAPI.markMedicationMissed(logId);
      toast.success('Medication marked as missed');
      fetchTodaysMedications();
    } catch (error) {
      toast.error('Failed to update medication status');
    }
  };

  const deleteAllMedications = async () => {
    if (!window.confirm('Are you sure you want to delete ALL medications? This action cannot be undone and will remove all medication schedules and logs.')) {
      return;
    }

    try {
      // Delete each medication individually
      const deletePromises = medications.map(med => medicationAPI.deleteMedication(med.id));
      await Promise.all(deletePromises);
      
      toast.success(`Successfully deleted ${medications.length} medication(s)!`);
      fetchMedications();
      fetchTodaysMedications();
    } catch (error) {
      toast.error('Failed to delete some medications. Please try again.');
    }
  };

  const formatTime = (timeString) => {
    const time = new Date(`2000-01-01T${timeString}`);
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Medication Management</h2>
        <div className="space-x-2">
          <button
            onClick={testConnection}
            className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            Test API
          </button>
          <button
            onClick={refreshToken}
            className="bg-orange-600 text-white px-3 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm"
          >
            Refresh Login
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showAddForm ? 'Cancel' : 'Add Medication'}
          </button>
        </div>
      </div>

      {/* Today's Medications */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Today's Schedule ({new Date().toLocaleDateString()})
        </h3>
        
        {todaysMeds.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No medications scheduled for today</p>
        ) : (
          <div className="space-y-3">
            {todaysMeds.map((med) => (
              <div
                key={med.id}
                className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                  med.status === 'taken'
                    ? 'bg-green-50 border-green-200'
                    : med.status === 'missed'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-yellow-50 border-yellow-200'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      med.status === 'taken'
                        ? 'bg-green-500'
                        : med.status === 'missed'
                        ? 'bg-red-500'
                        : 'bg-yellow-500'
                    }`}></div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{med.name}</h4>
                      <p className="text-sm text-gray-600">
                        {med.dosage} - {formatTime(new Date(med.scheduled_time).toTimeString().slice(0, 5))}
                      </p>
                      {med.instructions && (
                        <p className="text-sm text-gray-500 mt-1">{med.instructions}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                {med.status === 'pending' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => markAsTaken(med.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                    >
                      Take
                    </button>
                    <button
                      onClick={() => markAsMissed(med.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                    >
                      Miss
                    </button>
                  </div>
                )}
                
                {med.status !== 'pending' && (
                  <span className={`text-sm font-medium ${
                    med.status === 'taken' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {med.status === 'taken' ? '✓ Taken' : '✗ Missed'}
                    {med.taken_at && (
                      <span className="block text-xs text-gray-500">
                        {new Date(med.taken_at).toLocaleTimeString()}
                      </span>
                    )}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Medication Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Medication</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medication Name *
                </label>
                <input
                  type="text"
                  value={newMedication.name}
                  onChange={(e) => setNewMedication(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Aspirin"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dosage *
                </label>
                <input
                  type="text"
                  value={newMedication.dosage}
                  onChange={(e) => setNewMedication(prev => ({ ...prev, dosage: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 100mg"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frequency
              </label>
              <select
                value={newMedication.frequency}
                onChange={(e) => handleFrequencyChange(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {frequencyOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Slots
              </label>
              <div className="space-y-2">
                {newMedication.timeSlots.map((slot, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="time"
                      value={slot}
                      onChange={(e) => updateTimeSlot(index, e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {newMedication.timeSlots.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTimeSlot(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                {newMedication.frequency === 'custom' && (
                  <button
                    type="button"
                    onClick={addTimeSlot}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + Add Time Slot
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={newMedication.startDate}
                  onChange={(e) => setNewMedication(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  value={newMedication.endDate}
                  onChange={(e) => setNewMedication(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instructions (Optional)
              </label>
              <textarea
                value={newMedication.instructions}
                onChange={(e) => setNewMedication(prev => ({ ...prev, instructions: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="3"
                placeholder="e.g., Take with food"
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Medication
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Medication List */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">All Medications</h3>
          {medications.length > 0 && (
            <button
              onClick={deleteAllMedications}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear All
            </button>
          )}
        </div>
        
        {medications.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No medications added yet</p>
        ) : (
          <div className="space-y-4">
            {medications.map((med) => (
              <div key={med.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-900">{med.name}</h4>
                    <p className="text-sm text-gray-600">{med.dosage}</p>
                    <p className="text-sm text-gray-500">
                      Times: {med.time_slots.map(slot => formatTime(slot)).join(', ')}
                    </p>
                    {med.instructions && (
                      <p className="text-sm text-gray-500 mt-1">{med.instructions}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {med.start_date} {med.end_date && `to ${med.end_date}`}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    med.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {med.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicationManagement;