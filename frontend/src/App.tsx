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
import MyProfile from './pages/MyProfile';

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
            <Route path="/students" element={<ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}><Students /></ProtectedRoute>} />
            <Route path="/teachers" element={<ProtectedRoute allowedRoles={['ADMIN']}><Teachers /></ProtectedRoute>} />
            <Route path="/classes" element={<ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}><Classes /></ProtectedRoute>} />
            <Route path="/subjects" element={<ProtectedRoute allowedRoles={['ADMIN']}><Subjects /></ProtectedRoute>} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/grades" element={<Grades />} />
            <Route path="/smart-grades" element={<ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}><SmartGrades /></ProtectedRoute>} />
            <Route path="/terms" element={<ProtectedRoute allowedRoles={['ADMIN', 'TEACHER']}><Terms /></ProtectedRoute>} />
            <Route path="/enrollments" element={<ProtectedRoute allowedRoles={['ADMIN']}><Enrollments /></ProtectedRoute>} />
            <Route path="/assignments" element={<ProtectedRoute allowedRoles={['ADMIN']}><Assignments /></ProtectedRoute>} />
            <Route path="/my-profile" element={<ProtectedRoute allowedRoles={['STUDENT']}><MyProfile /></ProtectedRoute>} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
