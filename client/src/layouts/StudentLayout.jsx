import { useSyncExternalStore } from 'react';
import DashboardLayout from '../components/navigation/DashboardLayout.jsx';
import GlobalSearch from '../components/student/GlobalSearch.jsx';
import NotificationBell from '../components/student/NotificationBell.jsx';
import { studentNavigation } from '../config/navigation.js';
import { studentStore } from '../mocks/student/store.js';

const selectUnread = () => studentStore.getState().notifications.filter((n) => !n.read).length;
const selectPhoto = () => studentStore.getState().photo;

export default function StudentLayout() {
  const unread = useSyncExternalStore(studentStore.subscribe, selectUnread);
  const photo = useSyncExternalStore(studentStore.subscribe, selectPhoto);

  return (
    <DashboardLayout
      navigation={studentNavigation}
      portalName="Student Portal"
      navBadges={{ '/student/notifications': unread }}
      topbarLeading={<GlobalSearch />}
      topbarTrailing={<NotificationBell />}
      avatarUrl={photo}
      profilePath="/student/profile"
    />
  );
}
