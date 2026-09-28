import Alert from '../../components/common/Alert.jsx';
import PageHeader from '../../components/common/PageHeader.jsx';
import ModuleGrid from '../../components/dashboard/ModuleGrid.jsx';
import { navigationItems, teacherNavigation } from '../../config/navigation.js';
import { useAuth } from '../../hooks/useAuth.js';

const modules = navigationItems(teacherNavigation).filter((item) => item.to !== '/teacher');

export default function TeacherDashboard() {
  const { user } = useAuth();

  return (
    <>
      <PageHeader title={`Welcome, ${user.firstName}`} description="Here is an overview of your teaching workspace." />

      <div className="mb-6">
        <Alert>
          Your classes, students, schedule, average scores and estimated salary will appear here once the
          teacher modules are built in phases 4 and 5.
        </Alert>
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">Modules</h2>
      <ModuleGrid items={modules} />
    </>
  );
}
