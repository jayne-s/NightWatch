import type { Media } from '../api';

interface MediaCardProps {
  media: Media;
  viewerName: string;
  onEdit: () => void;
  onDelete: () => void;
}

function formatDate(dateValue: string | null) {
  if (!dateValue) {
    return '—';
  }

  return new Date(`${dateValue}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatStatus(status: Media['status']) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function MediaCard({
  media,
  viewerName,
  onEdit,
  onDelete,
}: MediaCardProps) {
  const comments = media.comments?.trim() || 'No comments yet.';

  return (
    <article className="media-card">
      <div className="media-header">
        <h2 className="media-title">{media.title}</h2>
        <span className={`status-pill ${media.status}`}>{formatStatus(media.status)}</span>
      </div>

      <div className="meta-list">
        <div className="meta-item">
          <strong>Rating</strong>
          <span className="rating">
            {media.rating !== null ? `${media.rating.toFixed(1)} / 5` : 'No rating'}
          </span>
        </div>
        <div className="meta-item">
          <strong>Watcher</strong>
          <span>{viewerName}</span>
        </div>
        <div className="meta-item">
          <strong>Status</strong>
          <span>{formatStatus(media.status)}</span>
        </div>
        <div className="meta-item">
          <strong>Watched</strong>
          <span>{formatDate(media.date_watched)}</span>
        </div>
      </div>

      {media.status === 'stopped' && media.stop_reason ? (
        <div className="meta-item" style={{ marginBottom: '12px' }}>
          <strong>Stop reason</strong>
          <span>{media.stop_reason}</span>
        </div>
      ) : null}

      <div className="comments-box">{comments}</div>

      <div className="card-actions">
        <button type="button" className="secondary-button" onClick={onEdit}>
          Edit
        </button>
        <button type="button" className="danger-button" onClick={onDelete}>
          Delete
        </button>
      </div>
    </article>
  );
}
