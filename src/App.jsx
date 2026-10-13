// ============================================
// App — Master Router Configuration
// All 20+ routes mapped to backend API contract
// ============================================

import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './components/Toast'
import { ProtectedRoute, PublicOnlyRoute } from './components/ProtectedRoute'
import { PublicLayout, StudentLayout, AdminLayout } from './components/Layout'
import LoadingSpinner from './components/LoadingSpinner'

// Instant Home Page
import Home from './pages/public/Home'

// Lazy-loaded Public Pages
const Courses = lazy(() => import('./pages/public/Courses'))
const CourseDetail = lazy(() => import('./pages/public/CourseDetail'))
const Packages = lazy(() => import('./pages/public/Packages'))

// Lazy-loaded Auth Pages
const Login = lazy(() => import('./pages/auth/Login'))
const Register = lazy(() => import('./pages/auth/Register'))

// Lazy-loaded Student Pages
const StudentDashboard = lazy(() => import('./pages/student/Dashboard'))
const StudentLiveClasses = lazy(() => import('./pages/student/LiveClasses'))
const Classroom = lazy(() => import('./pages/student/Classroom'))
const StudentRecordings = lazy(() => import('./pages/student/Recordings'))
const StudentEnrollments = lazy(() => import('./pages/student/Enrollments'))
const StudentProfile = lazy(() => import('./pages/student/Profile'))

// Lazy-loaded Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'))
const AdminCourses = lazy(() => import('./pages/admin/Courses'))
const AdminPackages = lazy(() => import('./pages/admin/Packages'))
const AdminEnrollments = lazy(() => import('./pages/admin/Enrollments'))
const AdminStudents = lazy(() => import('./pages/admin/Students'))
const AdminLiveClasses = lazy(() => import('./pages/admin/LiveClasses'))
const AdminRecordings = lazy(() => import('./pages/admin/Recordings'))
const AdminProfile = lazy(() => import('./pages/admin/Profile'))

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider />
        <Suspense fallback={<LoadingSpinner />}>
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
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}