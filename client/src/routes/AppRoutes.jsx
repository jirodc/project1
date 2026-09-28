import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { adminNavigation, navigationItems, teacherNavigation } from '../config/navigation.js';
import { useAuth } from '../hooks/useAuth.js';
import AdminLayout from '../layouts/AdminLayout.jsx';
import StudentLayout from '../layouts/StudentLayout.jsx';
import TeacherLayout from '../layouts/TeacherLayout.jsx';
import Login from '../pages/auth/Login.jsx';
import NotFound from '../pages/shared/NotFound.jsx';
import { homePathFor, ROLES } from '../utils/roles.js';
import { GuestRoute, ProtectedRoute } from './ProtectedRoute.jsx';

// Pages load on first visit, so each portal only downloads its own code.
const Announcements = lazy(() => import('../pages/admin/Announcements.jsx'));
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard.jsx'));
const ComingSoon = lazy(() => import('../pages/shared/ComingSoon.jsx'));
const Profile = lazy(() => import('../pages/shared/Profile.jsx'));
const AnnouncementDetail = lazy(() => import('../pages/student/AnnouncementDetail.jsx'));
const StudentAnnouncements = lazy(() => import('../pages/student/Announcements.jsx'));
const StudentAttendance = lazy(() => import('../pages/student/Attendance.jsx'));
const StudentDashboard = lazy(() => import('../pages/student/Dashboard.jsx'));
const StudentDocuments = lazy(() => import('../pages/student/Documents.jsx'));
const StudentFinance = lazy(() => import('../pages/student/Finance.jsx'));
const StudentGrades = lazy(() => import('../pages/student/Grades.jsx'));
const StudentNotifications = lazy(() => import('../pages/student/Notifications.jsx'));
const StudentProfile = lazy(() => import('../pages/student/Profile.jsx'));
const StudentSchedule = lazy(() => import('../pages/student/Schedule.jsx'));
const SubjectDetail = lazy(() => import('../pages/student/SubjectDetail.jsx'));
const StudentSubjects = lazy(() => import('../pages/student/Subjects.jsx'));
const TeacherAnnouncements = lazy(() => import('../pages/teacher/Announcements.jsx'));
const TeacherDashboard = lazy(() => import('../pages/teacher/Dashboard.jsx'));

/** Placeholder routes for sidebar modules that have not been built yet. */
const plannedRoutes = (sections) =>
  navigationItems(sections)
    .filter((item) => item.phase)
    .map(({ to, label, phase }) => (
      <Route key={to} path={to} element={<ComingSoon title={label} phase={phase} />} />
    ));

function HomeRedirect() {
  const { user } = useAuth();
  return <Navigate to={homePathFor(user.role)} replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomeRedirect />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={[ROLES.ADMIN]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="announcements" element={<Announcements />} />
        {plannedRoutes(adminNavigation)}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>

      <Route
        path="/teacher"
        element={
          <ProtectedRoute roles={[ROLES.TEACHER]}>
            <TeacherLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<TeacherDashboard />} />
        <Route path="announcements" element={<TeacherAnnouncements />} />
        <Route path="profile" element={<Profile />} />
        {plannedRoutes(teacherNavigation)}
        <Route path="*" element={<Navigate to="/teacher" replace />} />
      </Route>

      <Route
        path="/student"
        element={
          <ProtectedRoute roles={[ROLES.STUDENT]}>
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentDashboard />} />
        <Route path="attendance" element={<StudentAttendance />} />
        <Route path="grades" element={<StudentGrades />} />
        <Route path="subjects" element={<StudentSubjects />} />
        <Route path="subjects/:code" element={<SubjectDetail />} />
        <Route path="schedule" element={<StudentSchedule />} />
        <Route path="announcements" element={<StudentAnnouncements />} />
        <Route path="announcements/:id" element={<AnnouncementDetail />} />
        <Route path="finance" element={<StudentFinance />} />
        <Route path="documents" element={<StudentDocuments />} />
        <Route path="notifications" element={<StudentNotifications />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="*" element={<Navigate to="/student" replace />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
