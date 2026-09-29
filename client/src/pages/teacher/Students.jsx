import { GraduationCap } from 'lucide-react';
import ListCard from '../../components/common/ListCard.jsx';
import PageHeader from '../../components/common/PageHeader.jsx';
import SearchInput from '../../components/common/SearchInput.jsx';
import SelectField from '../../components/common/SelectField.jsx';
import { Table, TBody, Td, Th } from '../../components/common/Table.jsx';
import { useApiQuery } from '../../hooks/useApiQuery.js';
import { useListQuery } from '../../hooks/useListQuery.js';
import { classroomService, studentService } from '../../services/academic.service.js';

export default function TeacherStudents() {
  const classes = useApiQuery(() => classroomService.list({ status: 'active', limit: 100 }));
  const list = useListQuery(studentService.list, { filters: { classroomId: '' } });

  return (
    <>
      <PageHeader title="Students" description="Students enrolled in your classes." />
      <ListCard
        query={list.query}
        onPageChange={list.setPage}
        toolbar={
          <>
            <SearchInput id="teacher-student-search" label="Search students" value={list.search} onChange={list.setSearch} placeholder="Search by name or student ID" className="sm:w-72" />
            <SelectField
              id="teacher-student-class"
              label="Class"
              value={list.filters.classroomId}
              onChange={(e) => list.setFilter('classroomId', e.target.value)}
              options={[
                { value: '', label: 'All my classes' },
                ...(classes.data?.items ?? []).map((c) => ({ value: c.id, label: `${c.subject?.code} · ${c.section} (${c.semester})` })),
              ]}
              className="sm:w-72"
            />
          </>
        }
        empty={{
          icon: GraduationCap,
          title: list.hasFilters ? 'No matching students' : 'No students yet',
          description: list.hasFilters ? 'Try a different search or class.' : 'Students appear here once they are added to one of your classes.',
        }}
      >
        {(students) => (
          <Table caption="My students" minWidth="min-w-[720px]">
            <thead>
              <tr>
                <Th>Student ID</Th>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Year</Th>
                <Th>Section</Th>
              </tr>
            </thead>
            <TBody>
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50">
                  <Td className="whitespace-nowrap font-mono text-xs text-slate-900">{student.studentId}</Td>
                  <Td className="whitespace-nowrap font-medium text-slate-900">
                    {student.lastName}, {student.firstName}
                  </Td>
                  <Td className="text-slate-600">{student.email}</Td>
                  <Td className="whitespace-nowrap">{student.yearLevel}</Td>
                  <Td className="whitespace-nowrap">{student.section}</Td>
                </tr>
              ))}
            </TBody>
          </Table>
        )}
      </ListCard>
    </>
  );
}
