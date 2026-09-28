import { ArrowLeft, Download, FileText, MegaphoneOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link, useParams } from 'react-router-dom';
import Button from '../../components/common/Button.jsx';
import Card, { CardHeader, CardLink } from '../../components/common/Card.jsx';
import { EmptyState, ErrorState, LoadingState } from '../../components/common/States.jsx';
import StatusBadge, { ImportantBadge } from '../../components/student/StatusBadges.jsx';
import { useStudentData } from '../../hooks/useStudentData.js';
import { getAnnouncement, getAnnouncements, NotFoundError } from '../../services/student.service.js';
import { formatDateTime, formatRelativeTime } from '../../utils/format.js';
import { createTextPdf, downloadBlob, SAMPLE_FOOTER } from '../../utils/pdf.js';

export default function AnnouncementDetail() {
  const { id } = useParams();
  const query = useStudentData(
    () => ({
      announcement: getAnnouncement(id),
      more: getAnnouncements()
        .filter((item) => item.id !== id)
        .slice(0, 4),
    }),
    [id],
  );

  let content;
  if (query.error instanceof NotFoundError) {
    content = (
      <EmptyState
        icon={MegaphoneOff}
        title="Announcement not found"
        description={query.error.message}
        action={<CardLink to="/student/announcements">See all announcements</CardLink>}
      />
    );
  } else if (query.status === 'error') {
    content = <ErrorState message={query.error?.message} onRetry={query.reload} />;
  } else if (!query.data) {
    content = <LoadingState label="Loading announcement…" />;
  } else {
    content = <AnnouncementContent {...query.data} />;
  }

  return (
    <>
      <Link
        to="/student/announcements"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        All announcements
      </Link>
      {content}
    </>
  );
}

function AnnouncementContent({ announcement, more }) {
  const downloadAttachment = () => {
    const { attachment } = announcement;
    const [title, ...lines] = attachment.lines;
    downloadBlob(
      createTextPdf({ heading: announcement.postedBy.toUpperCase(), title, lines, footer: SAMPLE_FOOTER }),
      attachment.fileName,
    );
    toast.success(`Downloading ${attachment.fileName}`);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs sm:p-8 lg:col-span-2">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge kind="category" status={announcement.category} />
          {announcement.priority === 'high' && <ImportantBadge />}
        </div>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">{announcement.title}</h1>
        <p className="mt-2 text-sm text-slate-600">
          Posted by <span className="font-medium text-slate-800">{announcement.postedBy}</span> ·{' '}
          <time dateTime={announcement.postedAt}>{formatDateTime(announcement.postedAt)}</time>
        </p>

        <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-slate-800">
          {announcement.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        {announcement.attachment && (
          <div className="mt-8 flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white text-red-600 ring-1 ring-slate-200">
              <FileText className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="break-all text-sm font-medium text-slate-900">{announcement.attachment.fileName}</p>
              <p className="text-xs text-slate-600">PDF · {announcement.attachment.size}</p>
            </div>
            <Button variant="secondary" onClick={downloadAttachment}>
              <Download className="size-4" aria-hidden="true" />
              Download
            </Button>
          </div>
        )}
      </article>

      <Card as="aside" className="self-start">
        <CardHeader title="More announcements" />
        <ul className="divide-y divide-slate-100">
          {more.map((item) => (
            <li key={item.id}>
              <Link to={`/student/announcements/${item.id}`} className="block px-5 py-3 hover:bg-slate-50">
                <span className="block text-sm font-medium text-slate-900">{item.title}</span>
                <span className="mt-0.5 block text-xs text-slate-600">
                  {item.category} · {formatRelativeTime(item.postedAt)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
