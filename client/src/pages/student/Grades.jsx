import { BookCheck, CircleCheck, CircleX, GraduationCap, History, Info, SearchX } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import Card, { CardBody, CardHeader } from '../../components/common/Card.jsx';
import PageHeader from '../../components/common/PageHeader.jsx';
import SelectField from '../../components/common/SelectField.jsx';
import StatCard from '../../components/common/StatCard.jsx';
import { EmptyState, QueryState } from '../../components/common/States.jsx';
import { Table, TBody, Td, Th } from '../../components/common/Table.jsx';
import GwaTrendChart from '../../components/student/GwaTrendChart.jsx';
import StatusBadge from '../../components/student/StatusBadges.jsx';
import { useStudentData } from '../../hooks/useStudentData.js';
import { getGrades } from '../../services/student.service.js';

const SEMESTERS = ['1st Semester', '2nd Semester'];
const dash = (value) => (value == null ? '—' : value);

export default function StudentGrades() {
  const query = useStudentData(getGrades);

  return (
    <>
      <PageHeader title="Grades" description="Your grades per semester and overall academic standing." />
      <QueryState query={query} loadingLabel="Loading grades…">
        {(data) => <GradesContent data={data} />}
      </QueryState>
    </>
  );
}

function GradesContent({ data }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const termId = searchParams.get('term') ?? data.currentTermId;
  const [academicYear, semester] = (() => {
    const term = data.terms.find((t) => t.id === termId);
    if (term) return [term.academicYear, term.semester];
    // "2026-2027-2" style ids for semesters with no grades yet
    const [start, end, sem] = termId.split('-');
    return [`${start}–${end}`, SEMESTERS[Number(sem) - 1] ?? SEMESTERS[0]];
  })();

  const years = [...new Set(data.terms.map((t) => t.academicYear))];
  const selectTerm = (year, sem) => {
    const [start, end] = year.split('–');
    setSearchParams({ term: `${start}-${end}-${SEMESTERS.indexOf(sem) + 1}` }, { replace: true });
  };

  const term = data.terms.find((t) => t.academicYear === academicYear && t.semester === semester);
  const { summary } = data;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        <StatCard label="Current GPA" value={summary.currentGpa.toFixed(2)} hint="Cumulative GWA" icon={GraduationCap} tone="indigo" />
        <StatCard
          label="Previous GPA"
          value={summary.previousGpa?.toFixed(2) ?? '—'}
          hint={summary.previousTermLabel?.replace('Semester, A.Y.', 'Sem')}
          icon={History}
          tone="blue"
        />
        <StatCard label="Total units" value={summary.totalUnits} hint="Units earned" icon={BookCheck} tone="violet" />
        <StatCard label="Passed subjects" value={summary.passed} icon={CircleCheck} tone="green" />
        <StatCard label="Failed subjects" value={summary.failed} icon={CircleX} tone={summary.failed ? 'red' : 'neutral'} />
      </div>

      <Card>
        <CardHeader
          title="Semester Grades"
          description={term ? term.label : `${semester}, A.Y. ${academicYear}`}
        />
        <div className="grid gap-4 border-b border-slate-100 p-5 sm:max-w-xl sm:grid-cols-2">
          <SelectField
            id="grades-year"
            label="Academic year"
            value={academicYear}
            onChange={(e) => selectTerm(e.target.value, semester)}
            options={years.map((year) => ({ value: year, label: `A.Y. ${year}` }))}
          />
          <SelectField
            id="grades-semester"
            label="Semester"
            value={semester}
            onChange={(e) => selectTerm(academicYear, e.target.value)}
            options={SEMESTERS.map((s) => ({ value: s, label: s }))}
          />
        </div>

        {!term ? (
          <div className="p-5">
            <EmptyState
              icon={SearchX}
              title="No grades for this semester"
              description="You were not enrolled in this semester, or grades have not been released yet."
            />
          </div>
        ) : (
          <>
            <Table caption={`Grades for ${term.label}`} minWidth="min-w-[860px]">
              <thead>
                <tr>
                  <Th>Code</Th>
                  <Th>Subject</Th>
                  <Th align="center">Units</Th>
                  <Th align="center">Prelim</Th>
                  <Th align="center">Midterm</Th>
                  <Th align="center">Final</Th>
                  <Th align="center">Final rating</Th>
                  <Th>Remarks</Th>
                </tr>
              </thead>
              <TBody>
                {term.rows.map((row) => (
                  <tr key={row.code} className="hover:bg-slate-50">
                    <Td className="whitespace-nowrap font-medium text-slate-900">{row.code}</Td>
                    <Td className="min-w-56">{row.name}</Td>
                    <Td align="center">{row.units}</Td>
                    <Td align="center">{dash(row.prelim)}</Td>
                    <Td align="center">{dash(row.midterm)}</Td>
                    <Td align="center">{dash(row.final)}</Td>
                    <Td align="center" className="whitespace-nowrap font-semibold text-slate-900">
                      {row.rating == null ? '—' : `${row.rating} (${row.point.toFixed(2)})`}
                    </Td>
                    <Td>
                      <StatusBadge kind="grade" status={row.remarks} />
                    </Td>
                  </tr>
                ))}
              </TBody>
              <tfoot className="border-t border-slate-200 bg-slate-50 text-sm">
                <tr>
                  <td colSpan={2} className="px-4 py-3 font-medium text-slate-900">
                    Total units
                  </td>
                  <td className="px-4 py-3 text-center font-semibold tabular-nums text-slate-900">{term.units}</td>
                  <td colSpan={3} className="px-4 py-3 text-right font-medium text-slate-900">
                    Semester GWA
                  </td>
                  <td className="px-4 py-3 text-center font-semibold tabular-nums text-slate-900">
                    {term.gwa?.toFixed(2) ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{term.complete ? '' : 'Available after finals'}</td>
                </tr>
              </tfoot>
            </Table>
          </>
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="GWA per Semester" description="Your general weighted average across completed semesters" />
          <CardBody>
            <GwaTrendChart terms={data.terms} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Grading System" description="How final ratings are computed" />
          <CardBody>
            <p className="flex gap-2 text-sm text-slate-700">
              <Info className="mt-0.5 size-4 shrink-0 text-indigo-600" aria-hidden="true" />
              Final rating = Prelim {data.weights.prelim * 100}% + Midterm {data.weights.midterm * 100}% + Final{' '}
              {data.weights.final * 100}%
            </p>
            <table className="mt-4 w-full text-sm">
              <caption className="sr-only">Grading scale</caption>
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-slate-600">
                  <th scope="col" className="pb-2 font-semibold">Rating</th>
                  <th scope="col" className="pb-2 font-semibold">Grade</th>
                  <th scope="col" className="pb-2 font-semibold">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.scale.map((step) => (
                  <tr key={step.point}>
                    <td className="py-1.5 tabular-nums text-slate-700">
                      {step.min === step.max ? step.min : `${step.min}–${step.max}`}
                    </td>
                    <td className="py-1.5 font-medium tabular-nums text-slate-900">{step.point.toFixed(2)}</td>
                    <td className="py-1.5 text-slate-700">{step.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
