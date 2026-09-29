import { ArrowRight, MapPin, School, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader.jsx';
import { EmptyState, QueryState } from '../../components/common/States.jsx';
import { useApiQuery } from '../../hooks/useApiQuery.js';
import { classroomService } from '../../services/academic.service.js';
import { formatTerm } from '../../utils/academic.js';

/** Classes grouped by semester, newest first (the API already sorts them). */
function groupByTerm(classrooms) {
  const groups = new Map();
  for (const classroom of classrooms) {
    const key = formatTerm(classroom);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(classroom);
  }
  return [...groups.entries()];
}

export default function TeacherClassrooms() {
  const query = useApiQuery(() => classroomService.list({ status: 'active', limit: 100 }));

  return (
    <>
      <PageHeader title="My Classrooms" description="The classes assigned to you." />
      <QueryState query={query} loadingLabel="Loading your classes…">
        {({ items }) =>
          items.length === 0 ? (
            <EmptyState icon={School} title="No classes assigned yet" description="An administrator assigns classes to teachers. They'll appear here." />
          ) : (
            <div className="space-y-8">
              {groupByTerm(items).map(([term, classrooms]) => (
                <section key={term}>
                  <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-600">{term}</h2>
                  <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {classrooms.map((classroom) => (
                      <li key={classroom.id}>
                        <Link
                          to={`/teacher/classrooms/${classroom.id}`}
                          className="group flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-indigo-300 hover:shadow-sm"
                        >
                          <p className="text-xs font-semibold text-indigo-700">{classroom.subject?.code}</p>
                          <p className="mt-1 font-semibold text-slate-900">{classroom.subject?.name}</p>
                          <p className="mt-1 text-sm text-slate-600">Section {classroom.section}</p>
                          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
                            <span className="inline-flex items-center gap-1.5">
                              <Users className="size-4" aria-hidden="true" />
                              {classroom.studentCount} {classroom.studentCount === 1 ? 'student' : 'students'}
                            </span>
                            {classroom.room && (
                              <span className="inline-flex items-center gap-1.5">
                                <MapPin className="size-4" aria-hidden="true" />
                                {classroom.room}
                              </span>
                            )}
                          </div>
                          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-indigo-700">
                            Open class
                            <ArrowRight className="size-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )
        }
      </QueryState>
    </>
  );
}
