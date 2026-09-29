import { Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { classroomService, studentService } from '../../services/academic.service.js';
import { getErrorMessage } from '../../utils/errors.js';
import Button from '../common/Button.jsx';
import Modal from '../common/Modal.jsx';
import SearchInput from '../common/SearchInput.jsx';
import Spinner from '../common/Spinner.jsx';

const name = (student) => `${student.lastName}, ${student.firstName}`;

/** Add or remove students from a class. Used by admins and by the class's teacher. */
export default function ClassroomStudentsModal({ classroom, onClose, onSaved }) {
  const open = Boolean(classroom);
  const [students, setStudents] = useState(null);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setStudents(null);
    setSearch('');
    setResults([]);
    classroomService
      .get(classroom.id)
      .then((detail) => setStudents(detail.students))
      .catch((error) => {
        toast.error(getErrorMessage(error));
        onClose();
      });
  }, [open, classroom?.id]);

  useEffect(() => {
    const term = search.trim();
    if (term.length < 2) {
      setResults([]);
      return undefined;
    }
    setIsSearching(true);
    const timer = setTimeout(() => {
      studentService
        .lookup(term)
        .then(setResults)
        .catch(() => setResults([]))
        .finally(() => setIsSearching(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const enrolledIds = new Set((students ?? []).map((student) => student.id));
  const add = (student) => setStudents((current) => [...current, student].sort((a, b) => name(a).localeCompare(name(b))));
  const remove = (id) => setStudents((current) => current.filter((student) => student.id !== id));

  const save = async () => {
    setIsSaving(true);
    try {
      await classroomService.setStudents(
        classroom.id,
        students.map((student) => student.id),
      );
      toast.success('Class list saved.');
      onSaved();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const close = () => !isSaving && onClose();

  return (
    <Modal
      open={open}
      onClose={close}
      title="Class list"
      description={classroom ? `${classroom.subject?.code} · ${classroom.section}` : undefined}
      size="max-w-2xl"
    >
      {students === null ? (
        <div className="flex justify-center py-10 text-indigo-600">
          <Spinner className="size-6" />
        </div>
      ) : (
        <div className="space-y-5">
          <div>
            <SearchInput
              id="classroom-student-search"
              label="Find a student to add"
              value={search}
              onChange={setSearch}
              placeholder="Add a student: type a name or student ID"
            />
            {search.trim().length >= 2 && (
              <ul className="mt-2 max-h-48 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-200">
                {isSearching && results.length === 0 ? (
                  <li className="px-3 py-3 text-sm text-slate-600">Searching…</li>
                ) : results.length === 0 ? (
                  <li className="px-3 py-3 text-sm text-slate-600">No active students match “{search.trim()}”.</li>
                ) : (
                  results.map((student) => (
                    <li key={student.id} className="flex items-center gap-3 px-3 py-2">
                      <span className="min-w-0 flex-1 text-sm">
                        <span className="font-medium text-slate-900">{name(student)}</span>
                        <span className="block text-xs text-slate-600">
                          {student.studentId} · {student.section}
                        </span>
                      </span>
                      {enrolledIds.has(student.id) ? (
                        <span className="text-xs font-medium text-slate-600">In class</span>
                      ) : (
                        <Button variant="secondary" className="px-2.5 py-1" onClick={() => add(student)}>
                          <Plus className="size-4" aria-hidden="true" />
                          Add
                        </Button>
                      )}
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-900">
              Enrolled <span className="font-normal text-slate-600">({students.length})</span>
            </p>
            {students.length === 0 ? (
              <p className="rounded-lg border border-dashed border-slate-300 px-3 py-6 text-center text-sm text-slate-600">No students yet. Search above to add some.</p>
            ) : (
              <ul className="max-h-72 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-200">
                {students.map((student) => (
                  <li key={student.id} className="flex items-center gap-3 px-3 py-2">
                    <span className="min-w-0 flex-1 text-sm">
                      <span className="font-medium text-slate-900">{name(student)}</span>
                      <span className="block text-xs text-slate-600">
                        {student.studentId} · {student.section}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => remove(student.id)}
                      className="rounded-md p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-700"
                      aria-label={`Remove ${student.firstName} ${student.lastName}`}
                    >
                      <X className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-2 text-xs text-slate-600">Removing a student keeps any scores already recorded for them.</p>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={close} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={save} isLoading={isSaving}>
              Save class list
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
