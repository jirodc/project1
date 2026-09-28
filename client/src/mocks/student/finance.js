import { addDays, toDateKey } from '../../utils/dates.js';
import { SEMESTER_START, daysFromToday } from './calendar.js';

export const assessment = [
  { label: 'Tuition fee (24 units × ₱1,450.00)', amount: 34_800 },
  { label: 'Miscellaneous fees', amount: 5_200 },
  { label: 'Laboratory fees (IT301, IT302, IT307)', amount: 4_000 },
  { label: 'Other fees (ID validation, library, athletics)', amount: 1_000 },
];

export const installments = [
  { id: 'dp', label: 'Down payment (upon enrollment)', amount: 15_000, dueDate: addDays(SEMESTER_START, -7).toISOString() },
  { id: 'prelim', label: 'Prelim installment', amount: 10_000, dueDate: addDays(SEMESTER_START, 28).toISOString() },
  { id: 'midterm', label: 'Midterm installment', amount: 11_500, dueDate: daysFromToday(12).toISOString() },
  { id: 'finals', label: 'Final installment', amount: 8_500, dueDate: daysFromToday(38).toISOString() },
];

const compact = (date) => toDateKey(date).replaceAll('-', '');

const downPaymentDate = addDays(SEMESTER_START, -9);
const prelimPaymentDate = addDays(SEMESTER_START, 25);
const midtermPaymentDate = daysFromToday(-4);

export const payments = [
  {
    id: 'pay-3',
    date: midtermPaymentDate.toISOString(),
    description: 'Midterm installment',
    amount: 11_500,
    method: 'BPI Online Banking',
    reference: `BPI-${compact(midtermPaymentDate)}-5521`,
    status: 'Paid',
  },
  {
    id: 'pay-2',
    date: prelimPaymentDate.toISOString(),
    description: 'Prelim installment',
    amount: 10_000,
    method: 'GCash',
    reference: `GC-${compact(prelimPaymentDate)}-1234`,
    status: 'Paid',
  },
  {
    id: 'pay-1',
    date: downPaymentDate.toISOString(),
    description: 'Down payment',
    amount: 15_000,
    method: 'Cash (Cashier’s Office)',
    reference: 'OR-0045871',
    status: 'Paid',
  },
];

export const paymentChannels = [
  {
    name: 'Cashier’s Office',
    details: 'Ground floor, Administration Building. Monday to Saturday, 8:00 AM – 5:00 PM. Cash, debit, or credit card.',
  },
  {
    name: 'GCash / Maya',
    details: 'Pay Bills → Schools → select the university. Use your Student ID (2026-001234) as the reference number.',
  },
  {
    name: 'Online banking (BPI, BDO)',
    details: 'Add the university as a biller and use your Student ID as the reference number. Posting takes 1–2 banking days.',
  },
  {
    name: 'Over-the-counter bank deposit',
    details: 'Deposit to the university account at any BPI branch and email the deposit slip to accounting@univ.edu.ph.',
  },
];
