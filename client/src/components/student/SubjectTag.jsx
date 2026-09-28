import { Link } from 'react-router-dom';

/** Colored dot for a subject. Always shown beside the subject's text, never alone. */
export function SubjectDot({ color, className = 'size-2.5' }) {
  return <span aria-hidden="true" className={`inline-block shrink-0 rounded-full ${className}`} style={{ backgroundColor: color }} />;
}

/** "● IT301 Advanced Database Systems", optionally linking to the subject page. */
export default function SubjectTag({ subject, showName = true, link = false, className = '' }) {
  const content = (
    <>
      <SubjectDot color={subject.color} />
      <span className="font-medium text-slate-900">{subject.code}</span>
      {showName && <span className="truncate text-slate-600">{subject.name}</span>}
    </>
  );

  const classes = `inline-flex min-w-0 items-center gap-2 ${className}`;

  if (link) {
    return (
      <Link to={`/student/subjects/${subject.code}`} className={`${classes} rounded hover:underline`}>
        {content}
      </Link>
    );
  }
  return <span className={classes}>{content}</span>;
}
