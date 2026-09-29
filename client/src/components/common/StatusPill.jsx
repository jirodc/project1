import { CircleCheck, CircleMinus, CirclePause } from 'lucide-react';
import Badge from './Badge.jsx';

const STYLES = {
  active: { tone: 'green', icon: CircleCheck, label: 'Active' },
  inactive: { tone: 'neutral', icon: CircleMinus, label: 'Inactive' },
  suspended: { tone: 'amber', icon: CirclePause, label: 'Suspended' },
};

/** Account/record status with an icon so it never relies on color alone. */
export default function StatusPill({ status }) {
  const style = STYLES[status] ?? STYLES.inactive;
  return (
    <Badge tone={style.tone} icon={style.icon}>
      {style.label}
    </Badge>
  );
}
