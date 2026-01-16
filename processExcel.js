import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the Excel file
const workbook = XLSX.readFile(path.join(__dirname, 'src', 'assets', 'Horeb attendance 2025 to 2026 (1).xlsx'));
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Convert to JSON
const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

// Skip title row if it exists
let headerRowIndex = 0;
if (data.length > 0 && data[0].some(cell => cell && cell.toString().toLowerCase().includes('report'))) {
  headerRowIndex = 1;
}

if (data.length <= headerRowIndex) {
  console.error('No data found');
  process.exit(1);
}

const headersRaw = data[headerRowIndex].map(h => h ? h.toString().trim() : '');
const headers = headersRaw.map(h => h.toLowerCase());

// Use second column as name (skip serial number)
const nameIndex = 1;

// Process members
const members = [];
for (let i = headerRowIndex + 1; i < data.length; i++) {
  const row = data[i];
  if (!row || row.length === 0) continue;

  const name = row[nameIndex] ? row[nameIndex].toString().trim() : '';
  if (!name || name.startsWith('NB:') || name === 'Full Names' || name.includes(':') || /^\d+\./.test(name)) continue; // Skip header and footer

  const member = {
    id: `member-${i}`,
    name,
    email: '',
    joinDate: '',
  };

  // Add custom fields
  headersRaw.forEach((header, index) => {
    if (index !== nameIndex && header && header !== '') {
      const value = row[index] !== undefined && row[index] !== null ? row[index].toString().trim() : '';
      member[header] = value;
    }
  });

  members.push(member);
}

console.log('export const mockMembers =', JSON.stringify(members, null, 2), ';');
console.log('export const mockAttendance = [];');
console.log('export const mockUsers = [');
console.log('  { id: \'1\', name: \'John President\', email: \'president@choir.com\', role: \'president\' },');
console.log('  { id: \'2\', name: \'Jane Secretary\', email: \'secretary@choir.com\', role: \'secretary\' },');
console.log('];');