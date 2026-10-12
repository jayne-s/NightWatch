import type { WatchStatus } from '../api';

interface StatusFilterProps {
  status: WatchStatus | 'all';
  viewerId: number | 'all';
  viewers: { id: number; name: string }[];
  onStatusChange: (value: WatchStatus | 'all') => void;
  onViewerChange: (value: number | 'all') => void;
}

const statusOptions: Array<{ value: WatchStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All statuses' },
  { value: 'unwatched', label: 'Unwatched' },
  { value: 'planned', label: 'Planned' },
  { value: 'watched', label: 'Watched' },
  { value: 'stopped', label: 'Stopped' },
];

export default function StatusFilter({
  status,
  viewerId,
  viewers,
  onStatusChange,
  onViewerChange,
}: StatusFilterProps) {
  return (
    <div className="filter-panel">
      <label className="filter-label">Filter collection</label>
      <div className="filter-controls">
        <div>
          <label className="filter-label" htmlFor="status-filter">
            Status
          </label>
          <select
            id="status-filter"
            className="filter-select"
            value={status}
            onChange={(event) => onStatusChange(event.target.value as WatchStatus | 'all')}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="filter-label" htmlFor="viewer-filter">
            Viewer
          </label>
          <select
            id="viewer-filter"
            className="filter-select"
            value={String(viewerId)}
            onChange={(event) =>
              onViewerChange(
                event.target.value === 'all' ? 'all' : Number(event.target.value),
              )
            }
          >
            <option value="all">All viewers</option>
            {viewers.map((viewer) => (
              <option key={viewer.id} value={viewer.id}>
                {viewer.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
