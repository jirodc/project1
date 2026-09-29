import Card from './Card.jsx';
import Pagination from './Pagination.jsx';
import { EmptyState, ErrorState, LoadingState } from './States.jsx';

/**
 * Card for a paginated API list (`{ items, pagination }`): toolbar on top,
 * then loading, error, empty, or `children(items)` plus pagination. While a
 * new page loads the current rows stay visible, dimmed.
 */
export default function ListCard({ toolbar, query, onPageChange, empty, children }) {
  const { status, data, error, reload } = query;
  const refreshing = status === 'loading' && data !== undefined;

  let body;
  if (status === 'error') {
    body = <ErrorState message={error.message} onRetry={reload} className="m-5" />;
  } else if (data === undefined) {
    body = <LoadingState className="m-5 border-0" />;
  } else if (data.items.length === 0) {
    body = <EmptyState {...empty} className="m-5" />;
  } else {
    body = (
      <>
        <div className={`transition-opacity ${refreshing ? 'opacity-60' : ''}`} aria-busy={refreshing}>
          {children(data.items)}
        </div>
        <Pagination
          className="border-t border-slate-200 px-5 py-3"
          pagination={data.pagination}
          itemCount={data.items.length}
          disabled={refreshing}
          onPageChange={onPageChange}
        />
      </>
    );
  }

  return (
    <Card>
      {toolbar && <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:flex-wrap sm:items-end">{toolbar}</div>}
      {body}
    </Card>
  );
}
