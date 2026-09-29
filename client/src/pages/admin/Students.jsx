import { zodResolver } from '@hookform/resolvers/zod';
import { GraduationCap, Pencil, UserCheck, UserPlus, UserX } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';
import Button from '../../components/common/Button.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import FormActions from '../../components/common/FormActions.jsx';
import ListCard from '../../components/common/ListCard.jsx';
import Modal from '../../components/common/Modal.jsx';
import PageHeader from '../../components/common/PageHeader.jsx';
import RowAction from '../../components/common/RowAction.jsx';
import SearchInput from '../../components/common/SearchInput.jsx';
import SelectField from '../../components/common/SelectField.jsx';
import StatusPill from '../../components/common/StatusPill.jsx';
import { Table, TBody, Td, Th } from '../../components/common/Table.jsx';
import TextField from '../../components/common/TextField.jsx';
import { useListQuery } from '../../hooks/useListQuery.js';
import { studentService } from '../../services/academic.service.js';
import { YEAR_LEVELS } from '../../utils/academic.js';
import { applyFieldErrors, getErrorMessage } from '../../utils/errors.js';

const PROGRAMS = [
  'Bachelor of Science in Information Technology',
  'Bachelor of Science in Computer Science',
  'Bachelor of Science in Information Systems',
  'Bachelor of Science in Computer Engineering',
];

const fields = {
  firstName: z.string().trim().min(1, 'First name is required').max(50),
  lastName: z.string().trim().min(1, 'Last name is required').max(50),
  email: z.string().trim().toLowerCase().pipe(z.email('Enter a valid email address')),
  studentId: z.string().trim().regex(/^\d{4}-\d{6}$/, 'Use the format 2026-001234'),
  program: z.string().trim().min(2, 'Program is required').max(120),
  yearLevel: z.enum(YEAR_LEVELS),
  section: z.string().trim().min(1, 'Section is required').max(30),
  status: z.enum(['active', 'inactive']),
};
const password = z
  .string()
  .min(8, 'Use at least 8 characters')
  .max(72)
  .regex(/[A-Za-z]/, 'Include a letter')
  .regex(/\d/, 'Include a number');

const createSchema = z.object({ ...fields, password });
const editSchema = z.object(fields);

const toForm = (student) => ({
  firstName: student.firstName,
  lastName: student.lastName,
  email: student.email,
  studentId: student.studentId,
  program: student.program,
  yearLevel: student.yearLevel,
  section: student.section,
  status: student.status,
});

export default function AdminStudents() {
  const list = useListQuery(studentService.list, { filters: { yearLevel: '', status: '' } });
  const [editing, setEditing] = useState(null);
  const [statusChange, setStatusChange] = useState(null);
  const [isChanging, setIsChanging] = useState(false);

  const applyStatusChange = async () => {
    const { student, status } = statusChange;
    setIsChanging(true);
    try {
      if (status === 'inactive') await studentService.deactivate(student.id);
      else await studentService.update(student.id, { ...toForm(student), status });
      toast.success(`${student.firstName} ${student.lastName} is now ${status}.`);
      setStatusChange(null);
      list.query.reload();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Students"
        description="Student records and their portal accounts. Every student can sign in."
        actions={
          <Button onClick={() => setEditing('new')}>
            <UserPlus className="size-4" aria-hidden="true" />
            Add student
          </Button>
        }
      />

      <ListCard
        query={list.query}
        onPageChange={list.setPage}
        toolbar={
          <>
            <SearchInput
              id="student-search"
              label="Search students"
              value={list.search}
              onChange={list.setSearch}
              placeholder="Search by name, email, student ID, or section"
              className="sm:w-80"
            />
            <SelectField
              id="student-year"
              label="Year level"
              value={list.filters.yearLevel}
              onChange={(e) => list.setFilter('yearLevel', e.target.value)}
              options={[{ value: '', label: 'All year levels' }, ...YEAR_LEVELS.map((y) => ({ value: y, label: y }))]}
              className="sm:w-44"
            />
            <SelectField
              id="student-status"
              label="Status"
              value={list.filters.status}
              onChange={(e) => list.setFilter('status', e.target.value)}
              options={[
                { value: '', label: 'All statuses' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ]}
              className="sm:w-40"
            />
          </>
        }
        empty={{
          icon: GraduationCap,
          title: list.hasFilters ? 'No matching students' : 'No students yet',
          description: list.hasFilters ? 'Try a different search or filter.' : 'Add a student to create their record and portal account.',
        }}
      >
        {(students) => (
          <Table caption="Students" minWidth="min-w-[900px]">
            <thead>
              <tr>
                <Th>Student ID</Th>
                <Th>Name</Th>
                <Th>Program</Th>
                <Th>Year</Th>
                <Th>Section</Th>
                <Th>Status</Th>
                <Th align="right">
                  <span className="sr-only">Actions</span>
                </Th>
              </tr>
            </thead>
            <TBody>
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50">
                  <Td className="whitespace-nowrap font-mono text-xs text-slate-900">{student.studentId}</Td>
                  <Td>
                    <p className="font-medium text-slate-900">
                      {student.lastName}, {student.firstName}
                    </p>
                    <p className="text-xs text-slate-600">{student.email}</p>
                  </Td>
                  <Td className="max-w-56 text-slate-700">{student.program}</Td>
                  <Td className="whitespace-nowrap">{student.yearLevel}</Td>
                  <Td className="whitespace-nowrap">{student.section}</Td>
                  <Td>
                    <StatusPill status={student.status} />
                  </Td>
                  <Td align="right" className="whitespace-nowrap">
                    <RowAction icon={Pencil} label="Edit" onClick={() => setEditing(student)} />
                    {student.status === 'active' ? (
                      <RowAction icon={UserX} label="Deactivate" tone="danger" onClick={() => setStatusChange({ student, status: 'inactive' })} />
                    ) : (
                      <RowAction icon={UserCheck} label="Activate" tone="success" onClick={() => setStatusChange({ student, status: 'active' })} />
                    )}
                  </Td>
                </tr>
              ))}
            </TBody>
          </Table>
        )}
      </ListCard>

      <StudentForm
        student={editing === 'new' ? null : editing}
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          list.query.reload();
        }}
      />
      <ConfirmDialog
        open={Boolean(statusChange)}
        title={statusChange?.status === 'inactive' ? 'Deactivate this student?' : 'Activate this student?'}
        message={
          statusChange &&
          (statusChange.status === 'inactive'
            ? `Are you sure you want to deactivate ${statusChange.student.firstName} ${statusChange.student.lastName}? They won't be able to sign in. Grades and records are kept.`
            : `${statusChange.student.firstName} ${statusChange.student.lastName} will be able to sign in again.`)
        }
        confirmLabel={statusChange?.status === 'inactive' ? 'Deactivate' : 'Activate'}
        isLoading={isChanging}
        onConfirm={applyStatusChange}
        onCancel={() => setStatusChange(null)}
      />
    </>
  );
}

function StudentForm({ student, open, onClose, onSaved }) {
  const isNew = !student;
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(isNew ? createSchema : editSchema) });

  useEffect(() => {
    if (!open) return;
    reset(
      isNew
        ? { firstName: '', lastName: '', email: '', studentId: '', program: PROGRAMS[0], yearLevel: '1st Year', section: '', status: 'active', password: '' }
        : toForm(student),
    );
  }, [open, isNew, student, reset]);

  const save = async (values) => {
    try {
      if (isNew) await studentService.create(values);
      else await studentService.update(student.id, values);
      toast.success(isNew ? `${values.firstName} ${values.lastName} was added and can now sign in.` : 'Student updated.');
      onSaved();
    } catch (error) {
      if (!applyFieldErrors(error, setError)) toast.error(getErrorMessage(error));
    }
  };

  const close = () => !isSubmitting && onClose();

  return (
    <Modal open={open} onClose={close} title={isNew ? 'Add student' : 'Edit student'} size="max-w-2xl">
      <form onSubmit={handleSubmit(save)} noValidate className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField id="student-first-name" label="First name" autoComplete="off" error={errors.firstName?.message} {...register('firstName')} />
          <TextField id="student-last-name" label="Last name" autoComplete="off" error={errors.lastName?.message} {...register('lastName')} />
          <TextField id="student-email" label="Email (used to sign in)" type="email" autoComplete="off" error={errors.email?.message} {...register('email')} />
          <TextField id="student-id" label="Student ID" placeholder="2026-001234" autoComplete="off" error={errors.studentId?.message} {...register('studentId')} />
        </div>
        <TextField id="student-program" label="Program" list="program-options" autoComplete="off" error={errors.program?.message} {...register('program')} />
        <datalist id="program-options">
          {PROGRAMS.map((program) => (
            <option key={program} value={program} />
          ))}
        </datalist>
        <div className="grid gap-4 sm:grid-cols-3">
          <SelectField id="student-year-field" label="Year level" options={YEAR_LEVELS.map((y) => ({ value: y, label: y }))} error={errors.yearLevel?.message} {...register('yearLevel')} />
          <TextField id="student-section" label="Section" placeholder="BSIT-3A" autoComplete="off" error={errors.section?.message} {...register('section')} />
          <SelectField
            id="student-status-field"
            label="Status"
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
            error={errors.status?.message}
            {...register('status')}
          />
        </div>
        {isNew && (
          <>
            <TextField id="student-password" label="Temporary password" type="text" autoComplete="new-password" error={errors.password?.message} {...register('password')} />
            <p className="text-xs text-slate-600">The student can change it from their profile after signing in.</p>
          </>
        )}
        <FormActions onCancel={close} isSubmitting={isSubmitting} submitLabel={isNew ? 'Add student' : 'Save changes'} />
      </form>
    </Modal>
  );
}
