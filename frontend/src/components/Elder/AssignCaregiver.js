import React, { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../hooks/useAuth';

const AssignCaregiver = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [caregivers, setCaregivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [email, setEmail] = useState('');
  const [relationship, setRelationship] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCaregivers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCaregivers = async () => {
    try {
      setLoading(true);
      console.log('Loading caregivers...');
      const response = await userAPI.getCaregivers();
      console.log('Caregivers response:', response.data);
      if (response.data.success) {
        console.log('Caregivers found:', response.data.caregivers);
        setCaregivers(response.data.caregivers);
      }
    } catch (error) {
      toast.error('Failed to load caregivers');
      console.error('Load caregivers error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCaregiver = async (e) => {
    e.preventDefault();
    if (!email.trim() || !relationship.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      const response = await userAPI.addCaregiver({
        caregiver_email: email.trim(),
        relationship: relationship.trim()
      });

      if (response.data.success) {
        toast.success('Caregiver added successfully!');
        setEmail('');
        setRelationship('');
        setShowAddForm(false);
        loadCaregivers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add caregiver');
      console.error('Add caregiver error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveCaregiver = async (caregiverId) => {
    if (!window.confirm('Are you sure you want to remove this caregiver?')) {
      return;
    }

    try {
      const response = await userAPI.removeCaregiver(caregiverId);
      if (response.data.success) {
        toast.success('Caregiver removed successfully');
        loadCaregivers();
      }
    } catch (error) {
      toast.error('Failed to remove caregiver');
      console.error('Remove caregiver error:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="text-center">Loading caregivers...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">My Caregivers</h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {showAddForm ? 'Cancel' : '+ Add Caregiver'}
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddCaregiver} className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Caregiver Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="caregiver@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Relationship
              </label>
              <input
                type="text"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                placeholder="e.g., Daughter, Son, Friend"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors"
            >
              {submitting ? 'Adding...' : 'Add Caregiver'}
            </button>
          </form>
        )}

        {caregivers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Caregivers Added
            </h3>
            <p className="text-gray-500 mb-4">
              Add a caregiver to receive emergency alerts and notifications.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {caregivers.map((caregiver) => (
              <div
                key={caregiver.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div>
                  <h3 className="font-semibold text-gray-900">{caregiver.name}</h3>
                  <p className="text-sm text-gray-600">{caregiver.email}</p>
                  {caregiver.phone && (
                    <p className="text-sm text-gray-600">📞 {caregiver.phone}</p>
                  )}
                  {caregiver.relationship && (
                    <p className="text-sm text-blue-600">Relationship: {caregiver.relationship}</p>
                  )}
                </div>
                <button
                  onClick={() => handleRemoveCaregiver(caregiver.id)}
                  className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignCaregiver;

