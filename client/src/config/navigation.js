import {
  Bell,
  BookOpen,
  FileText,
  CalendarDays,
  ChartColumn,
  CircleUser,
  ClipboardCheck,
  GraduationCap,
  History,
  LayoutDashboard,
  Megaphone,
  School,
  Settings,
  Target,
  UserRound,
  Users,
  Wallet,
} from 'lucide-react';

/**
 * Sidebar structure for each portal. `phase` marks modules that are not built
 * yet; their routes render a placeholder until that phase is delivered.
 */
export const adminNavigation = [
  {
    items: [{ label: 'Dashboard', to: '/admin', icon: LayoutDashboard, end: true }],
  },
  {
    heading: 'User Management',
    items: [
      { label: 'All Users', to: '/admin/users', icon: Users },
      { label: 'Teachers', to: '/admin/teachers', icon: UserRound },
      { label: 'Students', to: '/admin/students', icon: GraduationCap },
    ],
  },
  {
    heading: 'Academic Management',
    items: [
      { label: 'Classrooms', to: '/admin/classrooms', icon: School },
      { label: 'Subjects', to: '/admin/subjects', icon: BookOpen },
      { label: 'Competencies', to: '/admin/competencies', icon: Target, phase: 3 },
    ],
  },
  {
    heading: 'Operations',
    items: [
      { label: 'Announcements', to: '/admin/announcements', icon: Megaphone },
      { label: 'Schedules', to: '/admin/schedules', icon: CalendarDays, phase: 4 },
      { label: 'Salaries', to: '/admin/salaries', icon: Wallet, phase: 5 },
      { label: 'Activity Logs', to: '/admin/activity-logs', icon: History },
      { label: 'Settings', to: '/admin/settings', icon: Settings, phase: 6 },
    ],
  },
];

export const teacherNavigation = [
  {
    items: [
      { label: 'Dashboard', to: '/teacher', icon: LayoutDashboard, end: true },
      { label: 'Announcements', to: '/teacher/announcements', icon: Megaphone },
      { label: 'My Classrooms', to: '/teacher/classrooms', icon: School },
      { label: 'Students', to: '/teacher/students', icon: GraduationCap },
      { label: 'Assessments', to: '/teacher/assessments', icon: ClipboardCheck, phase: 4 },
      { label: 'Scores', to: '/teacher/scores', icon: ChartColumn },
      { label: 'Schedule', to: '/teacher/schedule', icon: CalendarDays, phase: 4 },
      { label: 'Salary', to: '/teacher/salary', icon: Wallet, phase: 5 },
      { label: 'Profile', to: '/teacher/profile', icon: CircleUser },
    ],
  },
];

export const studentNavigation = [
  {
    items: [
      { label: 'Dashboard', to: '/student', icon: LayoutDashboard, end: true },
      { label: 'Attendance', to: '/student/attendance', icon: ClipboardCheck },
      { label: 'Grades', to: '/student/grades', icon: ChartColumn },
      { label: 'Subjects', to: '/student/subjects', icon: BookOpen },
      { label: 'Schedule', to: '/student/schedule', icon: CalendarDays },
      { label: 'Announcements', to: '/student/announcements', icon: Megaphone },
      { label: 'Finance', to: '/student/finance', icon: Wallet },
      { label: 'Documents', to: '/student/documents', icon: FileText },
      { label: 'Notifications', to: '/student/notifications', icon: Bell },
      { label: 'Profile', to: '/student/profile', icon: CircleUser },
    ],
  },
];

/** Flattens the sidebar sections into a list of navigable modules. */
export const navigationItems = (sections) => sections.flatMap((section) => section.items);
