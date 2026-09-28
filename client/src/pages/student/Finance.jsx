import { Banknote, CalendarClock, CircleDollarSign, Download, HandCoins, Info, Landmark } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button.jsx';
import Card, { CardBody, CardHeader } from '../../components/common/Card.jsx';
import Modal from '../../components/common/Modal.jsx';
import PageHeader from '../../components/common/PageHeader.jsx';
import ProgressBar from '../../components/common/ProgressBar.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import { QueryState } from '../../components/common/States.jsx';
import { Table, TBody, Td, Th } from '../../components/common/Table.jsx';
import StatusBadge from '../../components/student/StatusBadges.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useStudentData } from '../../hooks/useStudentData.js';
import { getFinance, getProfile } from '../../services/student.service.js';
import { formatCurrency, formatDate } from '../../utils/format.js';
import { createTextPdf, downloadBlob, SAMPLE_FOOTER } from '../../utils/pdf.js';

export default function StudentFinance() {
  const { user } = useAuth();
  const query = useStudentData(() => ({ finance: getFinance(), profile: getProfile(user) }), [user.id]);
  const [showChannels, setShowChannels] = useState(false);

  const downloadStatement = () => {
    const { finance, profile } = query.data;
    const lines = [
      `Student: ${profile.firstName} ${profile.lastName} (${profile.studentId})`,
      `Program: ${profile.programCode} ${profile.yearLevel}, ${profile.section}`,
      `Term: ${profile.semester}, A.Y. ${profile.academicYear}`,
      `Date issued: ${formatDate(new Date())}`,
      '',
      'ASSESSMENT',
      ...finance.assessment.map((item) => `  ${item.label}: ${formatCurrency(item.amount)}`),
      `  Total assessment: ${formatCurrency(finance.total)}`,
      '',
      'PAYMENTS',
      ...finance.payments.map((p) => `  ${formatDate(p.date)}  ${p.description}  ${formatCurrency(p.amount)}  ${p.method}  Ref ${p.reference}`),
      `  Total paid: ${formatCurrency(finance.paid)}`,
      '',
      `REMAINING BALANCE: ${formatCurrency(finance.balance)}`,
      finance.nextDue ? `Next payment: ${formatCurrency(finance.nextDue.amount)} due ${formatDate(finance.nextDue.dueDate)}` : '',
    ];
    downloadBlob(
      createTextPdf({ heading: 'ACCOUNTING OFFICE', title: 'Statement of Account', lines, footer: SAMPLE_FOOTER }),
      `Statement-of-Account-${profile.studentId}.pdf`,
    );
    toast.success('Statement of account downloaded.');
  };

  return (
    <>
      <PageHeader
        title="Finance"
        description="Tuition assessment, payments, and balance for the 1st Semester, A.Y. 2026–2027."
        actions={
          <>
            <Button variant="secondary" onClick={() => setShowChannels(true)}>
              <Info className="size-4" aria-hidden="true" />
              How to pay
            </Button>
            <Button onClick={downloadStatement} disabled={!query.data}>
              <Download className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">Download statement</span>
              <span className="sm:hidden">Statement</span>
            </Button>
          </>
        }
      />

      <QueryState query={query} loadingLabel="Loading your account…">
        {({ finance }) => (
          <>
            <FinanceContent finance={finance} />
            <Modal
              open={showChannels}
              onClose={() => setShowChannels(false)}
              title="How to pay"
              description="Online payment isn't available in the portal. Use any of these channels."
            >
              <ul className="space-y-4">
                {finance.channels.map((channel) => (
                  <li key={channel.name} className="flex gap-3">
                    <Landmark className="mt-0.5 size-5 shrink-0 text-indigo-600" aria-hidden="true" />
                    <div>
                      <p className="font-medium text-slate-900">{channel.name}</p>
                      <p className="text-sm text-slate-600">{channel.details}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex justify-end">
                <Button onClick={() => setShowChannels(false)}>Got it</Button>
              </div>
            </Modal>
          </>
        )}
      </QueryState>
    </>
  );
}

function FinanceContent({ finance }) {
  const paidPercent = Math.round((finance.paid / finance.total) * 100);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total tuition" value={formatCurrency(finance.total)} hint="Total assessment" icon={CircleDollarSign} tone="neutral" />
        <StatCard label="Amount paid" value={formatCurrency(finance.paid)} hint={`${finance.payments.length} payments`} icon={HandCoins} tone="green" />
        <StatCard label="Remaining balance" value={formatCurrency(finance.balance)} hint={`${100 - paidPercent}% of assessment`} icon={Banknote} tone="amber" />
        <StatCard
          label="Next payment due"
          value={finance.nextDue ? formatCurrency(finance.nextDue.amount) : 'None'}
          hint={finance.nextDue ? `${finance.nextDue.label} · ${formatDate(finance.nextDue.dueDate)}` : 'Fully paid'}
          icon={CalendarClock}
          tone="indigo"
        />
      </div>

      <Card>
        <CardBody>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-medium text-slate-900">Payment progress</p>
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-slate-900">{formatCurrency(finance.paid)}</span> of {formatCurrency(finance.total)} ({paidPercent}%)
            </p>
          </div>
          <ProgressBar value={paidPercent} tone="green" label="Tuition paid" className="mt-3 h-3" />
        </CardBody>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Assessment Breakdown" />
          <CardBody>
            <dl className="divide-y divide-slate-100 text-sm">
              {finance.assessment.map((item) => (
                <div key={item.label} className="flex justify-between gap-4 py-2.5">
                  <dt className="text-slate-700">{item.label}</dt>
                  <dd className="shrink-0 tabular-nums text-slate-900">{formatCurrency(item.amount)}</dd>
                </div>
              ))}
              <div className="flex justify-between gap-4 pt-3">
                <dt className="font-semibold text-slate-900">Total assessment</dt>
                <dd className="shrink-0 font-semibold tabular-nums text-slate-900">{formatCurrency(finance.total)}</dd>
              </div>
            </dl>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Installment Schedule" />
          <ul className="divide-y divide-slate-100">
            {finance.installments.map((installment) => (
              <li key={installment.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900">{installment.label}</p>
                  <p className="text-xs text-slate-600">Due {formatDate(installment.dueDate)}</p>
                </div>
                <p className="text-sm font-semibold tabular-nums text-slate-900">{formatCurrency(installment.amount)}</p>
                <StatusBadge kind="payment" status={installment.status} />
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card>
        <CardHeader title="Payment History" description="Payments posted to your account" />
        <Table caption="Payment history" minWidth="min-w-[760px]">
          <thead>
            <tr>
              <Th>Date</Th>
              <Th>Description</Th>
              <Th align="right">Amount</Th>
              <Th>Payment method</Th>
              <Th>Reference no.</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <TBody>
            {finance.payments.map((payment) => (
              <tr key={payment.id} className="hover:bg-slate-50">
                <Td className="whitespace-nowrap font-medium text-slate-900">{formatDate(payment.date)}</Td>
                <Td>{payment.description}</Td>
                <Td align="right" className="whitespace-nowrap font-medium text-slate-900">
                  {formatCurrency(payment.amount)}
                </Td>
                <Td className="whitespace-nowrap">{payment.method}</Td>
                <Td className="whitespace-nowrap font-mono text-xs">{payment.reference}</Td>
                <Td>
                  <StatusBadge kind="payment" status={payment.status} />
                </Td>
              </tr>
            ))}
          </TBody>
        </Table>
      </Card>
    </div>
  );
}
