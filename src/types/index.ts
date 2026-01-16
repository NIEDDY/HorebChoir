export type UserRole = 'president' | 'secretary';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  joinDate: string;
  [key: string]: string | number; // Allow custom fields
}

export type AttendanceStatus = 'present' | 'absent';

export interface AttendanceRecord {
  id: string;
  memberId: string;
  memberName: string;
  date: string;
  status: AttendanceStatus;
}

export interface AttendanceByDate {
  date: string;
  records: AttendanceRecord[];
}

