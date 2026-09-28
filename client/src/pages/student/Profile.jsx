import { zodResolver } from '@hookform/resolvers/zod';
import { Bell, Camera, Eye, EyeOff, KeyRound, Pencil, Trash2, UserRound } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import Alert from '../../components/common/Alert.jsx';
import Badge from '../../components/common/Badge.jsx';
import Button from '../../components/common/Button.jsx';
import Card, { CardBody, CardHeader } from '../../components/common/Card.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import Modal from '../../components/common/Modal.jsx';
import PageHeader from '../../components/common/PageHeader.jsx';
import { QueryState } from '../../components/common/States.jsx';
import Switch from '../../components/common/Switch.jsx';
import Tabs from '../../components/common/Tabs.jsx';
import TextField, { TextAreaField } from '../../components/common/TextField.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useStudentData } from '../../hooks/useStudentData.js';
import { NOTIFICATION_TYPES } from '../../mocks/student/notifications.js';
import { authService } from '../../services/auth.service.js';
import { getProfile, updatePhoto, updatePreferences, updateProfile } from '../../services/student.service.js';
import { getErrorMessage } from '../../utils/errors.js';
import { formatLongDate } from '../../utils/format.js';

const TABS = [
  { value: 'profile', label: 'Profile', icon: UserRound },
  { value: 'account', label: 'Account settings', icon: KeyRound },
  { value: 'notifications', label: 'Notification preferences', icon: Bell },
];

export default function StudentProfile() {
  const { user } = useAuth();
  const query = useStudentData(() => getProfile(user), [user.id]);
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = TABS.some((t) => t.value === searchParams.get('tab')) ? searchParams.get('tab') : 'profile';

  return (
    <>
      <PageHeader title="My Profile" description="Your personal and academic information, account security, and preferences." />
      <Tabs
        label="Profile sections"
        value={tab}
        onChange={(value) => setSearchParams(value === 'profile' ? {} : { tab: value }, { replace: true })}
        tabs={TABS}
        className="mb-6 w-fit"
      />
      <QueryState query={query} loadingLabel="Loading your profile…">
        {(profile) => (
          <>
            {tab === 'profile' && <ProfileTab profile={profile} />}
            {tab === 'account' && <AccountTab profile={profile} />}
            {tab === 'notifications' && <PreferencesTab preferences={profile.preferences} />}
          </>
        )}
      </QueryState>
    </>
  );
}

// ─── Profile tab ──────────────────────────────────────────────────────────

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

/** Center-crops and scales an image file to a small square JPEG data URL. */
async function toAvatarDataUrl(file, size = 256) {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const scale = Math.max(size / bitmap.width, size / bitmap.height);
  const width = bitmap.width * scale;
  const height = bitmap.height * scale;
  canvas.getContext('2d').drawImage(bitmap, (size - width) / 2, (size - height) / 2, width, height);
  return canvas.toDataURL('image/jpeg', 0.85);
}

function InfoList({ items }) {
  return (
    <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
      {items.map(([label, value, wide]) => (
        <div key={label} className={wide ? 'sm:col-span-2' : ''}>
          <dt className="text-sm text-slate-600">{label}</dt>
          <dd className="mt-0.5 wrap-break-word text-sm font-medium text-slate-900">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function ProfileTab({ profile }) {
  const fileInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);
  const [confirmRemovePhoto, setConfirmRemovePhoto] = useState(false);

  const fullName = `${profile.firstName} ${profile.middleName} ${profile.lastName}`;
  const initials = `${profile.firstName[0]}${profile.lastName[0]}`;

  const changePhoto = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file (JPG or PNG).');
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      toast.error('That image is larger than 5 MB. Please choose a smaller one.');
      return;
    }
    setIsSavingPhoto(true);
    try {
      await updatePhoto(await toAvatarDataUrl(file));
      toast.success('Profile photo updated.');
    } catch {
      toast.error("We couldn't read that image. Please try another one.");
    } finally {
      setIsSavingPhoto(false);
    }
  };

  const removePhoto = async () => {
    setIsSavingPhoto(true);
    await updatePhoto(null);
    setIsSavingPhoto(false);
    setConfirmRemovePhoto(false);
    toast.success('Profile photo removed.');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardBody className="flex flex-col gap-5 sm:flex-row sm:items-center">
          {profile.photo ? (
            <img src={profile.photo} alt="Your profile" className="size-24 rounded-full object-cover ring-4 ring-indigo-50" />
          ) : (
            <span className="flex size-24 items-center justify-center rounded-full bg-indigo-100 text-3xl font-semibold text-indigo-700 ring-4 ring-indigo-50">
              {initials}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-semibold text-slate-900">{fullName}</h2>
            <p className="text-sm text-slate-600">
              {profile.studentId} · {profile.program}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge tone="indigo">{profile.section}</Badge>
              <Badge tone="green">{profile.enrollmentStatus}</Badge>
              <Badge>{profile.studentType}</Badge>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={changePhoto} />
            <Button variant="secondary" onClick={() => fileInputRef.current.click()} isLoading={isSavingPhoto}>
              {!isSavingPhoto && <Camera className="size-4" aria-hidden="true" />}
              {profile.photo ? 'Change photo' : 'Upload photo'}
            </Button>
            {profile.photo && (
              <Button variant="ghost" onClick={() => setConfirmRemovePhoto(true)} disabled={isSavingPhoto}>
                <Trash2 className="size-4" aria-hidden="true" />
                Remove
              </Button>
            )}
          </div>
        </CardBody>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Personal Information"
            action={
              <Button variant="secondary" className="px-3 py-1.5" onClick={() => setIsEditing(true)}>
                <Pencil className="size-4" aria-hidden="true" />
                Edit
              </Button>
            }
          />
          <CardBody>
            <InfoList
              items={[
                ['Full name', fullName],
                ['Student ID', profile.studentId],
                ['Date of birth', formatLongDate(profile.dateOfBirth).replace(/^\w+, /, '')],
                ['Gender', profile.gender],
                ['Email', profile.email],
                ['Contact number', profile.contactNumber],
                ['Address', profile.address, true],
                ['Emergency contact', `${profile.guardian.name} (${profile.guardian.relationship}) · ${profile.guardian.contactNumber}`, true],
              ]}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Academic Information" description="Managed by the Office of the University Registrar" />
          <CardBody>
            <InfoList
              items={[
                ['Program', profile.program, true],
                ['College', profile.college, true],
                ['Year level', profile.yearLevel],
                ['Section', profile.section],
                ['Academic year', profile.academicYear],
                ['Semester', profile.semester],
                ['Adviser', profile.adviser],
                ['Student type', profile.studentType],
              ]}
            />
            <p className="mt-5 text-xs text-slate-600">
              To correct your academic records, visit the Registrar's Office with a valid ID.
            </p>
          </CardBody>
        </Card>
      </div>

      <EditPersonalInfo open={isEditing} onClose={() => setIsEditing(false)} profile={profile} />

      <ConfirmDialog
        open={confirmRemovePhoto}
        title="Remove profile photo?"
        message="Your initials will be shown instead. You can upload a new photo anytime."
        confirmLabel="Remove photo"
        isLoading={isSavingPhoto}
        onConfirm={removePhoto}
        onCancel={() => setConfirmRemovePhoto(false)}
      />
    </div>
  );
}

// Philippine mobile numbers: 09XX XXX XXXX or +63 9XX XXX XXXX.
const phMobile = z
  .string()
  .trim()
  .refine((value) => /^(09|\+639)\d{9}$/.test(value.replace(/[\s-]/g, '')), 'Enter a valid mobile number, e.g. 0917 555 0142');

const personalInfoSchema = z.object({
  contactNumber: phMobile,
  address: z.string().trim().min(10, 'Enter your complete address').max(200, 'Keep it under 200 characters'),
});

function EditPersonalInfo({ open, onClose, profile }) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({ resolver: zodResolver(personalInfoSchema) });

  useEffect(() => {
    if (open) reset({ contactNumber: profile.contactNumber, address: profile.address });
  }, [open, profile.contactNumber, profile.address, reset]);

  const close = () => {
    if (!isSubmitting) onClose();
  };

  const save = async (values) => {
    await updateProfile(values);
    toast.success('Personal information updated.');
    onClose();
  };

  return (
    <Modal open={open} onClose={close} title="Edit personal information" description="Other details can only be changed by the Registrar.">
      <form onSubmit={handleSubmit(save)} noValidate className="space-y-5">
        <TextField id="edit-contact" label="Contact number" type="tel" autoComplete="tel" error={errors.contactNumber?.message} {...register('contactNumber')} />
        <TextAreaField
          id="edit-address"
          label="Address"
          rows={3}
          maxLength={200}
          count={watch('address')?.length ?? 0}
          error={errors.address?.message}
          {...register('address')}
        />
        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={close} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting} disabled={!isDirty}>
            Save changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ─── Account settings tab ─────────────────────────────────────────────────

const recoveryEmailSchema = z.object({
  recoveryEmail: z.string().trim().toLowerCase().pipe(z.email('Enter a valid email address')),
});

// Mirrors the server's password policy so most mistakes are caught before submitting.
const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword: z
      .string()
      .min(8, 'Use at least 8 characters')
      .max(72, 'Use at most 72 characters')
      .regex(/[A-Za-z]/, 'Include at least one letter')
      .regex(/\d/, 'Include at least one number'),
    confirmPassword: z.string().min(1, 'Confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: 'Choose a password different from your current one',
    path: ['newPassword'],
  });

function PasswordToggle({ shown, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="rounded-md p-1.5 text-slate-500 hover:text-slate-700"
      aria-label={shown ? 'Hide passwords' : 'Show passwords'}
    >
      {shown ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
    </button>
  );
}

function AccountTab({ profile }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <RecoveryEmailCard profile={profile} />
      <ChangePasswordCard />
    </div>
  );
}

function RecoveryEmailCard({ profile }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({ resolver: zodResolver(recoveryEmailSchema), defaultValues: { recoveryEmail: profile.recoveryEmail } });

  const save = async (values) => {
    await updateProfile(values);
    reset(values);
    toast.success('Recovery email updated.');
  };

  return (
    <Card className="self-start">
      <CardHeader title="Sign-in" description="How you access the student portal" />
      <CardBody>
        <dl>
          <dt className="text-sm text-slate-600">Login email</dt>
          <dd className="mt-0.5 text-sm font-medium text-slate-900">{profile.email}</dd>
        </dl>
        <p className="mt-1 text-xs text-slate-600">Your university email can't be changed.</p>

        <form onSubmit={handleSubmit(save)} noValidate className="mt-6 space-y-4">
          <TextField
            id="recovery-email"
            label="Recovery email"
            type="email"
            autoComplete="email"
            error={errors.recoveryEmail?.message}
            {...register('recoveryEmail')}
          />
          <p className="text-xs text-slate-600">Used to help you recover your account. We never share it.</p>
          <Button type="submit" isLoading={isSubmitting} disabled={!isDirty}>
            Save recovery email
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}

function ChangePasswordCard() {
  const [showPasswords, setShowPasswords] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const submit = async ({ currentPassword, newPassword }) => {
    setServerError('');
    try {
      await authService.changePassword({ currentPassword, newPassword });
      reset();
      toast.success('Password changed. Use your new password next time you sign in.');
    } catch (error) {
      const details = error.response?.data?.details;
      if (details?.length) {
        details.forEach(({ field, message }) => setError(field, { message }));
      } else {
        setServerError(getErrorMessage(error, 'Unable to change your password. Please try again.'));
      }
    }
  };

  const type = showPasswords ? 'text' : 'password';
  const toggle = <PasswordToggle shown={showPasswords} onToggle={() => setShowPasswords((shown) => !shown)} />;

  return (
    <Card>
      <CardHeader title="Change Password" description="Use at least 8 characters with letters and numbers." />
      <CardBody>
        <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
          {serverError && <Alert tone="error">{serverError}</Alert>}
          <TextField
            id="current-password"
            label="Current password"
            type={type}
            autoComplete="current-password"
            trailing={toggle}
            error={errors.currentPassword?.message}
            {...register('currentPassword')}
          />
          <TextField
            id="new-password"
            label="New password"
            type={type}
            autoComplete="new-password"
            error={errors.newPassword?.message}
            {...register('newPassword')}
          />
          <TextField
            id="confirm-password"
            label="Confirm new password"
            type={type}
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          <Button type="submit" isLoading={isSubmitting}>
            Change password
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}

// ─── Notification preferences tab ────────────────────────────────────────

const CHANNELS = [
  { key: 'email', label: 'Email' },
  { key: 'sms', label: 'SMS' },
];

function PreferencesTab({ preferences }) {
  const [draft, setDraft] = useState(preferences);
  const [isSaving, setIsSaving] = useState(false);
  const isDirty = JSON.stringify(draft) !== JSON.stringify(preferences);

  const toggle = (channel, type) => (value) =>
    setDraft((current) => ({ ...current, [channel]: { ...current[channel], [type]: value } }));

  const save = async () => {
    setIsSaving(true);
    await updatePreferences(draft);
    setIsSaving(false);
    toast.success('Notification preferences saved.');
  };

  return (
    <Card>
      <CardHeader
        title="Notification Preferences"
        description="Portal notifications are always on. Choose where else we should reach you."
      />
      <div className="relative overflow-x-auto">
        <table className="w-full min-w-105 text-sm">
          <caption className="sr-only">Notification channels by type</caption>
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
              <th scope="col" className="px-5 py-3">Notification</th>
              {CHANNELS.map((channel) => (
                <th key={channel.key} scope="col" className="w-24 px-5 py-3 text-center">
                  {channel.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {Object.entries(NOTIFICATION_TYPES).map(([type, label]) => (
              <tr key={type}>
                <th scope="row" className="px-5 py-3.5 text-left font-medium text-slate-900">
                  {label}
                </th>
                {CHANNELS.map((channel) => (
                  <td key={channel.key} className="px-5 py-3.5 text-center">
                    <Switch
                      id={`pref-${channel.key}-${type}`}
                      label={`${label} by ${channel.label}`}
                      hideLabel
                      checked={draft[channel.key][type]}
                      onChange={toggle(channel.key, type)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col-reverse gap-2 border-t border-slate-100 px-5 py-4 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={() => setDraft(preferences)} disabled={!isDirty || isSaving}>
          Discard changes
        </Button>
        <Button onClick={save} isLoading={isSaving} disabled={!isDirty}>
          Save preferences
        </Button>
      </div>
    </Card>
  );
}
