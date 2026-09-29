import { zodResolver } from '@hookform/resolvers/zod';
import { ChartColumn, ClipboardList, Pencil, Plus, School, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import Badge from '../../components/common/Badge.jsx';
import Button from '../../components/common/Button.jsx';
import Card, { CardHeader } from '../../components/common/Card.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import FormActions from '../../components/common/FormActions.jsx';
import Modal from '../../components/common/Modal.jsx';
import PageHeader from '../../components/common/PageHeader.jsx';
import RowAction from '../../components/common/RowAction.jsx';
import SelectField from '../../components/common/SelectField.jsx';
import Spinner from '../../components/common/Spinner.jsx';
import { EmptyState, ErrorState, LoadingState, QueryState } from '../../components/common/States.jsx';
import { Table, TBody, Td, Th } from '../../components/common/Table.jsx';
import TextField, { TextAreaField } from '../../components/common/TextField.jsx';
import StatusBadge from '../../components/student/StatusBadges.jsx';
import { useApiQuery } from '../../hooks/useApiQuery.js';
import { classroomService, scoreService } from '../../services/academic.service.js';
import { formatGrade, GRADING_PERIODS, labelOf, SCORE_CATEGORIES } from '../../utils/academic.js';
import { toDateKey } from '../../utils/dates.js';
import { applyFieldErrors, getErrorMessage } from '../../utils/errors.js';
import { formatDate } from '../../utils/format.js';

const studentName = (student) => `${student.lastName}, ${student.firstName}`;

export default function TeacherScores() {
  const [params, setParams] = useSearchParams();
  const classroomId = params.get('classroom') ?? '';
  const classes = useApiQuery(() => classroomService.list({ status: 'active', limit: 100 }));
  const gradebook = useApiQuery(() => (classroomId ? classroomService.gradebook(classroomId) : Promise.resolve(null)), [classroomId]);

  const [scoreForm, setScoreForm] = useState(null); // { score?, studentId? }
  const [viewingId, setViewingId] = useState(null);
  // Read from the latest gradebook so the dialog refreshes after every change.
  const viewing = gradebook.data?.rows.find((row) => row.student.id === viewingId) ?? null;

  // Open the first class automatically.
  useEffect(() => {
    const first = classes.data?.items[0];
    if (!classroomId && first) setParams({ classroom: first.id }, { replace: true });
  }, [classroomId, classes.data, setParams]);

  const refresh = () => gradebook.reload();

  return (
    <>
      <PageHeader
        title="Score Management"
        description="Record scores per grading period. Grades are computed with the subject's weights."
        actions={
          <Button onClick={() => setScoreForm({})} disabled={!gradebook.data?.rows.length}>
            <Plus className="size-4" aria-hidden="true" />
            Add score
          </Button>
        }
      />

      <QueryState query={classes} loadingLabel="Loading your classes…">
        {({ items }) =>
          items.length === 0 ? (
            <EmptyState icon={School} title="No classes assigned yet" description="Scores can be recorded once an administrator assigns you a class." />
          ) : (
            <div className="space-y-6">
              <Card>
                <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-end">
                  <SelectField
                    id="gradebook-class"
                    label="Class"
                    value={classroomId}
                    onChange={(e) => setParams({ classroom: e.target.value }, { replace: true })}
                    options={items.map((c) => ({ value: c.id, label: `${c.subject?.code} · ${c.section} — ${c.semester}, ${c.academicYear.replace('-', '–')}` }))}
                    className="sm:w-96"
                  />
                  {gradebook.data && <WeightsSummary grading={gradebook.data.grading} />}
                </div>
              </Card>
              <Gradebook query={gradebook} onView={(row) => setViewingId(row.student.id)} />
            </div>
          )
        }
      </QueryState>

      {gradebook.data && (
        <>
          <ScoreForm
            state={scoreForm}
            classroomId={classroomId}
            rows={gradebook.data.rows}
            onClose={() => setScoreForm(null)}
            onSaved={() => {
              setScoreForm(null);
              refresh();
            }}
          />
          <StudentScores
            row={viewing}
            classroomId={classroomId}
            onClose={() => setViewingId(null)}
            onChanged={refresh}
            onAdd={(studentId) => setScoreForm({ studentId })}
            onEdit={(score) => setScoreForm({ score })}
          />
        </>
      )}
    </>
  );
}

function WeightsSummary({ grading }) {
  const categories = SCORE_CATEGORIES.filter(({ value }) => grading.categories[value] > 0)
    .map(({ value, label }) => `${label} ${grading.categories[value]}%`)
    .join(' · ');
  return (
    <div className="text-sm text-slate-700">
      <p className="font-medium text-slate-900">Grading weights</p>
      <p>{categories}</p>
      <p className="text-slate-600">
        Prelim {grading.periods.prelim}% · Midterm {grading.periods.midterm}% · Final {grading.periods.final}%
      </p>
    </div>
  );
}

function Gradebook({ query, onView }) {
  if (query.status === 'error') return <ErrorState message={query.error.message} onRetry={query.reload} />;
  if (!query.data) return <LoadingState label="Loading gradebook…" />;

  const { classroom, rows } = query.data;
  const refreshing = query.status === 'loading';

  return (
    <Card>
      <CardHeader title={`Gradebook · ${classroom.subject?.code} ${classroom.section}`} description={`${rows.length} students · ${classroom.subject?.name}`} />
      {rows.length === 0 ? (
        <div className="p-5">
          <EmptyState icon={ClipboardList} title="No students in this class" description="Add students from the class page first." />
        </div>
      ) : (
        <div className={`transition-opacity ${refreshing ? 'opacity-60' : ''}`}>
          <Table caption="Gradebook" minWidth="min-w-[820px]">
            <thead>
              <tr>
                <Th>Student</Th>
                <Th align="center">Prelim</Th>
                <Th align="center">Midterm</Th>
                <Th align="center">Final</Th>
                <Th align="center">Final rating</Th>
                <Th>Remarks</Th>
                <Th align="right">
                  <span className="sr-only">Actions</span>
                </Th>
              </tr>
            </thead>
            <TBody>
              {rows.map((row) => (
                <tr key={row.student.id} className="hover:bg-slate-50">
                  <Td>
                    <p className="font-medium text-slate-900">{studentName(row.student)}</p>
                    <p className="font-mono text-xs text-slate-600">{row.student.studentId}</p>
                  </Td>
                  <Td align="center">{formatGrade(row.prelim)}</Td>
                  <Td align="center">{formatGrade(row.midterm)}</Td>
                  <Td align="center">{formatGrade(row.final)}</Td>
                  <Td align="center" className="whitespace-nowrap font-semibold text-slate-900">
                    {row.rating == null ? '—' : `${row.rating} (${row.point.toFixed(2)})`}
                  </Td>
                  <Td>
                    <StatusBadge kind="grade" status={row.remarks} />
                  </Td>
                  <Td align="right" className="whitespace-nowrap">
                    <RowAction icon={ChartColumn} label={`Scores (${row.scoreCount})`} onClick={() => onView(row)} />
                  </Td>
                </tr>
              ))}
            </TBody>
          </Table>
        </div>
      )}
    </Card>
  );
}

function StudentScores({ row, classroomId, onClose, onChanged, onAdd, onEdit }) {
  const open = Boolean(row);
  // `row` is replaced whenever the gradebook reloads, which refetches this list too.
  const scores = useApiQuery(
    () => (open ? scoreService.list({ classroomId, studentId: row.student.id }) : Promise.resolve(null)),
    [row, classroomId],
  );
  const [toDelete, setToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const remove = async () => {
    setIsDeleting(true);
    try {
      await scoreService.remove(toDelete.id);
      toast.success('Score deleted.');
      setToDelete(null);
      onChanged();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Modal open={open} onClose={onClose} title={row ? studentName(row.student) : ''} description={row ? `${row.student.studentId} · all recorded scores` : undefined} size="max-w-3xl">
        {/* Children are built even while closing, so guard on `row` too. */}
        {!row || !scores.data ? (
          <div className="flex justify-center py-10 text-indigo-600">
            <Spinner className="size-6" />
          </div>
        ) : (
          <div className="space-y-5">
            {GRADING_PERIODS.map((period) => {
              const items = scores.data.filter((score) => score.period === period.value);
              return (
                <section key={period.value}>
                  <h3 className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-900">
                    {period.label}
                    <span className="font-normal text-slate-600">Grade: {formatGrade(row[period.value])}</span>
                  </h3>
                  {items.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-slate-300 px-3 py-3 text-sm text-slate-600">No scores yet.</p>
                  ) : (
                    <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                      {items.map((score) => (
                        <li key={score.id} className="flex flex-wrap items-center gap-3 px-3 py-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-900">{score.title}</p>
                            <p className="text-xs text-slate-600">
                              <Badge className="mr-1">{labelOf(SCORE_CATEGORIES, score.category)}</Badge>
                              {formatDate(score.date)}
                              {score.remarks && ` · ${score.remarks}`}
                            </p>
                          </div>
                          <p className="text-sm font-semibold tabular-nums text-slate-900">
                            {score.score}/{score.maximumScore}
                            <span className="ml-1 font-normal text-slate-600">({Math.round((score.score / score.maximumScore) * 100)}%)</span>
                          </p>
                          <div className="flex">
                            <RowAction icon={Pencil} label="Edit" onClick={() => onEdit(score)} />
                            <RowAction icon={Trash2} label="Delete" tone="danger" onClick={() => setToDelete(score)} />
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              );
            })}
            <div className="flex justify-end border-t border-slate-100 pt-4">
              <Button onClick={() => onAdd(row.student.id)}>
                <Plus className="size-4" aria-hidden="true" />
                Add score for this student
              </Button>
            </div>
          </div>
        )}
      </Modal>
      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete this score?"
        message={toDelete && `“${toDelete.title}” (${toDelete.score}/${toDelete.maximumScore}) will be removed and the grade recomputed.`}
        confirmLabel="Delete score"
        isLoading={isDeleting}
        onConfirm={remove}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}

// An empty input must be an error, not 0.
const requiredNumber = z.preprocess(
  (value) => (value === '' || value == null ? undefined : Number(value)),
  z.number({ error: 'Enter a number' }),
);

const scoreSchema = z
  .object({
    studentId: z.string().min(1, 'Choose a student'),
    period: z.enum(['prelim', 'midterm', 'final']),
    category: z.enum(SCORE_CATEGORIES.map((c) => c.value)),
    title: z.string().trim().min(1, 'Title is required').max(80),
    score: requiredNumber.pipe(z.number().min(0, 'Cannot be negative')),
    maximumScore: requiredNumber.pipe(z.number().positive('Must be more than 0').max(1000)),
    date: z.string().min(1, 'Choose a date'),
    remarks: z.string().trim().max(300),
  })
  .refine((data) => data.score <= data.maximumScore, { message: 'Cannot be higher than the maximum', path: ['score'] });

function ScoreForm({ state, classroomId, rows, onClose, onSaved }) {
  const open = Boolean(state);
  const editing = state?.score;
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(scoreSchema) });

  useEffect(() => {
    if (!open) return;
    reset(
      editing
        ? {
            studentId: editing.studentId,
            period: editing.period,
            category: editing.category,
            title: editing.title,
            score: editing.score,
            maximumScore: editing.maximumScore,
            date: toDateKey(editing.date),
            remarks: editing.remarks ?? '',
          }
        : { studentId: state.studentId ?? '', period: 'prelim', category: 'quiz', title: '', score: '', maximumScore: 100, date: toDateKey(new Date()), remarks: '' },
    );
  }, [open, editing, state, reset]);

  const save = async ({ studentId, ...values }) => {
    try {
      if (editing) await scoreService.update(editing.id, values);
      else await scoreService.create({ ...values, studentId, classroomId });
      toast.success(editing ? 'Score updated.' : 'Score recorded.');
      onSaved();
    } catch (error) {
      if (!applyFieldErrors(error, setError)) toast.error(getErrorMessage(error));
    }
  };

  const close = () => !isSubmitting && onClose();

  return (
    <Modal open={open} onClose={close} title={editing ? 'Edit score' : 'Add score'} size="max-w-xl">
      <form onSubmit={handleSubmit(save)} noValidate className="space-y-4">
        <SelectField
          id="score-student"
          label="Student"
          disabled={Boolean(editing)}
          error={errors.studentId?.message}
          options={[{ value: '', label: 'Choose a student…' }, ...rows.map((row) => ({ value: row.student.id, label: `${studentName(row.student)} (${row.student.studentId})` }))]}
          {...register('studentId')}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField id="score-period" label="Grading period" options={GRADING_PERIODS} error={errors.period?.message} {...register('period')} />
          <SelectField id="score-category" label="Category" options={SCORE_CATEGORIES} error={errors.category?.message} {...register('category')} />
        </div>
        <TextField id="score-title" label="Title" placeholder="e.g. Quiz 2 or Prelim Examination" autoComplete="off" error={errors.title?.message} {...register('title')} />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <TextField id="score-value" label="Score" type="number" min={0} step="any" error={errors.score?.message} {...register('score')} />
          <TextField id="score-max" label="Out of" type="number" min={1} step="any" error={errors.maximumScore?.message} {...register('maximumScore')} />
          <TextField id="score-date" label="Date" type="date" className="col-span-2 sm:col-span-1" error={errors.date?.message} {...register('date')} />
        </div>
        <TextAreaField id="score-remarks" label="Remarks (optional)" rows={2} maxLength={300} error={errors.remarks?.message} {...register('remarks')} />
        <FormActions onCancel={close} isSubmitting={isSubmitting} submitLabel={editing ? 'Save changes' : 'Record score'} />
      </form>
    </Modal>
  );
}
