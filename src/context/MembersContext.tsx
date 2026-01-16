import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Member } from '../types';
import { mockMembers } from '../data/mockData';

interface MembersContextType {
  members: Member[];
  customColumns: string[];
  updateMember: (id: string, field: string, value: string) => void;
  addMember: () => void;
  deleteMember: (id: string) => void;
  addCustomColumn: (columnName: string) => void;
  deleteCustomColumn: (columnName: string) => void;
  importMembersFromExcel: (file: File, replaceAll: boolean) => Promise<{ success: boolean; message: string; imported: number }>;
}

const MembersContext = createContext<MembersContextType | undefined>(undefined);

export const MembersProvider = ({ children }: { children: ReactNode }) => {
  const [members, setMembers] = useState<Member[]>(() => {
    const stored = localStorage.getItem('members');
    return stored ? JSON.parse(stored) : mockMembers;
  });

  const [customColumns, setCustomColumns] = useState<string[]>(() => {
    const stored = localStorage.getItem('customColumns');
    return stored ? JSON.parse(stored) : [];
  });

  // Save to localStorage whenever members or customColumns change
  useEffect(() => {
    localStorage.setItem('members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('customColumns', JSON.stringify(customColumns));
  }, [customColumns]);

  const updateMember = (id: string, field: string, value: string) => {
    setMembers((prev) =>
      prev.map((member) =>
        member.id === id ? { ...member, [field]: value } : member
      )
    );
  };

  const addMember = () => {
    const newMember: Member = {
      id: `member-${Date.now()}`,
      name: 'New Member',
      email: 'newmember@example.com',
      joinDate: new Date().toISOString().split('T')[0],
    };
    
    // Initialize custom columns with empty values
    customColumns.forEach((col) => {
      newMember[col] = '';
    });

    setMembers((prev) => [...prev, newMember]);
  };

  const deleteMember = (id: string) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      setMembers((prev) => prev.filter((member) => member.id !== id));
    }
  };

  const addCustomColumn = (columnName: string) => {
    if (!columnName.trim()) return;
    
    const normalizedName = columnName.trim();
    if (customColumns.includes(normalizedName)) {
      alert('Column already exists');
      return;
    }

    setCustomColumns((prev) => [...prev, normalizedName]);
    
    // Initialize the new column for all existing members
    setMembers((prev) =>
      prev.map((member) => ({
        ...member,
        [normalizedName]: '',
      }))
    );
  };

  const deleteCustomColumn = (columnName: string) => {
    if (window.confirm(`Are you sure you want to delete the "${columnName}" column? This will remove the data for all members.`)) {
      setCustomColumns((prev) => prev.filter((col) => col !== columnName));
      
      // Remove the column data from all members
      setMembers((prev) =>
        prev.map((member) => {
          const { [columnName]: removed, ...rest } = member;
          return rest as Member;
        })
      );
    }
  };

  const importMembersFromExcel = async (
    file: File,
    replaceAll: boolean
  ): Promise<{ success: boolean; message: string; imported: number }> => {
    try {
      const XLSX = await import('xlsx');
      
      // Read the file
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      // Get the first sheet
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Convert to JSON
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
      
      if (data.length < 2) {
        return {
          success: false,
          message: 'Excel file must have at least a header row and one data row.',
          imported: 0,
        };
      }

      // Check if first row is a title (doesn't contain typical header keywords)
      let headerRowIndex = 0;
      const firstRow = data[0].map((h: any) => {
        if (h === null || h === undefined || h === '') return '';
        return String(h).trim().toLowerCase();
      });
      
      const hasHeaderKeywords = firstRow.some((cell: string) => 
        cell && (
          cell.includes('name') || 
          cell.includes('email') || 
          cell.includes('date') || 
          cell.includes('phone') ||
          cell.includes('join') ||
          cell === 'id' ||
          cell === 's.no' ||
          cell === 'serial'
        )
      );
      
      // If first row doesn't have header keywords and looks like a title (contains words like 'report', 'year', etc.)
      const looksLikeTitle = firstRow.some((cell: string) => 
        cell && (
          cell.includes('report') || 
          cell.includes('year') || 
          cell.includes('attendance') ||
          cell.includes('choir') ||
          cell.includes('member') && !cell.includes('name')
        )
      );
      
      if (!hasHeaderKeywords && looksLikeTitle && data.length > 2) {
        headerRowIndex = 1; // Skip to second row for headers
      }

      // Ensure we have enough rows after determining header row
      if (data.length <= headerRowIndex + 1) {
        return {
          success: false,
          message: 'Excel file must have at least a header row and one data row.',
          imported: 0,
        };
      }

      // First row is headers - handle undefined/null values and preserve original for display
      const headersRaw = data[headerRowIndex].map((h: any) => {
        if (h === null || h === undefined || h === '') return '';
        return String(h).trim();
      });
      
      const headers = headersRaw.map((h: string) => h.toLowerCase());
      
      // Debug: log headers to help diagnose issues
      console.log('Detected headers:', headersRaw);
      console.log('Normalized headers:', headers);
      
      // Use the first column as the name (use data as is)
      const nameIndex = 0;

      // Process data rows
      const importedMembers: Member[] = [];
      const newCustomColumns: string[] = [];
      
      // Identify custom columns (all columns except the name column)
      // Use original header names (headersRaw) for display
      headers.forEach((header: string, index: number) => {
        if (
          index !== nameIndex &&
          header &&
          header !== '' &&
          !['id', 'member id', 's.no', 'sno', 'serial', 'serial number', 'no', 's.no.'].includes(header) &&
          !header.includes('date 14') && // Skip specific date columns (attendance columns)
          !header.match(/^date\s+\d{1,2}[.\/]\d{1,2}[.\/]\d{2,4}/i) // Skip date columns in format "Date DD.MM.YYYY"
        ) {
          // Use original header name (preserve capitalization)
          const originalHeader = headersRaw[index].trim();
          if (originalHeader && !customColumns.includes(originalHeader) && !newCustomColumns.includes(originalHeader)) {
            newCustomColumns.push(originalHeader);
          }
        }
      });

      // Process each data row
      for (let i = headerRowIndex + 1; i < data.length; i++) {
        const row = data[i];
        if (!row || row.length === 0) continue;

        // Safely get name value
        const nameValue = nameIndex !== -1 && row[nameIndex] !== undefined && row[nameIndex] !== null 
          ? row[nameIndex] 
          : '';
        const name = String(nameValue).trim();
        if (!name || name === 'undefined' || name === 'null') continue; // Skip rows without names

        // Use data as is - no mapping for email or joinDate
        const email = '';
        const joinDate = '';

        const member: Member = {
          id: `member-${Date.now()}-${i}`,
          name,
          email,
          joinDate,
        };

        // Add custom column values
        // Use original header names for member properties
        headersRaw.forEach((originalHeader: string, index: number) => {
          const header = headers[index]; // lowercase for matching
          if (
            index !== nameIndex &&
            header &&
            header !== '' &&
            originalHeader &&
            originalHeader !== '' &&
            !['id', 'member id', 's.no', 'sno', 'serial', 'serial number', 'no', 's.no.'].includes(header) &&
            !header.includes('date 14') && // Skip specific date columns (attendance columns)
            !header.match(/^date\s+\d{1,2}[.\/]\d{1,2}[.\/]\d{2,4}/i) // Skip date columns in format "Date DD.MM.YYYY"
          ) {
            const columnName = originalHeader.trim();
            if (columnName) {
              const cellValue = row[index];
              member[columnName] = cellValue !== undefined && cellValue !== null 
                ? String(cellValue).trim() 
                : '';
            }
          }
        });

        // Initialize any existing custom columns that weren't in the Excel
        customColumns.forEach((col) => {
          if (!(col in member)) {
            member[col] = '';
          }
        });

        importedMembers.push(member);
      }

      if (importedMembers.length === 0) {
        return {
          success: false,
          message: 'No valid member data found in the Excel file.',
          imported: 0,
        };
      }

      // Add new custom columns
      if (newCustomColumns.length > 0) {
        setCustomColumns((prev) => [...prev, ...newCustomColumns]);
      }

      // Replace or merge members
      if (replaceAll) {
        setMembers(importedMembers);
      } else {
        // Merge: add new members, update existing ones by email if match
        setMembers((prev) => {
          const existingEmails = new Set(prev.map((m) => m.email.toLowerCase()));
          const newMembers = importedMembers.filter(
            (m) => !existingEmails.has(m.email.toLowerCase())
          );
          return [...prev, ...newMembers];
        });
      }

      return {
        success: true,
        message: `Successfully imported ${importedMembers.length} member(s).`,
        imported: importedMembers.length,
      };
    } catch (error) {
      console.error('Error importing Excel file:', error);
      return {
        success: false,
        message: `Error importing file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        imported: 0,
      };
    }
  };

  return (
    <MembersContext.Provider
      value={{
        members,
        customColumns,
        updateMember,
        addMember,
        deleteMember,
        addCustomColumn,
        deleteCustomColumn,
        importMembersFromExcel,
      }}
    >
      {children}
    </MembersContext.Provider>
  );
};

export const useMembers = () => {
  const context = useContext(MembersContext);
  if (context === undefined) {
    throw new Error('useMembers must be used within a MembersProvider');
  }
  return context;
};

