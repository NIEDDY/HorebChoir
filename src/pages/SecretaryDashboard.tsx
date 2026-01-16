import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAttendance } from '../context/AttendanceContext';

export default function SecretaryDashboard() {
  const { attendance, exportToExcel, createAttendanceForDate } = useAttendance();
  const [selectedDate, setSelectedDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const navigate = useNavigate();
  const recentAttendance = attendance.slice(0, 3);

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
        <h1 className="text-3xl font-bold text-gray-900">Secretary Dashboard</h1>
        <div className="flex gap-3">
          <button
            onClick={exportToExcel}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <span>📥</span>
            Export to Excel
          </button>
        </div>
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

      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Attendance</h2>
        <div className="space-y-4">
          {recentAttendance.map((attendanceByDate) => {
            const presentCount = attendanceByDate.records.filter(r => r.status === 'present').length;
            const totalCount = attendanceByDate.records.length;
            const date = new Date(attendanceByDate.date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });

            return (
              <div
                key={attendanceByDate.date}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{date}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {presentCount} of {totalCount} members present
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                      {((presentCount / totalCount) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/dashboard/attendance"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-center"
          >
            <span className="text-2xl block mb-2">✓</span>
            <span className="font-medium text-gray-700">View All Attendance</span>
          </Link>
          <Link
            to="/dashboard/members"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-center"
          >
            <span className="text-2xl block mb-2">👥</span>
            <span className="font-medium text-gray-700">View Members</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
