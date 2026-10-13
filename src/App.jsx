// ============================================
// App — Master Router Configuration
// All 20+ routes mapped to backend API contract
// ============================================

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './components/Toast'
import { ProtectedRoute, PublicOnlyRoute } from './components/ProtectedRoute'
import { PublicLayout, StudentLayout, AdminLayout } from './components/Layout'

// Public Pages
import Home from './pages/public/Home'
import Courses from './pages/public/Courses'
import CourseDetail from './pages/public/CourseDetail'
import Packages from './pages/public/Packages'

// Auth Pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

// Student Pages
import StudentDashboard from './pages/student/Dashboard'
import StudentLiveClasses from './pages/student/LiveClasses'
import Classroom from './pages/student/Classroom'
import StudentRecordings from './pages/student/Recordings'
import StudentEnrollments from './pages/student/Enrollments'
import StudentProfile from './pages/student/Profile'

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminCourses from './pages/admin/Courses'
import AdminPackages from './pages/admin/Packages'
import AdminEnrollments from './pages/admin/Enrollments'
import AdminStudents from './pages/admin/Students'
import AdminLiveClasses from './pages/admin/LiveClasses'
import AdminRecordings from './pages/admin/Recordings'
import AdminProfile from './pages/admin/Profile'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider />
        <Routes>
          {/* ---- Public Routes ---- */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:slug" element={<CourseDetail />} />
            <Route path="/packages" element={<Packages />} />
          </Route>

          {/* ---- Auth Routes ---- */}
          <Route element={<PublicLayout />}>
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <Login />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicOnlyRoute>
                  <Register />
                </PublicOnlyRoute>
              }
            />
          </Route>

          {/* ---- Fullscreen Classroom (Admin & Student) ---- */}
          <Route
            path="/admin/live/:id"
            element={
              <ProtectedRoute requireAdmin>
                <Classroom />
              </ProtectedRoute>
            }
          />
          <Route
            path="/portal/live/:id"
            element={
              <ProtectedRoute>
                <Classroom />
              </ProtectedRoute>
            }
          />

          {/* ---- Student Portal ---- */}
          <Route
            element={
              <ProtectedRoute>
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/portal/dashboard" element={<StudentDashboard />} />
            <Route path="/portal/live-classes" element={<StudentLiveClasses />} />
            <Route path="/portal/recordings" element={<StudentRecordings />} />
            <Route path="/portal/enrollments" element={<StudentEnrollments />} />
            <Route path="/portal/profile" element={<StudentProfile />} />
          </Route>

          {/* ---- Admin Panel ---- */}
          <Route
            element={
              <ProtectedRoute requireAdmin>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/courses" element={<AdminCourses />} />
            <Route path="/admin/packages" element={<AdminPackages />} />
            <Route path="/admin/enrollments" element={<AdminEnrollments />} />
            <Route path="/admin/students" element={<AdminStudents />} />
            <Route path="/admin/live-classes" element={<AdminLiveClasses />} />
            <Route path="/admin/recordings" element={<AdminRecordings />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
          </Route>

          {/* ---- Fallback ---- */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}