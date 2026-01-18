import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAttendance } from '../context/AttendanceContext';
import { useMembers } from '../context/MembersContext';

export default function PresidentDashboard() {
  const { attendance, exportToExcel, createAttendanceForDate } = useAttendance();
  const { members } = useMembers();
  const [selectedDate, setSelectedDate] = useState('');
  const navigate = useNavigate();
  const totalMembers = members.length;
  const totalRehearsals = attendance.length;
  
  const allRecords = attendance.flatMap(a => a.records);
  const presentCount = allRecords.filter(r => r.status === 'present').length;
  const totalRecords = allRecords.length;
  const averageAttendance = totalRecords > 0 
    ? ((presentCount / totalRecords) * 100).toFixed(1) 
    : '0';

  const handleTakeAttendance = () => {
    if (!selectedDate) {
      alert('Please select a date first');
      return;
    }

    // Format date as YYYY-MM-DD
    const dateStr = selectedDate;
    
    // Check if attendance for this date exists
    const dateExists = attendance.some(a => a.date === dateStr);
    
    if (!dateExists) {
      createAttendanceForDate(dateStr);
    }
    
    // Navigate to attendance page with date filter
    navigate(`/dashboard/attendance?date=${dateStr}`);
  };

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">President Dashboard</h1>
        <button
          onClick={exportToExcel}
          className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors shadow-md hover:shadow-lg flex items-center gap-2"
        >
          <span>📥</span>
          Export to Excel
        </button>
      </div>

      {/* Date Selection Card */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Record Attendance</h2>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="flex-1">
            <label htmlFor="attendance-date" className="block text-sm font-medium text-gray-700 mb-2">
              Select Date (Day, Month, Year)
            </label>
            <input
              id="attendance-date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={today}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>
          <button
            onClick={handleTakeAttendance}
            disabled={!selectedDate}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap"
          >
            Take Attendance
          </button>
        </div>
        {selectedDate && (
          <p className="mt-3 text-sm text-gray-600">
            Selected: <span className="font-medium">{new Date(selectedDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}</span>
          </p>
        )}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Members</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalMembers}</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Rehearsals</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalRehearsals}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📅</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Attendance</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{averageAttendance}%</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
