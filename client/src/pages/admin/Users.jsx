import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound, Pencil, UserCheck, UserPlus, Users as UsersIcon, UserX } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';
import Badge from '../../components/common/Badge.jsx';
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
import { useAuth } from '../../hooks/useAuth.js';
import { useListQuery } from '../../hooks/useListQuery.js';
import { userService } from '../../services/academic.service.js';
import { applyFieldErrors, getErrorMessage } from '../../utils/errors.js';
import { formatDate, formatRelativeTime } from '../../utils/format.js';
import { ROLE_LABELS } from '../../utils/roles.js';

const ROLE_TONES = { admin: 'violet', teacher: 'indigo', student: 'blue' };
const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'suspended', label: 'Suspended' },
];

const password = z
  .string()
  .min(8, 'Use at least 8 characters')
  .max(72, 'Use at most 72 characters')
  .regex(/[A-Za-z]/, 'Include a letter')
  .regex(/\d/, 'Include a number');

const userFields = {
  firstName: z.string().trim().min(1, 'First name is required').max(50),
  lastName: z.string().trim().min(1, 'Last name is required').max(50),
  email: z.string().trim().toLowerCase().pipe(z.email('Enter a valid email address')),
  role: z.enum(['admin', 'teacher', 'student']),
  status: z.enum(['active', 'inactive', 'suspended']),
};
const createSchema = z.object({ ...userFields, password });
const editSchema = z.object(userFields);

/** All users, or only teachers when `role="teacher"`. */
export default function Users({ role }) {
  const { user: me } = useAuth();
  const list = useListQuery(userService.list, { filters: { role: role ?? '', status: '' } });
  const [editing, setEditing] = useState(null); // null | 'new' | user
  const [resetting, setResetting] = useState(null);
  const [statusChange, setStatusChange] = useState(null); // { user, status }
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  const title = role === 'teacher' ? 'Teachers' : 'All Users';
  const noun = role === 'teacher' ? 'teacher' : 'user';

  const applyStatusChange = async () => {
    const { user, status } = statusChange;
    setIsChangingStatus(true);
    try {
      if (status === 'inactive') await userService.deactivate(user.id);
      else await userService.update(user.id, { ...pick(user), status });
      toast.success(`${user.firstName} ${user.lastName} is now ${status}.`);
      setStatusChange(null);
      list.query.reload();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsChangingStatus(false);
    }
  };

  return (
    <>
      <PageHeader
        title={title}
        description={role === 'teacher' ? 'Faculty accounts and their access.' : 'Every account that can sign in: administrators, teachers, and students.'}
        actions={
          <Button onClick={() => setEditing('new')}>
            <UserPlus className="size-4" aria-hidden="true" />
            Add {noun}
          </Button>
        }
      />

      <ListCard
        query={list.query}
        onPageChange={list.setPage}
        toolbar={
          <>
            <SearchInput
              id="user-search"
              label={`Search ${title.toLowerCase()}`}
              value={list.search}
              onChange={list.setSearch}
              placeholder="Search by name or email"
              className="sm:w-72"
            />
            {!role && (
              <SelectField
                id="user-role"
                label="Role"
                value={list.filters.role}
                onChange={(e) => list.setFilter('role', e.target.value)}
                options={[{ value: '', label: 'All roles' }, ...['admin', 'teacher', 'student'].map((r) => ({ value: r, label: ROLE_LABELS[r] }))]}
                className="sm:w-44"
              />
            )}
            <SelectField
              id="user-status"
              label="Status"
              value={list.filters.status}
              onChange={(e) => list.setFilter('status', e.target.value)}
              options={[{ value: '', label: 'All statuses' }, ...STATUS_OPTIONS]}
              className="sm:w-44"
            />
          </>
        }
        empty={{
          icon: UsersIcon,
          title: list.hasFilters ? 'No matching users' : `No ${noun}s yet`,
          description: list.hasFilters ? 'Try a different search or filter.' : `Add the first ${noun} to get started.`,
        }}
      >
        {(users) => (
          <Table caption={title} minWidth="min-w-[860px]">
            <thead>
              <tr>
                <Th>Name</Th>
                <Th>Role</Th>
                <Th>Status</Th>
                <Th>Last sign-in</Th>
                <Th>Created</Th>
                <Th align="right">
                  <span className="sr-only">Actions</span>
                </Th>
              </tr>
            </thead>
            <TBody>
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <Td>
                    <p className="font-medium text-slate-900">
                      {user.firstName} {user.lastName}
                      {user.id === me.id && <span className="ml-2 text-xs font-normal text-slate-600">(you)</span>}
                    </p>
                    <p className="text-xs text-slate-600">{user.email}</p>
                  </Td>
                  <Td>
                    <Badge tone={ROLE_TONES[user.role]}>{ROLE_LABELS[user.role]}</Badge>
                  </Td>
                  <Td>
                    <StatusPill status={user.status} />
                  </Td>
                  <Td className="whitespace-nowrap text-slate-600">{user.lastLoginAt ? formatRelativeTime(user.lastLoginAt) : 'Never'}</Td>
                  <Td className="whitespace-nowrap text-slate-600">{formatDate(user.createdAt)}</Td>
                  <Td align="right" className="whitespace-nowrap">
                    <RowAction icon={Pencil} label="Edit" onClick={() => setEditing(user)} />
                    <RowAction icon={KeyRound} label="Reset password" onClick={() => setResetting(user)} />
                    {user.status === 'active' ? (
                      <RowAction
                        icon={UserX}
                        label="Deactivate"
                        tone="danger"
                        disabled={user.id === me.id}
                        onClick={() => setStatusChange({ user, status: 'inactive' })}
                      />
                    ) : (
                      <RowAction icon={UserCheck} label="Activate" tone="success" onClick={() => setStatusChange({ user, status: 'active' })} />
                    )}
                  </Td>
                </tr>
              ))}
            </TBody>
          </Table>
        )}
      </ListCard>

      <UserForm
        user={editing === 'new' ? null : editing}
        open={Boolean(editing)}
        defaultRole={role ?? 'teacher'}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          list.query.reload();
        }}
      />
      <ResetPasswordForm user={resetting} onClose={() => setResetting(null)} />
      <ConfirmDialog
        open={Boolean(statusChange)}
        title={statusChange?.status === 'inactive' ? 'Deactivate this user?' : 'Activate this user?'}
        message={
          statusChange &&
          (statusChange.status === 'inactive'
            ? `Are you sure you want to deactivate ${statusChange.user.firstName} ${statusChange.user.lastName}? They won't be able to sign in until the account is activated again. Their records are kept.`
            : `${statusChange.user.firstName} ${statusChange.user.lastName} will be able to sign in again.`)
        }
        confirmLabel={statusChange?.status === 'inactive' ? 'Deactivate' : 'Activate'}
        isLoading={isChangingStatus}
        onConfirm={applyStatusChange}
        onCancel={() => setStatusChange(null)}
      />
    </>
  );
}

const pick = (user) => ({
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  role: user.role,
  status: user.status,
});

function UserForm({ user, open, defaultRole, onClose, onSaved }) {
  const isNew = !user;
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(isNew ? createSchema : editSchema) });

  useEffect(() => {
    if (open) reset(isNew ? { firstName: '', lastName: '', email: '', role: defaultRole, status: 'active', password: '' } : pick(user));
  }, [open, isNew, user, defaultRole, reset]);

  const save = async (values) => {
    try {
      if (isNew) await userService.create(values);
      else await userService.update(user.id, values);
      toast.success(isNew ? `${values.firstName} ${values.lastName} can now sign in.` : 'User updated.');
      onSaved();
    } catch (error) {
      if (!applyFieldErrors(error, setError)) toast.error(getErrorMessage(error));
    }
  };

  const isStudent = user?.role === 'student';
  const close = () => !isSubmitting && onClose();

  return (
    <Modal open={open} onClose={close} title={isNew ? 'Add user' : 'Edit user'} description={isStudent ? 'Student details like section and program are edited on the Students page.' : undefined}>
      <form onSubmit={handleSubmit(save)} noValidate className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField id="user-first-name" label="First name" autoComplete="off" error={errors.firstName?.message} {...register('firstName')} />
          <TextField id="user-last-name" label="Last name" autoComplete="off" error={errors.lastName?.message} {...register('lastName')} />
        </div>
        <TextField id="user-email" label="Email" type="email" autoComplete="off" error={errors.email?.message} {...register('email')} />
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            id="user-role-field"
            label="Role"
            disabled={isStudent}
            error={errors.role?.message}
            options={isStudent ? [{ value: 'student', label: 'Student' }] : [{ value: 'teacher', label: 'Teacher' }, { value: 'admin', label: 'Administrator' }]}
            {...register('role')}
          />
          <SelectField id="user-status-field" label="Status" error={errors.status?.message} options={STATUS_OPTIONS} {...register('status')} />
        </div>
        {isNew && (
          <TextField
            id="user-password"
            label="Temporary password"
            type="text"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password')}
          />
        )}
        {isNew && <p className="text-xs text-slate-600">Share it securely. The user can change it from their profile after signing in.</p>}
        <FormActions onCancel={close} isSubmitting={isSubmitting} submitLabel={isNew ? 'Create user' : 'Save changes'} />
      </form>
    </Modal>
  );
}

const resetSchema = z
  .object({ newPassword: password, confirmPassword: z.string() })
  .refine((data) => data.newPassword === data.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

function ResetPasswordForm({ user, onClose }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(resetSchema), defaultValues: { newPassword: '', confirmPassword: '' } });

  useEffect(() => {
    if (user) reset({ newPassword: '', confirmPassword: '' });
  }, [user, reset]);

  const save = async ({ newPassword }) => {
    try {
      await userService.resetPassword(user.id, newPassword);
      toast.success(`Password reset for ${user.firstName} ${user.lastName}.`);
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const close = () => !isSubmitting && onClose();

  return (
    <Modal open={Boolean(user)} onClose={close} title="Reset password" description={user ? `Set a new password for ${user.firstName} ${user.lastName}.` : undefined} size="max-w-md">
      <form onSubmit={handleSubmit(save)} noValidate className="space-y-4">
        <TextField id="reset-new" label="New password" type="text" autoComplete="new-password" error={errors.newPassword?.message} {...register('newPassword')} />
        <TextField id="reset-confirm" label="Confirm new password" type="text" autoComplete="new-password" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
        <FormActions onCancel={close} isSubmitting={isSubmitting} submitLabel="Reset password" />
      </form>
    </Modal>
  );
}
