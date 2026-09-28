import { Navigate, Route, Routes } from 'react-router-dom';
import { adminNavigation, navigationItems, teacherNavigation } from '../config/navigation.js';
import { useAuth } from '../hooks/useAuth.js';
import AdminLayout from '../layouts/AdminLayout.jsx';
import TeacherLayout from '../layouts/TeacherLayout.jsx';
import Announcements from '../pages/admin/Announcements.jsx';
import AdminDashboard from '../pages/admin/Dashboard.jsx';
import Login from '../pages/auth/Login.jsx';
import ComingSoon from '../pages/shared/ComingSoon.jsx';
import NotFound from '../pages/shared/NotFound.jsx';
import Profile from '../pages/shared/Profile.jsx';
import TeacherDashboard from '../pages/teacher/Dashboard.jsx';
import { homePathFor, ROLES } from '../utils/roles.js';
import { GuestRoute, ProtectedRoute } from './ProtectedRoute.jsx';

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
        <Route path="profile" element={<Profile />} />
        {plannedRoutes(teacherNavigation)}
        <Route path="*" element={<Navigate to="/teacher" replace />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
