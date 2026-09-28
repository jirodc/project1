import { zodResolver } from '@hookform/resolvers/zod';
import { Download, FilePlus2, FileText, Inbox, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';
import Button from '../../components/common/Button.jsx';
import Card, { CardHeader } from '../../components/common/Card.jsx';
import ConfirmDialog from '../../components/common/ConfirmDialog.jsx';
import Modal from '../../components/common/Modal.jsx';
import PageHeader from '../../components/common/PageHeader.jsx';
import SelectField from '../../components/common/SelectField.jsx';
import { EmptyState, QueryState } from '../../components/common/States.jsx';
import { Table, TBody, Td, Th } from '../../components/common/Table.jsx';
import Tabs from '../../components/common/Tabs.jsx';
import TextField, { TextAreaField } from '../../components/common/TextField.jsx';
import StatusBadge from '../../components/student/StatusBadges.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useStudentData } from '../../hooks/useStudentData.js';
import {
  cancelDocumentRequest,
  getDocuments,
  getProfile,
  requestDocument,
} from '../../services/student.service.js';
import { addDays } from '../../utils/dates.js';
import { formatCurrency, formatDate, formatLongDate } from '../../utils/format.js';
import { createTextPdf, downloadBlob, SAMPLE_FOOTER } from '../../utils/pdf.js';

const NOTES_LIMIT = 300;

const requestSchema = z
  .object({
    type: z.string().min(1, 'Choose a document'),
    purpose: z.string().min(1, 'Choose a purpose'),
    otherPurpose: z.string().trim().max(100, 'Keep it under 100 characters'),
    copies: z.coerce.number().int().min(1, 'At least 1 copy').max(5, 'At most 5 copies'),
    notes: z.string().trim().max(NOTES_LIMIT, `Keep notes under ${NOTES_LIMIT} characters`),
  })
  .refine((data) => data.purpose !== 'Other' || data.otherPurpose.length > 0, {
    message: 'Tell us the purpose',
    path: ['otherPurpose'],
  });

const EMPTY_REQUEST = { type: '', purpose: '', otherPurpose: '', copies: 1, notes: '' };

const TABS = [
  { value: 'all', label: 'All', match: () => true },
  { value: 'active', label: 'In progress', match: (r) => r.status === 'Pending' || r.status === 'Processing' },
  { value: 'ready', label: 'Ready', match: (r) => r.status === 'Ready' },
  { value: 'rejected', label: 'Rejected', match: (r) => r.status === 'Rejected' },
];

function documentLines(request, profile) {
  const name = `${profile.firstName.toUpperCase()} ${profile.middleName[0]}. ${profile.lastName.toUpperCase()}`;
  return [
    'TO WHOM IT MAY CONCERN:',
    '',
    `This is to certify that ${name}, Student ID ${profile.studentId}, is a bona fide student of the ${profile.college}, taking up ${profile.program}, currently in ${profile.yearLevel}, Section ${profile.section}, for the ${profile.semester}, A.Y. ${profile.academicYear}.`,
    '',
    `This certification is issued upon the request of the student for ${request.purpose.toLowerCase()} purposes.`,
    '',
    `Issued on ${formatLongDate(request.processingDate)}.`,
    `Request no. ${request.id.toUpperCase()}`,
    '',
    '',
    'University Registrar',
  ];
}

export default function StudentDocuments() {
  const { user } = useAuth();
  const query = useStudentData(() => ({ ...getDocuments(), profile: getProfile(user) }), [user.id]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [presetType, setPresetType] = useState('');

  const openForm = (type = '') => {
    setPresetType(type);
    setIsFormOpen(true);
  };

  return (
    <>
      <PageHeader
        title="Documents & Requests"
        description="Request official documents from the Registrar and download them when ready."
        actions={
          <Button onClick={() => openForm()}>
            <FilePlus2 className="size-4" aria-hidden="true" />
            New request
          </Button>
        }
      />
      <QueryState query={query} loadingLabel="Loading your requests…">
        {(data) => (
          <>
            <DocumentsContent data={data} onRequest={openForm} />
            <RequestForm
              open={isFormOpen}
              onClose={() => setIsFormOpen(false)}
              catalog={data.catalog}
              purposes={data.purposes}
              presetType={presetType}
            />
          </>
        )}
      </QueryState>
    </>
  );
}

function DocumentsContent({ data, onRequest }) {
  const [tab, setTab] = useState('all');
  const [toCancel, setToCancel] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const filtered = useMemo(() => data.requests.filter(TABS.find((t) => t.value === tab).match), [data.requests, tab]);

  const download = (request) => {
    const fileName = `${request.type.replaceAll(' ', '-')}-${data.profile.studentId}.pdf`;
    downloadBlob(
      createTextPdf({
        heading: 'OFFICE OF THE UNIVERSITY REGISTRAR',
        title: request.type.toUpperCase(),
        lines: documentLines(request, data.profile),
        footer: SAMPLE_FOOTER,
      }),
      fileName,
    );
    toast.success(`Downloading ${fileName}`);
  };

  const confirmCancel = async () => {
    setIsCancelling(true);
    try {
      await cancelDocumentRequest(toCancel.id);
      toast.success(`${toCancel.type} request cancelled.`);
      setToCancel(null);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="My Requests" description={`${data.requests.length} requests`} />
        <div className="border-b border-slate-100 px-5 py-3">
          <Tabs
            label="Filter requests"
            value={tab}
            onChange={setTab}
            tabs={TABS.map((t) => ({ value: t.value, label: t.label, count: data.requests.filter(t.match).length }))}
            className="w-fit"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={Inbox}
              title="No requests here"
              description="Requests you make will show up here with their status."
              action={
                <Button variant="secondary" onClick={() => onRequest()}>
                  New request
                </Button>
              }
            />
          </div>
        ) : (
          <Table caption="Document requests" minWidth="min-w-[860px]">
            <thead>
              <tr>
                <Th>Request</Th>
                <Th>Date requested</Th>
                <Th>Status</Th>
                <Th>Processing date</Th>
                <Th>Remarks</Th>
                <Th align="right">
                  <span className="sr-only">Actions</span>
                </Th>
              </tr>
            </thead>
            <TBody>
              {filtered.map((request) => (
                <tr key={request.id} className="align-top hover:bg-slate-50">
                  <Td>
                    <p className="font-medium text-slate-900">{request.type}</p>
                    <p className="text-xs text-slate-600">
                      {request.id.toUpperCase()} · {request.copies} {request.copies === 1 ? 'copy' : 'copies'} · {request.purpose}
                    </p>
                  </Td>
                  <Td className="whitespace-nowrap">{formatDate(request.requestedAt)}</Td>
                  <Td>
                    <StatusBadge kind="document" status={request.status} />
                  </Td>
                  <Td className="whitespace-nowrap">
                    {request.status === 'Rejected' ? '—' : formatDate(request.processingDate)}
                    {(request.status === 'Pending' || request.status === 'Processing') && (
                      <span className="block text-xs text-slate-600">Estimated</span>
                    )}
                  </Td>
                  <Td className="max-w-64 text-slate-600">{request.remarks}</Td>
                  <Td align="right" className="whitespace-nowrap">
                    {request.status === 'Ready' && (
                      <Button variant="secondary" className="px-3 py-1.5" onClick={() => download(request)}>
                        <Download className="size-4" aria-hidden="true" />
                        Download
                      </Button>
                    )}
                    {request.status === 'Pending' && (
                      <Button variant="dangerGhost" className="px-3 py-1.5" onClick={() => setToCancel(request)}>
                        <X className="size-4" aria-hidden="true" />
                        Cancel
                      </Button>
                    )}
                    {request.status === 'Rejected' && (
                      <Button variant="ghost" className="px-3 py-1.5" onClick={() => onRequest(request.type)}>
                        Request again
                      </Button>
                    )}
                  </Td>
                </tr>
              ))}
            </TBody>
          </Table>
        )}
      </Card>

      <Card>
        <CardHeader title="Available Documents" description="Fees are per copy and payable at the Cashier's Office or via GCash." />
        <ul className="grid gap-px bg-slate-100 sm:grid-cols-2 lg:grid-cols-3">
          {data.catalog.map((doc) => (
            <li key={doc.type} className="flex flex-col bg-white p-5">
              <FileText className="size-5 text-indigo-600" aria-hidden="true" />
              <p className="mt-3 font-medium text-slate-900">{doc.type}</p>
              <p className="mt-1 flex-1 text-sm text-slate-600">{doc.description}</p>
              <p className="mt-3 text-sm text-slate-700">
                <span className="font-semibold text-slate-900">{formatCurrency(doc.fee)}</span> · {doc.processingDays} working{' '}
                {doc.processingDays === 1 ? 'day' : 'days'}
              </p>
              <Button variant="secondary" className="mt-4 w-full" onClick={() => onRequest(doc.type)}>
                Request
              </Button>
            </li>
          ))}
        </ul>
      </Card>

      <ConfirmDialog
        open={Boolean(toCancel)}
        title="Cancel this request?"
        message={toCancel && <p>Your request for a {toCancel.type} ({toCancel.id.toUpperCase()}) will be withdrawn. You can submit a new one anytime.</p>}
        confirmLabel="Yes, cancel request"
        isLoading={isCancelling}
        onConfirm={confirmCancel}
        onCancel={() => setToCancel(null)}
      />
    </div>
  );
}

function RequestForm({ open, onClose, catalog, purposes, presetType }) {
  const [pending, setPending] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({ resolver: zodResolver(requestSchema), defaultValues: EMPTY_REQUEST });

  // Start fresh each time the form opens, pre-selecting the document when
  // opened from a "Request" button.
  useEffect(() => {
    if (open) reset({ ...EMPTY_REQUEST, type: presetType });
  }, [open, presetType, reset]);

  const [type, purpose, copies, notes] = watch(['type', 'purpose', 'copies', 'notes']);
  const selected = catalog.find((doc) => doc.type === type);
  const copyCount = Math.min(Math.max(Number(copies) || 1, 1), 5);

  const close = () => {
    if (!isSubmitting) onClose();
  };

  const submit = async () => {
    setIsSubmitting(true);
    try {
      const request = await requestDocument(pending);
      toast.success(`Request ${request.id.toUpperCase()} submitted. We'll notify you when it's ready.`);
      setPending(null);
      reset(EMPTY_REQUEST);
      onClose();
    } catch (error) {
      toast.error(error.message);
      setPending(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onValid = (values) =>
    setPending({
      type: values.type,
      purpose: values.purpose === 'Other' ? values.otherPurpose : values.purpose,
      copies: values.copies,
      notes: values.notes,
    });

  return (
    <>
      <Modal open={open} onClose={close} title="Request a document" description="The Registrar will process your request once the fee is paid.">
        <form onSubmit={handleSubmit(onValid)} noValidate className="space-y-5">
          <SelectField
            id="request-type"
            label="Document"
            error={errors.type?.message}
            options={[{ value: '', label: 'Select a document…' }, ...catalog.map((doc) => ({ value: doc.type, label: doc.type }))]}
            {...register('type')}
          />
          <div className="grid gap-5 sm:grid-cols-[1fr_8rem]">
            <SelectField
              id="request-purpose"
              label="Purpose"
              error={errors.purpose?.message}
              options={[{ value: '', label: 'Select a purpose…' }, ...purposes.map((p) => ({ value: p, label: p }))]}
              {...register('purpose')}
            />
            <TextField id="request-copies" label="Copies" type="number" min={1} max={5} error={errors.copies?.message} {...register('copies')} />
          </div>
          {purpose === 'Other' && (
            <TextField
              id="request-other-purpose"
              label="Specify purpose"
              maxLength={100}
              error={errors.otherPurpose?.message}
              {...register('otherPurpose')}
            />
          )}
          <TextAreaField
            id="request-notes"
            label="Notes for the Registrar (optional)"
            rows={3}
            maxLength={NOTES_LIMIT}
            count={notes.length}
            error={errors.notes?.message}
            {...register('notes')}
          />

          {selected && (
            <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-950">
              <div className="flex justify-between gap-4">
                <span>
                  {formatCurrency(selected.fee)} × {copyCount} {copyCount === 1 ? 'copy' : 'copies'}
                </span>
                <span className="font-semibold">{formatCurrency(selected.fee * copyCount)}</span>
              </div>
              <p className="mt-1 text-indigo-900">
                Estimated release: {formatDate(addDays(new Date(), selected.processingDays))}
              </p>
            </div>
          )}

          <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={close}>
              Cancel
            </Button>
            <Button type="submit">Submit request</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(pending)}
        title="Submit this request?"
        message={
          pending && (
            <p>
              You're requesting {pending.copies} {pending.copies === 1 ? 'copy' : 'copies'} of a{' '}
              <span className="font-medium text-slate-900">{pending.type}</span> for {pending.purpose.toLowerCase()}.
              {selected && ` The total fee is ${formatCurrency(selected.fee * pending.copies)}.`}
            </p>
          )
        }
        confirmLabel="Submit request"
        isLoading={isSubmitting}
        onConfirm={submit}
        onCancel={() => setPending(null)}
      />
    </>
  );
}
