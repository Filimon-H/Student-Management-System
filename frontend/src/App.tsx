import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Teachers from './pages/Teachers';
import Classes from './pages/Classes';
import Subjects from './pages/Subjects';
import AttendancePage from './pages/AttendanceNew';
import Grades from './pages/Grades';
import Terms from './pages/Terms';
import Enrollments from './pages/Enrollments';
import Assignments from './pages/Assignments';
import SmartGrades from './pages/SmartGrades';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/students" element={<Students />} />
            <Route path="/teachers" element={<Teachers />} />
            <Route path="/classes" element={<Classes />} />
            <Route path="/subjects" element={<Subjects />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/grades" element={<Grades />} />
            <Route path="/smart-grades" element={<SmartGrades />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/enrollments" element={<Enrollments />} />
            <Route path="/assignments" element={<Assignments />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
