import React, { useState, useEffect } from 'react';
import { reportAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const MedicationReports = () => {
  const toast = useToast();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  useEffect(() => {
    fetchReport();
  }, [days]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await reportAPI.getMedicationReport({ days });
      if (response.data.success) {
        setReport(response.data.report);
      }
    } catch (error) {
      console.error('Failed to fetch report:', error);
      toast.error('Failed to load medication report', 3000);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <p className="text-gray-500">No medication data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Medication Adherence Report</h2>
        <select
          value={days}
          onChange={(e) => setDays(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="7">Last 7 days</option>
          <option value="14">Last 14 days</option>
          <option value="30">Last 30 days</option>
        </select>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-sm text-gray-600 mb-1">Total Scheduled</div>
          <div className="text-2xl font-bold text-blue-600">{report.overall.totalScheduled}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-sm text-gray-600 mb-1">Taken</div>
          <div className="text-2xl font-bold text-green-600">{report.overall.taken}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-sm text-gray-600 mb-1">Missed</div>
          <div className="text-2xl font-bold text-red-600">{report.overall.missed}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-sm text-gray-600 mb-1">Pending</div>
          <div className="text-2xl font-bold text-yellow-600">{report.overall.pending}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-sm text-gray-600 mb-1">Adherence Rate</div>
          <div className="text-2xl font-bold text-blue-600">{report.overall.adherenceRate}%</div>
        </div>
      </div>

      {/* Daily Breakdown */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Daily Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Date</th>
                <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Total</th>
                <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Taken</th>
                <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Missed</th>
                <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Rate</th>
              </tr>
            </thead>
            <tbody>
              {report.dailyBreakdown.map((day, idx) => {
                const rate = day.total > 0 ? Math.round((day.taken / day.total) * 100) : 0;
                return (
                  <tr key={idx} className="border-b">
                    <td className="px-4 py-2 text-sm">{new Date(day.date).toLocaleDateString()}</td>
                    <td className="px-4 py-2 text-center text-sm">{day.total}</td>
                    <td className="px-4 py-2 text-center text-sm text-green-600">{day.taken}</td>
                    <td className="px-4 py-2 text-center text-sm text-red-600">{day.missed}</td>
                    <td className="px-4 py-2 text-center text-sm font-medium">{rate}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Medication Breakdown */}
      {report.medicationBreakdown && report.medicationBreakdown.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">By Medication</h3>
          <div className="space-y-3">
            {report.medicationBreakdown.map((med, idx) => {
              const rate = med.total_scheduled > 0
                ? Math.round((med.taken / med.total_scheduled) * 100)
                : 0;
              return (
                <div key={idx} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <div className="font-semibold text-gray-900">{med.name}</div>
                      <div className="text-sm text-gray-600">{med.dosage}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">{rate}%</div>
                      <div className="text-xs text-gray-500">Adherence</div>
                    </div>
                  </div>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>Total: {med.total_scheduled}</span>
                    <span className="text-green-600">Taken: {med.taken}</span>
                    <span className="text-red-600">Missed: {med.missed}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicationReports;

