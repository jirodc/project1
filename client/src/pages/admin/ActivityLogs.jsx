import { History } from 'lucide-react';
import Badge from '../../components/common/Badge.jsx';
import ListCard from '../../components/common/ListCard.jsx';
import PageHeader from '../../components/common/PageHeader.jsx';
import SearchInput from '../../components/common/SearchInput.jsx';
import { Table, TBody, Td, Th } from '../../components/common/Table.jsx';
import { useListQuery } from '../../hooks/useListQuery.js';
import { adminService } from '../../services/academic.service.js';
import { formatDateTime, formatRelativeTime } from '../../utils/format.js';
import { actionLabel } from '../../utils/activity.js';
import { ROLE_LABELS } from '../../utils/roles.js';

export default function ActivityLogs() {
  const list = useListQuery(adminService.activityLogs, { pageSize: 25 });

  return (
    <>
      <PageHeader title="Activity Logs" description="Who changed what, and when. Entries can't be edited or deleted." />
      <ListCard
        query={list.query}
        onPageChange={list.setPage}
        toolbar={
          <SearchInput
            id="activity-search"
            label="Search activity"
            value={list.search}
            onChange={list.setSearch}
            placeholder="Search actions and details, e.g. “score” or “IT301”"
            className="sm:w-96"
          />
        }
        empty={{ icon: History, title: list.hasFilters ? 'No matching activity' : 'No activity yet' }}
      >
        {(logs) => (
          <Table caption="Activity logs" minWidth="min-w-[820px]">
            <thead>
              <tr>
                <Th>When</Th>
                <Th>User</Th>
                <Th>Action</Th>
                <Th>Details</Th>
              </tr>
            </thead>
            <TBody>
              {logs.map((log) => (
                <tr key={log.id} className="align-top hover:bg-slate-50">
                  <Td className="whitespace-nowrap">
                    <time dateTime={log.createdAt} title={formatDateTime(log.createdAt)}>
                      {formatRelativeTime(log.createdAt)}
                    </time>
                  </Td>
                  <Td className="whitespace-nowrap">
                    {log.actor ? (
                      <>
                        <p className="font-medium text-slate-900">{log.actor.name}</p>
                        <p className="text-xs text-slate-600">{ROLE_LABELS[log.actor.role]}</p>
                      </>
                    ) : (
                      <span className="text-slate-600">System</span>
                    )}
                  </Td>
                  <Td className="whitespace-nowrap">
                    <Badge>{actionLabel(log.action)}</Badge>
                  </Td>
                  <Td className="text-slate-700">{log.description}</Td>
                </tr>
              ))}
            </TBody>
          </Table>
        )}
      </ListCard>
    </>
  );
}
