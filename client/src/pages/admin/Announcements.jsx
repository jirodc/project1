import { zodResolver } from '@hookform/resolvers/zod';
import { Megaphone, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import AnnouncementViewer, { AuthorAvatar, authorName } from '../../components/announcements/AnnouncementViewer.jsx';
import Badge from '../../components/common/Badge.jsx';
import Button from '../../components/common/Button.jsx';
import Card, { CardHeader } from '../../components/common/Card.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import Modal from '../../components/common/Modal.jsx';
import PageHeader from '../../components/common/PageHeader.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import { EmptyState, ErrorState, LoadingState } from '../../components/common/States.jsx';
import TextField, { TextAreaField } from '../../components/common/TextField.jsx';
import { useAnnouncements } from '../../hooks/useAnnouncements.js';
import { announcementService } from '../../services/announcement.service.js';
import { getErrorMessage } from '../../utils/errors.js';
import { formatDate } from '../../utils/format.js';

// Keep in sync with ANNOUNCEMENT_LIMITS in server/src/models/Announcement.js.
const LIMITS = { title: 120, body: 2000, type: 30 };
const SUGGESTED_TYPES = ['General', 'Academic', 'Event', 'Holiday', 'Reminder', 'Urgent'];
const PAGE_SIZE = 10;

const text = (label, max) =>
  z.string().trim().min(1, `${label} is required`).max(max, `${label} must be at most ${max} characters`);

const announcementSchema = z.object({
  title: text('Title', LIMITS.title),
  body: text('Body', LIMITS.body),
  type: text('Type', LIMITS.type),
});

const EMPTY_FORM = { title: '', body: '', type: '' };

export default function Announcements() {
  const location = useLocation();
  const navigate = useNavigate();

  const list = useAnnouncements(PAGE_SIZE);

  // The dashboard's "Create announcement" button links here with this flag.
  const [isFormOpen, setIsFormOpen] = useState(Boolean(location.state?.openCreate));
  const [pendingAnnouncement, setPendingAnnouncement] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [openIndex, setOpenIndex] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({ resolver: zodResolver(announcementSchema), defaultValues: EMPTY_FORM });
  const [title, body, type] = watch(['title', 'body', 'type']);

  useEffect(() => {
    // Clear the flag so a page refresh does not reopen the form.
    if (location.state?.openCreate) navigate(location.pathname, { replace: true, state: null });
  }, [location, navigate]);

  const openForm = () => setIsFormOpen(true);

  const closeForm = () => {
    if (!isPublishing) setIsFormOpen(false);
  };

  const publish = async () => {
    setIsPublishing(true);
    try {
      await announcementService.create(pendingAnnouncement);
      toast.success('Announcement created.');
      setPendingAnnouncement(null);
      setIsFormOpen(false);
      reset(EMPTY_FORM);
      // Show the new announcement, which is always first on page 1.
      if (list.page === 1) list.reload();
      else list.setPage(1);
    } catch (error) {
      // Keep the form open with the admin's text so they can fix and retry.
      setPendingAnnouncement(null);
      toast.error(getErrorMessage(error, 'Unable to create announcement.'));
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Announcements"
        description="Create announcements and read the ones already published."
        actions={
          <Button onClick={openForm}>
            <Plus className="size-4" aria-hidden="true" />
            Create Announcement
          </Button>
        }
      />

      <AnnouncementList list={list} onRetry={list.reload} onCreate={openForm} onPageChange={list.setPage} onOpen={setOpenIndex} />

      <AnnouncementViewer items={list.items} index={openIndex} onNavigate={setOpenIndex} onClose={() => setOpenIndex(null)} />

      <Modal
        open={isFormOpen}
        onClose={closeForm}
        title="Create Announcement"
        description="You will be asked to confirm before it is created."
        size="max-w-2xl"
      >
        <form onSubmit={handleSubmit(setPendingAnnouncement)} noValidate className="space-y-5">
          <TextField
            id="announcement-title"
            label="Title"
            maxLength={LIMITS.title}
            count={title.length}
            placeholder="e.g. Enrollment for the second semester"
            error={errors.title?.message}
            {...register('title')}
          />

          <TextField
            id="announcement-type"
            label="Type"
            list="announcement-types"
            maxLength={LIMITS.type}
            count={type.length}
            placeholder="Pick a suggestion or type your own"
            autoComplete="off"
            error={errors.type?.message}
            {...register('type')}
          />
          <datalist id="announcement-types">
            {SUGGESTED_TYPES.map((suggestion) => (
              <option key={suggestion} value={suggestion} />
            ))}
          </datalist>

          <TextAreaField
            id="announcement-body"
            label="Body"
            rows={8}
            maxLength={LIMITS.body}
            count={body.length}
            placeholder="Write the announcement…"
            error={errors.body?.message}
            {...register('body')}
          />

          <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={closeForm}>
              Cancel
            </Button>
            <Button type="submit">Create</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(pendingAnnouncement)}
        title="Create this announcement?"
        message={
          pendingAnnouncement && (
            <p>
              <span className="font-medium text-slate-900">“{pendingAnnouncement.title}”</span> will be
              created as a <span className="font-medium text-slate-900">{pendingAnnouncement.type}</span>{' '}
              announcement.
            </p>
          )
        }
        confirmLabel="Yes, create"
        isLoading={isPublishing}
        onConfirm={publish}
        onCancel={() => setPendingAnnouncement(null)}
      />
    </>
  );
}

const timeFormat = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' });
const dayFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });

/** Inbox-style date: time for today, "Sep 28" this year, full date otherwise. */
function inboxDate(value) {
  const date = new Date(value);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) return timeFormat.format(date);
  if (date.getFullYear() === now.getFullYear()) return dayFormat.format(date);
  return formatDate(date);
}

function AnnouncementList({ list, onRetry, onCreate, onPageChange, onOpen }) {
  const { status, items, pagination, error } = list;

  if (status === 'error') return <ErrorState message={error} onRetry={onRetry} />;
  if (status === 'loading' && items.length === 0) return <LoadingState label="Loading announcements…" />;

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Megaphone}
        title="No announcements yet"
        description="Announcements you create will be listed here."
        action={
          <Button onClick={onCreate}>
            <Plus className="size-4" aria-hidden="true" />
            Create Announcement
          </Button>
        }
      />
    );
  }

  return (
    <Card className={`overflow-hidden transition-opacity ${status === 'loading' ? 'opacity-60' : ''}`}>
      <CardHeader title="List of Created Announcements" description="Select an announcement to read it in full." />
      <ul className="divide-y divide-slate-100">
        {items.map((announcement, index) => (
          <li key={announcement.id}>
            <button
              type="button"
              onClick={() => onOpen(index)}
              className="group relative flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-slate-50 focus-visible:bg-indigo-50/60 focus-visible:outline-none sm:py-5"
            >
              <span className="absolute inset-y-0 left-0 w-1 bg-indigo-500 opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100" aria-hidden="true" />
              <AuthorAvatar announcement={announcement} />
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="truncate text-base font-semibold text-slate-900">{announcement.title}</span>
                  <Badge tone="indigo">{announcement.type}</Badge>
                </span>
                <span className="mt-1 block truncate text-sm text-slate-600">
                  <span className="font-medium text-slate-700">{authorName(announcement)}</span> — {announcement.body}
                </span>
              </span>
              <time dateTime={announcement.createdAt} className="shrink-0 self-start pt-0.5 text-sm font-medium text-slate-700">
                {inboxDate(announcement.createdAt)}
              </time>
            </button>
          </li>
        ))}
      </ul>
      <Pagination
        className="border-t border-slate-200 px-5 py-3"
        pagination={pagination}
        itemCount={items.length}
        disabled={status === 'loading'}
        onPageChange={onPageChange}
      />
    </Card>
  );
}
