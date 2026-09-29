import { ArrowLeft, ChartColumn, SearchX, Users } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ClassroomStudentsModal from '../../components/classroom/ClassroomStudentsModal.jsx';
import Button from '../../components/common/Button.jsx';
import Card, { CardHeader, CardLink } from '../../components/common/Card.jsx';
import PageHeader from '../../components/common/PageHeader.jsx';
import { EmptyState, ErrorState, LoadingState } from '../../components/common/States.jsx';
import { Table, TBody, Td, Th } from '../../components/common/Table.jsx';
import { useApiQuery } from '../../hooks/useApiQuery.js';
import { classroomService } from '../../services/academic.service.js';
import { formatTerm } from '../../utils/academic.js';

export default function TeacherClassroomDetail() {
  const { id } = useParams();
  const query = useApiQuery(() => classroomService.get(id), [id]);
  const [managing, setManaging] = useState(false);

  let content;
  if (query.error?.status === 404) {
    content = (
      <EmptyState
        icon={SearchX}
        title="Class not found"
        description="It may have been removed, or it isn't assigned to you."
        action={<CardLink to="/teacher/classrooms">Back to my classrooms</CardLink>}
      />
    );
  } else if (query.status === 'error') {
    content = <ErrorState message={query.error.message} onRetry={query.reload} />;
  } else if (!query.data) {
    content = <LoadingState label="Loading class…" />;
  } else {
    const classroom = query.data;
    content = (
      <>
        <PageHeader
          title={`${classroom.subject?.code} · ${classroom.section}`}
          description={`${classroom.subject?.name} · ${formatTerm(classroom)}${classroom.room ? ` · ${classroom.room}` : ''}`}
          actions={
            <>
              <Button variant="secondary" onClick={() => setManaging(true)}>
                <Users className="size-4" aria-hidden="true" />
                Class list
              </Button>
              <Link
                to={`/teacher/scores?classroom=${classroom.id}`}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
              >
                <ChartColumn className="size-4" aria-hidden="true" />
                Gradebook
              </Link>
            </>
          }
        />
        <Card>
          <CardHeader title="Students" description={`${classroom.students.length} enrolled`} />
          {classroom.students.length === 0 ? (
            <div className="p-5">
              <EmptyState icon={Users} title="No students yet" description="Use “Class list” to add students to this class." />
            </div>
          ) : (
            <Table caption="Students in this class" minWidth="min-w-[640px]">
              <thead>
                <tr>
                  <Th align="center">#</Th>
                  <Th>Student ID</Th>
                  <Th>Name</Th>
                  <Th>Email</Th>
                  <Th>Section</Th>
                </tr>
              </thead>
              <TBody>
                {classroom.students.map((student, index) => (
                  <tr key={student.id} className="hover:bg-slate-50">
                    <Td align="center" className="text-slate-600">
                      {index + 1}
                    </Td>
                    <Td className="whitespace-nowrap font-mono text-xs text-slate-900">{student.studentId}</Td>
                    <Td className="whitespace-nowrap font-medium text-slate-900">
                      {student.lastName}, {student.firstName}
                    </Td>
                    <Td className="text-slate-600">{student.email}</Td>
                    <Td className="whitespace-nowrap">{student.section}</Td>
                  </tr>
                ))}
              </TBody>
            </Table>
          )}
        </Card>
        <ClassroomStudentsModal
          classroom={managing ? classroom : null}
          onClose={() => setManaging(false)}
          onSaved={() => {
            setManaging(false);
            query.reload();
          }}
        />
      </>
    );
  }

  return (
    <>
      <Link to="/teacher/classrooms" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900">
        <ArrowLeft className="size-4" aria-hidden="true" />
        My classrooms
      </Link>
      {content}
    </>
  );
}
