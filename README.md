# Choir Attendance Management System

A modern, responsive frontend application for managing choir member attendance. Built with React, TypeScript, Tailwind CSS, and React Router.

## Features

- 🏠 **Landing Page** - Welcome page with choir information and call-to-action buttons
- 🔐 **Authentication** - Login and Signup pages with role selection (President/Secretary)
- 📊 **President Dashboard** - Overview cards showing total members, rehearsals, and average attendance
- ✍️ **Secretary Dashboard** - Focused on attendance management with quick actions
- ✅ **Attendance Page** - View, filter, and edit attendance records by date and member (Present/Absent dropdown)
- 📥 **Excel Export** - Download attendance records as Excel files (available in all dashboards)
- 👥 **Members Page** - View all choir members in a clean table layout
- 📱 **Fully Responsive** - Works seamlessly on mobile, tablet, and desktop

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Vite** - Build tool

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/       # Reusable components
│   └── DashboardLayout.tsx
├── context/          # React context providers
│   └── AuthContext.tsx
├── data/            # Mock data
│   └── mockData.ts
├── pages/           # Page components
│   ├── Home.tsx
│   ├── Login.tsx
│   ├── Signup.tsx
│   ├── PresidentDashboard.tsx
│   ├── SecretaryDashboard.tsx
│   ├── Attendance.tsx
│   └── Members.tsx
├── types/           # TypeScript type definitions
│   └── index.ts
├── App.tsx          # Main app component with routing
├── main.tsx         # Entry point
└── index.css        # Global styles
```

## User Roles

### President
- View overview statistics
- See attendance trends
- Edit attendance records
- Export attendance to Excel
- Access all features

### Secretary
- Focused attendance management
- Quick actions for recording attendance
- Edit attendance records
- Export attendance to Excel
- View recent attendance records

## Mock Data

The application uses mock data for demonstration purposes. All data is stored in `src/data/mockData.ts`. In a production environment, this would be replaced with API calls to a backend service.

## Authentication

Currently, authentication is handled client-side with mock login. Any email/password combination will work for demonstration. The role selected during login determines which dashboard is shown.

## Features Details

### Attendance Editing
Both President and Secretary can edit attendance records directly from the Attendance page. Each member's status can be changed using a dropdown menu (Present/Absent). Changes are saved to localStorage and persist across page refreshes.

### Excel Export
The export functionality generates a properly formatted Excel file (.xlsx) containing all attendance records with columns for Date, Member Name, and Status. The export button is available in:
- President Dashboard
- Secretary Dashboard  
- Attendance Page

## Notes

- This is a **frontend-only** application with no backend integration
- Attendance data is stored in localStorage and persists across page refreshes
- No actual validation or authentication logic is implemented
- Perfect for UI/UX demonstration and frontend development

## License

This project is open source and available for use.

