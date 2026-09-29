import { zodResolver } from '@hookform/resolvers/zod';
import { BookOpen, CircleCheck, CircleX, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react';
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
import TextField, { TextAreaField } from '../../components/common/TextField.jsx';
import { useListQuery } from '../../hooks/useListQuery.js';
import { subjectService } from '../../services/academic.service.js';
import { DEFAULT_GRADING, GRADING_PERIODS, SCORE_CATEGORIES } from '../../utils/academic.js';
import { applyFieldErrors, getErrorMessage } from '../../utils/errors.js';

const total = (weights) => Object.values(weights ?? {}).reduce((sum, value) => sum + (Number(value) || 0), 0);

const weights = (options) =>
  z.object(Object.fromEntries(options.map(({ value }) => [value, z.coerce.number().min(0, 'Min 0').max(100, 'Max 100')])));

const subjectSchema = z
  .object({
    code: z.string().trim().toUpperCase().min(2, 'At least 2 characters').max(20).regex(/^[A-Z0-9-]+$/, 'Letters, numbers, and dashes only'),
    name: z.string().trim().min(2, 'Name is required').max(120),
    units: z.coerce.number().int('Whole units only').min(0).max(10),
    description: z.string().trim().max(500),
    status: z.enum(['active', 'inactive']),
    grading: z.object({ categories: weights(SCORE_CATEGORIES), periods: weights(GRADING_PERIODS) }),
  })
  .refine((data) => total(data.grading.categories) === 100, { message: 'Category weights must add up to 100%', path: ['grading', 'categories'] })
  .refine((data) => total(data.grading.periods) === 100, { message: 'Period weights must add up to 100%', path: ['grading', 'periods'] });

const summarize = (grading) =>
  SCORE_CATEGORIES.filter(({ value }) => grading.categories[value] > 0)
    .map(({ value, label }) => `${label} ${grading.categories[value]}%`)
    .join(' · ');

export default function AdminSubjects() {
  const list = useListQuery(subjectService.list, { filters: { status: '' } });
  const [editing, setEditing] = useState(null);
  const [toDeactivate, setToDeactivate] = useState(null);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const deactivate = async () => {
    setIsDeactivating(true);
    try {
      await subjectService.deactivate(toDeactivate.id);
      toast.success(`${toDeactivate.code} deactivated.`);
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
        title="Subjects"
        description="The subject catalog and how each subject's grades are computed."
        actions={
          <Button onClick={() => setEditing('new')}>
            <Plus className="size-4" aria-hidden="true" />
            Add subject
          </Button>
        }
      />

      <ListCard
        query={list.query}
        onPageChange={list.setPage}
        toolbar={
          <>
            <SearchInput id="subject-search" label="Search subjects" value={list.search} onChange={list.setSearch} placeholder="Search by code or name" className="sm:w-72" />
            <SelectField
              id="subject-status"
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
          icon: BookOpen,
          title: list.hasFilters ? 'No matching subjects' : 'No subjects yet',
          description: list.hasFilters ? 'Try a different search.' : 'Add the subjects your school offers.',
        }}
      >
        {(subjects) => (
          <Table caption="Subjects" minWidth="min-w-[880px]">
            <thead>
              <tr>
                <Th>Code</Th>
                <Th>Subject</Th>
                <Th align="center">Units</Th>
                <Th>Grading</Th>
                <Th>Status</Th>
                <Th align="right">
                  <span className="sr-only">Actions</span>
                </Th>
              </tr>
            </thead>
            <TBody>
              {subjects.map((subject) => (
                <tr key={subject.id} className="hover:bg-slate-50">
                  <Td className="whitespace-nowrap font-semibold text-slate-900">{subject.code}</Td>
                  <Td>
                    <p className="font-medium text-slate-900">{subject.name}</p>
                    {subject.description && <p className="line-clamp-1 text-xs text-slate-600">{subject.description}</p>}
                  </Td>
                  <Td align="center">{subject.units}</Td>
                  <Td className="text-xs text-slate-700">
                    <p>{summarize(subject.grading)}</p>
                    <p className="text-slate-600">
                      Prelim {subject.grading.periods.prelim}% · Midterm {subject.grading.periods.midterm}% · Final {subject.grading.periods.final}%
                    </p>
                  </Td>
                  <Td>
                    <StatusPill status={subject.status} />
                  </Td>
                  <Td align="right" className="whitespace-nowrap">
                    <RowAction icon={Pencil} label="Edit" onClick={() => setEditing(subject)} />
                    {subject.status === 'active' && <RowAction icon={Trash2} label="Deactivate" tone="danger" onClick={() => setToDeactivate(subject)} />}
                  </Td>
                </tr>
              ))}
            </TBody>
          </Table>
        )}
      </ListCard>

      <SubjectForm
        subject={editing === 'new' ? null : editing}
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          list.query.reload();
        }}
      />
      <ConfirmDialog
        open={Boolean(toDeactivate)}
        title="Deactivate this subject?"
        message={toDeactivate && `${toDeactivate.code} — ${toDeactivate.name} won't be available for new classes. Existing classes and grades are kept.`}
        confirmLabel="Deactivate"
        isLoading={isDeactivating}
        onConfirm={deactivate}
        onCancel={() => setToDeactivate(null)}
      />
    </>
  );
}

function WeightGroup({ legend, options, name, register, values, error }) {
  const sum = total(values);
  const ok = sum === 100;
  return (
    <fieldset className="rounded-lg border border-slate-200 p-4">
      <legend className="px-1 text-sm font-medium text-slate-900">{legend}</legend>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {options.map(({ value, label }) => (
          <label key={value} className="text-sm text-slate-700">
            {label}
            <span className="relative mt-1 block">
              <input
                type="number"
                min={0}
                max={100}
                step={1}
                className="block w-full rounded-lg border border-slate-300 py-2 pl-3 pr-8 text-sm tabular-nums text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                {...register(`${name}.${value}`)}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">%</span>
            </span>
          </label>
        ))}
      </div>
      <p className={`mt-3 flex items-center gap-1.5 text-sm font-medium ${ok ? 'text-emerald-700' : 'text-red-700'}`} role="status">
        {ok ? <CircleCheck className="size-4" aria-hidden="true" /> : <CircleX className="size-4" aria-hidden="true" />}
        Total {sum}%{!ok && ' — must be 100%'}
      </p>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </fieldset>
  );
}

function SubjectForm({ subject, open, onClose, onSaved }) {
  const isNew = !subject;
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(subjectSchema) });

  useEffect(() => {
    if (!open) return;
    reset(
      isNew
        ? { code: '', name: '', units: 3, description: '', status: 'active', grading: DEFAULT_GRADING }
        : { code: subject.code, name: subject.name, units: subject.units, description: subject.description ?? '', status: subject.status, grading: subject.grading },
    );
  }, [open, isNew, subject, reset]);

  const grading = watch('grading');

  const save = async (values) => {
    try {
      if (isNew) await subjectService.create(values);
      else await subjectService.update(subject.id, values);
      toast.success(isNew ? `${values.code} added.` : `${values.code} updated. Grades for its classes now use these weights.`);
      onSaved();
    } catch (error) {
      if (!applyFieldErrors(error, setError)) toast.error(getErrorMessage(error));
    }
  };

  const close = () => !isSubmitting && onClose();

  return (
    <Modal open={open} onClose={close} title={isNew ? 'Add subject' : `Edit ${subject.code}`} size="max-w-2xl">
      <form onSubmit={handleSubmit(save)} noValidate className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-[1fr_2fr_6rem]">
          <TextField id="subject-code" label="Code" placeholder="IT301" autoComplete="off" error={errors.code?.message} {...register('code')} />
          <TextField id="subject-name" label="Name" autoComplete="off" error={errors.name?.message} {...register('name')} />
          <TextField id="subject-units" label="Units" type="number" min={0} max={10} error={errors.units?.message} {...register('units')} />
        </div>
        <TextAreaField id="subject-description" label="Description (optional)" rows={2} maxLength={500} error={errors.description?.message} {...register('description')} />

        <div>
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-slate-900">Grading weights</p>
            <button
              type="button"
              onClick={() => setValue('grading', DEFAULT_GRADING, { shouldDirty: true })}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-indigo-700 hover:bg-indigo-50"
            >
              <RotateCcw className="size-3.5" aria-hidden="true" />
              Use defaults
            </button>
          </div>
          <p className="mb-3 text-sm text-slate-600">
            Applies to every class of this subject, in every semester. Categories with 0% are ignored.
          </p>
          <div className="space-y-4">
            <WeightGroup
              legend="Score categories (within each grading period)"
              options={SCORE_CATEGORIES}
              name="grading.categories"
              register={register}
              values={grading?.categories}
              error={errors.grading?.categories?.message ?? errors.grading?.categories?.root?.message}
            />
            <WeightGroup
              legend="Grading periods (toward the final rating)"
              options={GRADING_PERIODS}
              name="grading.periods"
              register={register}
              values={grading?.periods}
              error={errors.grading?.periods?.message ?? errors.grading?.periods?.root?.message}
            />
          </div>
        </div>

        <SelectField
          id="subject-status-field"
          label="Status"
          options={[
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
          ]}
          className="sm:w-48"
          {...register('status')}
        />
        <FormActions onCancel={close} isSubmitting={isSubmitting} submitLabel={isNew ? 'Add subject' : 'Save changes'} />
      </form>
    </Modal>
  );
}
