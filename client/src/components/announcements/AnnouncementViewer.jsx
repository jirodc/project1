import { ChevronLeft, ChevronRight } from 'lucide-react';
import Badge from '../common/Badge.jsx';
import Button from '../common/Button.jsx';
import Modal from '../common/Modal.jsx';
import { formatDateTime, formatRelativeTime } from '../../utils/format.js';

export const authorName = (announcement) =>
  announcement.createdBy?.firstName ? `${announcement.createdBy.firstName} ${announcement.createdBy.lastName}` : 'Administrator';

export function AuthorAvatar({ announcement, size = 'size-10' }) {
  const initials = authorName(announcement)
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('');
  return (
    <span className={`flex ${size} shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700`} aria-hidden="true">
      {initials}
    </span>
  );
}

/**
 * Full announcement in a popup, like opening an email. `items` + `index`
 * let the reader step to newer/older announcements on the same page.
 */
export default function AnnouncementViewer({ items, index, onNavigate, onClose }) {
  const announcement = index != null ? items[index] : null;

  return (
    <Modal open={Boolean(announcement)} onClose={onClose} title={announcement?.title ?? ''} size="max-w-3xl">
      {announcement && (
        <article>
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 pb-4">
            <AuthorAvatar announcement={announcement} />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-slate-900">{authorName(announcement)}</p>
              <p className="text-sm text-slate-600">
                <time dateTime={announcement.createdAt}>{formatDateTime(announcement.createdAt)}</time> ({formatRelativeTime(announcement.createdAt)})
              </p>
            </div>
            <Badge tone="indigo">{announcement.type}</Badge>
          </div>

          <div className="max-h-[55vh] overflow-y-auto py-5 text-[15px] leading-7 whitespace-pre-line break-words text-slate-800">
            {announcement.body}
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Button variant="secondary" className="px-3 py-1.5" disabled={index === 0} onClick={() => onNavigate(index - 1)}>
                <ChevronLeft className="size-4" aria-hidden="true" />
                Newer
              </Button>
              <Button variant="secondary" className="px-3 py-1.5" disabled={index === items.length - 1} onClick={() => onNavigate(index + 1)}>
                Older
                <ChevronRight className="size-4" aria-hidden="true" />
              </Button>
              <span className="text-sm text-slate-600">
                {index + 1} of {items.length}
              </span>
            </div>
            <Button onClick={onClose}>Close</Button>
          </div>
        </article>
      )}
    </Modal>
  );
}
