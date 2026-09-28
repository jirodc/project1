import { BookOpenCheck, CalendarClock, ClipboardCheck, GraduationCap, Megaphone, Wallet } from 'lucide-react';

const ICONS = {
  grade: { icon: GraduationCap, className: 'bg-emerald-50 text-emerald-700' },
  attendance: { icon: ClipboardCheck, className: 'bg-amber-50 text-amber-700' },
  announcement: { icon: Megaphone, className: 'bg-indigo-50 text-indigo-700' },
  payment: { icon: Wallet, className: 'bg-sky-50 text-sky-700' },
  assignment: { icon: BookOpenCheck, className: 'bg-violet-50 text-violet-700' },
  schedule: { icon: CalendarClock, className: 'bg-rose-50 text-rose-700' },
};

export default function NotificationIcon({ type, size = 'size-9' }) {
  const { icon: Icon, className } = ICONS[type] ?? ICONS.announcement;
  return (
    <span className={`flex ${size} shrink-0 items-center justify-center rounded-full ${className}`}>
      <Icon className="size-4.5" aria-hidden="true" />
    </span>
  );
}
