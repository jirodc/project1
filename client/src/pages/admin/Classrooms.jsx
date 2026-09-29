import { zodResolver } from '@hookform/resolvers/zod';
import { Pencil, Plus, School, Trash2, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';
import ClassroomStudentsModal from '../../components/classroom/ClassroomStudentsModal.jsx';
import Button from '../../components/common/Button.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import FormActions from '../../components/common/FormActions.jsx';
import ListCard from '../../components/common/ListCard.jsx';
import Modal from '../../components/common/Modal.jsx';
import PageHeader from '../../components/common/PageHeader.jsx';
import RowAction from '../../components/common/RowAction.jsx';
import SearchInput from '../../components/common/SearchInput.jsx';
import SelectField from '../../components/common/SelectField.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import StatusPill from '../../components/common/StatusPill.jsx';
import { Table, TBody, Td, Th } from '../../components/common/Table.jsx';
import TextField from '../../components/common/TextField.jsx';
import { useApiQuery } from '../../hooks/useApiQuery.js';
import { useListQuery } from '../../hooks/useListQuery.js';
import { classroomService, subjectService, userService } from '../../services/academic.service.js';
import { academicYearOptions, formatAcademicYear, fullName, SEMESTERS } from '../../utils/academic.js';
import { applyFieldErrors, getErrorMessage } from '../../utils/errors.js';

const classroomSchema = z.object({
  subjectId: z.string().min(1, 'Choose a subject'),
  teacherId: z.string().min(1, 'Choose a teacher'),
  section: z.string().trim().min(1, 'Section is required').max(30),
  academicYear: z.string().regex(/^\d{4}-\d{4}$/),
  semester: z.enum(SEMESTERS),
  room: z.string().trim().max(40),
  status: z.enum(['active', 'inactive']),
});

const yearOptions = academicYearOptions().map((year) => ({ value: year, label: `A.Y. ${formatAcademicYear(year)}` }));

export default function AdminClassrooms() {
  const list = useListQuery(classroomService.list, { filters: { academicYear: '', semester: '', status: 'active' } });
  const [editing, setEditing] = useState(null);
  const [managing, setManaging] = useState(null);
  const [toDeactivate, setToDeactivate] = useState(null);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const deactivate = async () => {
    setIsDeactivating(true);
    try {
      await classroomService.deactivate(toDeactivate.id);
      toast.success('Class deactivated.');
      setToDeactivate(null);
      list.query.reload();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsDeactivating(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Classrooms"
        description="Classes per subject, section, and semester, with their teacher and students."
        actions={
          <Button onClick={() => setEditing('new')}>
            <Plus className="size-4" aria-hidden="true" />
            Add class
          </Button>
        }
      />

      <ListCard
        query={list.query}
        onPageChange={list.setPage}
        toolbar={
          <>
            <SearchInput id="class-search" label="Search classes" value={list.search} onChange={list.setSearch} placeholder="Subject, section, or room" className="sm:w-64" />
            <SelectField
              id="class-year"
              label="Academic year"
              value={list.filters.academicYear}
              onChange={(e) => list.setFilter('academicYear', e.target.value)}
              options={[{ value: '', label: 'All years' }, ...yearOptions]}
              className="sm:w-44"
            />
            <SelectField
              id="class-semester"
              label="Semester"
              value={list.filters.semester}
              onChange={(e) => list.setFilter('semester', e.target.value)}
              options={[{ value: '', label: 'All semesters' }, ...SEMESTERS.map((s) => ({ value: s, label: s }))]}
              className="sm:w-44"
            />
            <SelectField
              id="class-status"
              label="Status"
              value={list.filters.status}
              onChange={(e) => list.setFilter('status', e.target.value)}
              options={[
                { value: '', label: 'All statuses' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ]}
              className="sm:w-36"
            />
          </>
        }
        empty={{
          icon: School,
          title: list.hasFilters ? 'No matching classes' : 'No classes yet',
          description: list.hasFilters ? 'Try a different search or filter.' : 'Create a class by choosing a subject, a teacher, and a section.',
        }}
      >
        {(classrooms) => (
          <Table caption="Classes" minWidth="min-w-[960px]">
            <thead>
              <tr>
                <Th>Class</Th>
                <Th>Teacher</Th>
                <Th>Term</Th>
                <Th>Room</Th>
                <Th align="center">Students</Th>
                <Th>Status</Th>
                <Th align="right">
                  <span className="sr-only">Actions</span>
                </Th>
              </tr>
            </thead>
            <TBody>
              {classrooms.map((classroom) => (
                <tr key={classroom.id} className="hover:bg-slate-50">
                  <Td>
                    <p className="font-medium text-slate-900">
                      {classroom.subject?.code} · {classroom.section}
                    </p>
                    <p className="text-xs text-slate-600">{classroom.subject?.name}</p>
                  </Td>
                  <Td className="whitespace-nowrap">{fullName(classroom.teacher)}</Td>
                  <Td className="whitespace-nowrap text-slate-700">
                    {classroom.semester}
                    <span className="block text-xs text-slate-600">A.Y. {formatAcademicYear(classroom.academicYear)}</span>
                  </Td>
                  <Td className="whitespace-nowrap">{classroom.room || '—'}</Td>
                  <Td align="center">{classroom.studentCount}</Td>
                  <Td>
                    <StatusPill status={classroom.status} />
                  </Td>
                  <Td align="right" className="whitespace-nowrap">
                    <RowAction icon={Users} label="Students" onClick={() => setManaging(classroom)} />
                    <RowAction icon={Pencil} label="Edit" onClick={() => setEditing(classroom)} />
                    {classroom.status === 'active' && <RowAction icon={Trash2} label="Deactivate" tone="danger" onClick={() => setToDeactivate(classroom)} />}
                  </Td>
                </tr>
              ))}
            </TBody>
          </Table>
        )}
      </ListCard>

      <ClassroomForm
        classroom={editing === 'new' ? null : editing}
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          list.query.reload();
        }}
      />
      <ClassroomStudentsModal
        classroom={managing}
        onClose={() => setManaging(null)}
        onSaved={() => {
          setManaging(null);
          list.query.reload();
        }}
      />
      <ConfirmDialog
        open={Boolean(toDeactivate)}
        title="Deactivate this class?"
        message={toDeactivate && `${toDeactivate.subject?.code} · ${toDeactivate.section} will be hidden from the teacher and students. Scores are kept.`}
        confirmLabel="Deactivate"
        isLoading={isDeactivating}
        onConfirm={deactivate}
        onCancel={() => setToDeactivate(null)}
      />
    </>
  );
}

function ClassroomForm({ classroom, open, onClose, onSaved }) {
  const isNew = !classroom;
  const options = useApiQuery(
    () =>
      open
        ? Promise.all([
            subjectService.list({ status: 'active', limit: 100, sort: 'code' }),
            userService.list({ role: 'teacher', status: 'active', limit: 100 }),
          ])
        : Promise.resolve(null),
    [open],
  );

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(classroomSchema) });

  const loaded = options.data != null;

  useEffect(() => {
    if (!open || !loaded) return;
    reset(
      isNew
        ? { subjectId: '', teacherId: '', section: '', academicYear: academicYearOptions()[1], semester: SEMESTERS[0], room: '', status: 'active' }
        : {
            subjectId: classroom.subject?.id ?? '',
            teacherId: classroom.teacher?.id ?? '',
            section: classroom.section,
            academicYear: classroom.academicYear,
            semester: classroom.semester,
            room: classroom.room ?? '',
            status: classroom.status,
          },
    );
  }, [open, loaded, isNew, classroom, reset]);

  const save = async (values) => {
    try {
      if (isNew) await classroomService.create({ ...values, studentIds: [] });
      else await classroomService.update(classroom.id, { ...values, studentIds: classroom.studentIds });
      toast.success(isNew ? 'Class created. Add students from the Students action.' : 'Class updated.');
      onSaved();
    } catch (error) {
      if (!applyFieldErrors(error, setError)) toast.error(getErrorMessage(error));
    }
  };

  const close = () => !isSubmitting && onClose();
  const [subjects, teachers] = options.data ?? [null, null];

  return (
    <Modal open={open} onClose={close} title={isNew ? 'Add class' : 'Edit class'} size="max-w-2xl">
      {!loaded ? (
        <div className="flex justify-center py-10 text-indigo-600">
          <Spinner className="size-6" />
        </div>
      ) : (
        <form onSubmit={handleSubmit(save)} noValidate className="space-y-4">
          <SelectField
            id="class-subject"
            label="Subject"
            error={errors.subjectId?.message}
            options={[{ value: '', label: 'Choose a subject…' }, ...subjects.items.map((s) => ({ value: s.id, label: `${s.code} — ${s.name}` }))]}
            {...register('subjectId')}
          />
          <SelectField
            id="class-teacher"
            label="Teacher"
            error={errors.teacherId?.message}
            options={[{ value: '', label: 'Choose a teacher…' }, ...teachers.items.map((t) => ({ value: t.id, label: `${t.lastName}, ${t.firstName}` }))]}
            {...register('teacherId')}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField id="class-section" label="Section" placeholder="BSIT-3A" autoComplete="off" error={errors.section?.message} {...register('section')} />
            <TextField id="class-room" label="Room (optional)" placeholder="CL-204" autoComplete="off" error={errors.room?.message} {...register('room')} />
            <SelectField id="class-year-field" label="Academic year" options={yearOptions} error={errors.academicYear?.message} {...register('academicYear')} />
            <SelectField id="class-semester-field" label="Semester" options={SEMESTERS.map((s) => ({ value: s, label: s }))} error={errors.semester?.message} {...register('semester')} />
          </div>
          <SelectField
            id="class-status-field"
            label="Status"
            className="sm:w-48"
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
            {...register('status')}
          />
          <FormActions onCancel={close} isSubmitting={isSubmitting} submitLabel={isNew ? 'Create class' : 'Save changes'} />
        </form>
      )}
    </Modal>
  );
}
