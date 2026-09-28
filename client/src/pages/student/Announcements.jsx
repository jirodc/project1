import { Megaphone, Paperclip } from 'lucide-react';
import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import { EmptyState, QueryState } from '../../components/common/States.jsx';
import Tabs from '../../components/common/Tabs.jsx';
import StatusBadge, { ImportantBadge } from '../../components/student/StatusBadges.jsx';
import { usePagination } from '../../hooks/usePagination.js';
import { useStudentData } from '../../hooks/useStudentData.js';
import { getAnnouncements } from '../../services/student.service.js';
import { formatDate } from '../../utils/format.js';

const PAGE_SIZE = 6;

const FILTERS = [
  { value: 'all', label: 'All', match: () => true },
  { value: 'academic', label: 'Academic', match: (a) => a.category === 'Academic' },
  { value: 'finance', label: 'Finance', match: (a) => a.category === 'Finance' },
  { value: 'events', label: 'Events', match: (a) => a.category === 'Events' },
  { value: 'important', label: 'Important', match: (a) => a.priority === 'high' },
];

export default function StudentAnnouncements() {
  const query = useStudentData(getAnnouncements);

  return (
    <>
      <PageHeader title="Announcements" description="News and reminders from the university, your college, and your instructors." />
      <QueryState query={query} loadingLabel="Loading announcements…">
        {(announcements) => <AnnouncementList announcements={announcements} />}
      </QueryState>
    </>
  );
}

function AnnouncementList({ announcements }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const filterValue = FILTERS.some((f) => f.value === searchParams.get('filter')) ? searchParams.get('filter') : 'all';
  const filter = FILTERS.find((f) => f.value === filterValue);

  const filtered = useMemo(() => announcements.filter(filter.match), [announcements, filter]);
  const { pageItems, pagination, setPage } = usePagination(filtered, PAGE_SIZE);

  const changeFilter = (value) => {
    setSearchParams(value === 'all' ? {} : { filter: value }, { replace: true });
    setPage(1);
  };

  return (
    <>
      <Tabs
        label="Filter announcements"
        value={filterValue}
        onChange={changeFilter}
        tabs={FILTERS.map((f) => ({ value: f.value, label: f.label, count: announcements.filter(f.match).length }))}
        className="mb-5 w-fit"
      />

      {filtered.length === 0 ? (
        <EmptyState icon={Megaphone} title="No announcements here" description="There are no announcements in this category yet." />
      ) : (
        <>
          <ul className="grid gap-4 md:grid-cols-2">
            {pageItems.map((announcement) => (
              <li key={announcement.id}>
                <Link
                  to={announcement.id}
                  className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-indigo-300 hover:shadow-sm"
                >
                  <span className="flex flex-wrap items-center gap-2">
                    <StatusBadge kind="category" status={announcement.category} />
                    {announcement.priority === 'high' && <ImportantBadge />}
                  </span>
                  <span className="mt-3 block text-base font-semibold text-slate-900">{announcement.title}</span>
                  <span className="mt-1 block line-clamp-3 flex-1 text-sm text-slate-600">{announcement.summary}</span>
                  <span className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
                    <span>
                      <span className="font-medium text-slate-700">{announcement.postedBy}</span> · {formatDate(announcement.postedAt)}
                    </span>
                    {announcement.attachment && (
                      <span className="inline-flex items-center gap-1">
                        <Paperclip className="size-3.5" aria-hidden="true" />
                        1 attachment
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <Pagination className="mt-5" pagination={pagination} itemCount={pageItems.length} onPageChange={setPage} />
        </>
      )}
    </>
  );
}
