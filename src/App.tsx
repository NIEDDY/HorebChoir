import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AttendanceProvider } from './context/AttendanceContext';
import { MembersProvider } from './context/MembersContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import DashboardLayout from './components/DashboardLayout';
import PresidentDashboard from './pages/PresidentDashboard';
import SecretaryDashboard from './pages/SecretaryDashboard';
import Attendance from './pages/Attendance';
import Members from './pages/Members';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  return <>{children}</>;
};

const DashboardRedirect = () => {
  const { user } = useAuth();
  if (user?.role === 'president') {
    return <Navigate to="/dashboard/president" replace />;
  }
  return <Navigate to="/dashboard/secretary" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<DashboardRedirect />} />
        <Route path="president" element={<PresidentDashboard />} />
        <Route path="secretary" element={<SecretaryDashboard />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="members" element={<Members />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AttendanceProvider>
        <MembersProvider>
          <Router>
            <AppRoutes />
          </Router>
        </MembersProvider>
      </AttendanceProvider>
    </AuthProvider>
  );
}

export default App;

