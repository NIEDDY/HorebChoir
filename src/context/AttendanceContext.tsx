import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { AttendanceByDate, AttendanceRecord, AttendanceStatus } from '../types';
import { mockAttendance, mockMembers } from '../data/mockData';

interface AttendanceContextType {
  attendance: AttendanceByDate[];
  updateAttendanceStatus: (recordId: string, date: string, newStatus: AttendanceStatus) => void;
  createAttendanceForDate: (date: string) => void;
  exportToExcel: () => void;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

export const AttendanceProvider = ({ children }: { children: ReactNode }) => {
  const [attendance, setAttendance] = useState<AttendanceByDate[]>(() => {
    const stored = localStorage.getItem('attendance');
    return stored ? JSON.parse(stored) : mockAttendance;
  });

  // Save to localStorage whenever attendance changes
  useEffect(() => {
    localStorage.setItem('attendance', JSON.stringify(attendance));
  }, [attendance]);

  const updateAttendanceStatus = (recordId: string, date: string, newStatus: AttendanceStatus) => {
    setAttendance((prev) =>
      prev.map((attendanceByDate) => {
        if (attendanceByDate.date === date) {
          return {
            ...attendanceByDate,
            records: attendanceByDate.records.map((record) =>
              record.id === recordId ? { ...record, status: newStatus } : record
            ),
          };
        }
        return attendanceByDate;
      })
    );
  };

  const createAttendanceForDate = (date: string) => {
    // Check if attendance for this date already exists
    const dateExists = attendance.some(a => a.date === date);
    if (dateExists) {
      return; // Don't create duplicate
    }

    // Get members from localStorage (synced with MembersContext)
    const storedMembers = localStorage.getItem('members');
    const currentMembers = storedMembers ? JSON.parse(storedMembers) : mockMembers;

    // Create new attendance records for all members
    const newRecords: AttendanceRecord[] = currentMembers.map((member: any, index: number) => ({
      id: `${date}-${member.id}-${Date.now()}-${index}`,
      memberId: member.id,
      memberName: member.name,
      date: date,
      status: 'present' as AttendanceStatus, // Default to present
    }));

    const newAttendance: AttendanceByDate = {
      date: date,
      records: newRecords,
    };

    setAttendance((prev) => [newAttendance, ...prev].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ));
  };

  const exportToExcel = async () => {
    try {
      // Dynamic import of xlsx to avoid bundling issues
      const XLSX = await import('xlsx');
      
      // Prepare data for Excel
      const rows: any[] = [];
      
      // Header row
      rows.push(['Date', 'Member Name', 'Status']);
      
      // Data rows - sort by date descending
      const sortedAttendance = [...attendance].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      sortedAttendance.forEach((attendanceByDate) => {
        attendanceByDate.records.forEach((record) => {
          const date = new Date(attendanceByDate.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
          rows.push([date, record.memberName, 
            record.status === 'present' ? 'Present' : 
            record.status === 'absent' ? 'Absent' : 
            'Permission']);
        });
      });

      // Create workbook and worksheet
      const worksheet = XLSX.utils.aoa_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');

      // Set column widths
      worksheet['!cols'] = [
        { wch: 20 }, // Date
        { wch: 25 }, // Member Name
        { wch: 10 },  // Status
      ];

      // Generate Excel file and download
      const fileName = `Horeb_Choir_Attendance_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Failed to export to Excel. Please make sure the xlsx package is installed.');
    }
  };

  return (
    <AttendanceContext.Provider value={{ attendance, updateAttendanceStatus, createAttendanceForDate, exportToExcel }}>
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (context === undefined) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
};

