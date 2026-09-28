import {
  BookOpenCheck,
  CalendarClock,
  Check,
  CircleCheck,
  CircleDashed,
  CircleX,
  Clock,
  FileCheck,
  GraduationCap,
  Hourglass,
  Info,
  LoaderCircle,
  PartyPopper,
  Radio,
  TriangleAlert,
  Wallet,
} from 'lucide-react';
import Badge from '../common/Badge.jsx';

// Every status pairs a color with an icon and a text label, never color alone.
const STATUS_STYLES = {
  attendance: {
    Present: { tone: 'green', icon: CircleCheck },
    Late: { tone: 'amber', icon: Clock },
    Absent: { tone: 'red', icon: CircleX },
    Excused: { tone: 'blue', icon: FileCheck },
  },
  document: {
    Pending: { tone: 'neutral', icon: Hourglass },
    Processing: { tone: 'blue', icon: LoaderCircle },
    Ready: { tone: 'green', icon: CircleCheck },
    Rejected: { tone: 'red', icon: CircleX },
  },
  class: {
    Upcoming: { tone: 'indigo', icon: Clock },
    Ongoing: { tone: 'green', icon: Radio },
    Completed: { tone: 'neutral', icon: Check },
  },
  grade: {
    Passed: { tone: 'green', icon: CircleCheck },
    Failed: { tone: 'red', icon: CircleX },
    'In Progress': { tone: 'neutral', icon: CircleDashed },
  },
  payment: {
    Paid: { tone: 'green', icon: CircleCheck },
    Unpaid: { tone: 'neutral', icon: CircleDashed },
    'Partially paid': { tone: 'amber', icon: Clock },
    Overdue: { tone: 'red', icon: TriangleAlert },
  },
  task: {
    pending: { tone: 'amber', icon: Clock, label: 'Pending' },
    submitted: { tone: 'green', icon: CircleCheck, label: 'Submitted' },
  },
  category: {
    Academic: { tone: 'indigo', icon: GraduationCap },
    Finance: { tone: 'blue', icon: Wallet },
    Events: { tone: 'violet', icon: PartyPopper },
    General: { tone: 'neutral', icon: Info },
  },
  event: {
    Exam: { tone: 'violet', icon: GraduationCap },
    Assignment: { tone: 'indigo', icon: BookOpenCheck },
    Event: { tone: 'blue', icon: PartyPopper },
    Deadline: { tone: 'amber', icon: CalendarClock },
  },
};

export default function StatusBadge({ kind, status, className }) {
  const style = STATUS_STYLES[kind]?.[status] ?? { tone: 'neutral' };
  return (
    <Badge tone={style.tone} icon={style.icon} className={className}>
      {style.label ?? status}
    </Badge>
  );
}

export function ImportantBadge() {
  return (
    <Badge tone="red" icon={TriangleAlert}>
      Important
    </Badge>
  );
}
