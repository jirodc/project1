import Alert from '../../components/common/Alert.jsx';
import PageHeader from '../../components/common/PageHeader.jsx';
import ModuleGrid from '../../components/dashboard/ModuleGrid.jsx';
import { adminNavigation, navigationItems } from '../../config/navigation.js';
import { useAuth } from '../../hooks/useAuth.js';

const modules = navigationItems(adminNavigation).filter((item) => item.to !== '/admin');

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <>
      <PageHeader title="Admin Dashboard" description={`Welcome back, ${user.firstName}.`} />

      <div className="mb-6">
        <Alert>
          System statistics (users, teachers, students, classrooms and recent activity) will appear here
          once the management modules are built in phase 3.
        </Alert>
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">Modules</h2>
      <ModuleGrid items={modules} />
    </>
  );
}
