import { Suspense, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { LoadingState } from '../common/States.jsx';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';

export default function DashboardLayout({
  navigation,
  portalName,
  navBadges,
  topbarLeading,
  topbarTrailing,
  avatarUrl,
  profilePath,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!sidebarOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setSidebarOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen">
      <Sidebar
        navigation={navigation}
        portalName={portalName}
        badges={navBadges}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="lg:pl-64">
        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
          leading={topbarLeading}
          trailing={topbarTrailing}
          avatarUrl={avatarUrl}
          profilePath={profilePath}
        />
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {/* Pages are lazy-loaded; keep the layout on screen while one downloads. */}
          <Suspense fallback={<LoadingState label="Loading…" />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
