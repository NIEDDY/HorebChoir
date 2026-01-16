import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAttendance } from '../context/AttendanceContext';
import { useMembers } from '../context/MembersContext';
import { AttendanceStatus } from '../types';

export default function Attendance() {
  const { attendance, updateAttendanceStatus, exportToExcel, createAttendanceForDate } = useAttendance();
  const { members } = useMembers();
  const [searchParams, setSearchParams] = useSearchParams();
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [newDate, setNewDate] = useState<string>('');

  // Get date from URL params if present
  useEffect(() => {
    const dateParam = searchParams.get('date');
    if (dateParam) {
      setSelectedDate(dateParam);
      // Auto-expand the date if it exists
      if (attendance.some(a => a.date === dateParam)) {
        setExpandedDates(new Set([dateParam]));
      }
    }
  }, [searchParams, attendance]);

  const toggleDate = (date: string) => {
    const newExpanded = new Set(expandedDates);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedDates(newExpanded);
  };

  const handleStatusChange = (recordId: string, date: string, newStatus: AttendanceStatus) => {
    updateAttendanceStatus(recordId, date, newStatus);
  };

  const handleCreateNewAttendance = () => {
    if (!newDate) {
      alert('Please select a date first');
      return;
    }

    // Check if attendance for this date already exists
    const dateExists = attendance.some(a => a.date === newDate);
    if (dateExists) {
      alert('Attendance for this date already exists. Please use the existing record.');
      setSelectedDate(newDate);
      setExpandedDates(new Set([newDate]));
      return;
    }

    createAttendanceForDate(newDate);
    setSelectedDate(newDate);
    setExpandedDates(new Set([newDate]));
    setNewDate('');
    setSearchParams({ date: newDate });
  };

  // Filter attendance
  let filteredAttendance = attendance;
  if (selectedDate) {
    filteredAttendance = filteredAttendance.filter(a => a.date === selectedDate);
  }

  // Filter by member (if expanded)
  const getFilteredRecords = (records: typeof attendance[0]['records']) => {
    if (!selectedMember) return records;
    return records.filter(r => r.memberId === selectedMember);
  };

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Attendance Records</h1>
        <button
          onClick={exportToExcel}
          className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors shadow-md hover:shadow-lg flex items-center gap-2"
        >
          <span>📥</span>
          Export to Excel
        </button>
      </div>

      {/* Create New Attendance Card */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Attendance Record</h2>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
          <div className="flex-1">
            <label htmlFor="new-date" className="block text-sm font-medium text-gray-700 mb-2">
              Select Date (Day, Month, Year)
            </label>
            <input
              id="new-date"
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              max={today}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>
          <button
            onClick={handleCreateNewAttendance}
            disabled={!newDate}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap"
          >
            Create Attendance
          </button>
        </div>
        {newDate && (
          <p className="mt-3 text-sm text-gray-600">
            Selected: <span className="font-medium">{new Date(newDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}</span>
          </p>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="date-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Date
            </label>
            <select
              id="date-filter"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                if (e.target.value) {
                  setSearchParams({ date: e.target.value });
                } else {
                  setSearchParams({});
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            >
              <option value="">All Dates</option>
              {attendance.map((a) => (
                <option key={a.date} value={a.date}>
                  {new Date(a.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="member-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Member
            </label>
            <select
              id="member-filter"
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            >
              <option value="">All Members</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Attendance List */}
      <div className="space-y-4">
        {filteredAttendance.map((attendanceByDate) => {
          const date = new Date(attendanceByDate.date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
          const isExpanded = expandedDates.has(attendanceByDate.date);
          const filteredRecords = getFilteredRecords(attendanceByDate.records);
          const presentCount = filteredRecords.filter(r => r.status === 'present').length;
          const totalCount = filteredRecords.length;

          return (
            <div
              key={attendanceByDate.date}
              className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden"
            >
              <button
                onClick={() => toggleDate(attendanceByDate.date)}
                className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">
                    {isExpanded ? '▼' : '▶'}
                  </span>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">{date}</h3>
                    <p className="text-sm text-gray-600">
                      {presentCount} of {totalCount} members present
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                    {totalCount > 0 ? ((presentCount / totalCount) * 100).toFixed(0) : 0}%
                  </span>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-gray-200 px-6 py-4">
                  <div className="space-y-2">
                    {filteredRecords.map((record) => (
                      <div
                        key={record.id}
                        className="flex justify-between items-center py-2 px-3 rounded-lg hover:bg-gray-50"
                      >
                        <span className="font-medium text-gray-900">{record.memberName}</span>
                        <select
                          value={record.status}
                          onChange={(e) => handleStatusChange(record.id, attendanceByDate.date, e.target.value as AttendanceStatus)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-colors ${
                            record.status === 'present'
                              ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                              : 'bg-red-100 text-red-700 border-red-300'
                          }`}
                        >
                          <option value="present">Present</option>
                          <option value="absent">Absent</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredAttendance.length === 0 && (
        <div className="bg-white rounded-xl shadow-md p-12 border border-gray-100 text-center">
          <p className="text-gray-500 text-lg">No attendance records found</p>
          {selectedDate && (
            <p className="text-gray-400 text-sm mt-2">
              Try creating a new attendance record using the form above
            </p>
          )}
        </div>
      )}
    </div>
  );
}
