import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import type { Viewer, WatchStatus } from '../api';

export interface MediaFormValues {
  title: string;
  date_watched: string | null;
  rating: number | null;
  comments: string;
  viewer_id: number;
  status: WatchStatus;
  stop_reason: string;
}

interface MediaFormModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  viewers: Viewer[];
  initialData?: Partial<MediaFormValues>;
  onClose: () => void;
  onSubmit: (values: MediaFormValues) => Promise<void> | void;
}

function buildDefaultValues(viewers: Viewer[], initialData?: Partial<MediaFormValues>): MediaFormValues {
  const fallbackViewerId = viewers[0]?.id ?? 0;
  const selectedViewerId =
    typeof initialData?.viewer_id === 'number' && initialData.viewer_id > 0
      ? initialData.viewer_id
      : fallbackViewerId;

  return {
    title: initialData?.title ?? '',
    date_watched: initialData?.date_watched ?? '',
    rating: initialData?.rating ?? null,
    comments: initialData?.comments ?? '',
    viewer_id: selectedViewerId,
    status: initialData?.status ?? 'unwatched',
    stop_reason: initialData?.stop_reason ?? '',
  };
}

export default function MediaFormModal({
  open,
  mode,
  viewers,
  initialData,
  onClose,
  onSubmit,
}: MediaFormModalProps) {
  const [formValues, setFormValues] = useState<MediaFormValues>(() =>
    buildDefaultValues(viewers, initialData),
  );
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) {
      return;
    }

    setError('');
    setFormValues(buildDefaultValues(viewers, initialData));
  }, [open, viewers, initialData]);

  if (!open) {
    return null;
  }

  const handleFieldChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;

    setFormValues((current) => ({
      ...current,
      [name]:
        name === 'viewer_id' || name === 'rating'
          ? value === ''
            ? (name === 'viewer_id' ? 0 : null)
            : Number(value)
          : value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formValues.title.trim()) {
      setError('Title is required.');
      return;
    }

    if (!formValues.viewer_id || !viewers.some((viewer) => viewer.id === formValues.viewer_id)) {
      setError('Choose a viewer before saving.');
      return;
    }

    if (formValues.status === 'stopped' && !formValues.stop_reason.trim()) {
      setError('A stop reason is required when the title is stopped.');
      return;
    }

    if (formValues.status === 'watched' && !formValues.date_watched) {
      setError('The watched date is required for completed titles.');
      return;
    }

    await onSubmit({
      ...formValues,
      title: formValues.title.trim(),
      comments: formValues.comments.trim(),
      stop_reason: formValues.stop_reason.trim(),
      rating:
        formValues.rating === null || Number.isNaN(formValues.rating)
          ? null
          : formValues.rating,
      date_watched: formValues.date_watched || null,
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h2>{mode === 'edit' ? 'Edit title' : 'Add a title'}</h2>
          <button type="button" className="close-button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-field-group full-width">
              <label htmlFor="media-title">Title</label>
              <input
                id="media-title"
                className="form-field"
                name="title"
                value={formValues.title}
                onChange={handleFieldChange}
                placeholder="What are you watching?"
              />
            </div>

            <div className="form-field-group">
              <label htmlFor="media-viewer">Watcher</label>
              <select
                id="media-viewer"
                className="form-field"
                name="viewer_id"
                value={formValues.viewer_id}
                onChange={handleFieldChange}
              >
                {viewers.length === 0 ? (
                  <option value={0}>No viewers available</option>
                ) : (
                  viewers.map((viewer) => (
                    <option key={viewer.id} value={viewer.id}>
                      {viewer.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="form-field-group">
              <label htmlFor="media-status">Status</label>
              <select
                id="media-status"
                className="form-field"
                name="status"
                value={formValues.status}
                onChange={handleFieldChange}
              >
                <option value="unwatched">Unwatched</option>
                <option value="planned">Planned</option>
                <option value="watched">Watched</option>
                <option value="stopped">Stopped</option>
              </select>
            </div>

            <div className="form-field-group">
              <label htmlFor="media-rating">Rating</label>
              <input
                id="media-rating"
                className="form-field"
                name="rating"
                type="number"
                min="0"
                max="5"
                step="0.5"
                value={formValues.rating ?? ''}
                onChange={handleFieldChange}
                placeholder="0-5"
              />
            </div>

            <div className="form-field-group">
              <label htmlFor="media-date-watched">Watched date</label>
              <input
                id="media-date-watched"
                className="form-field"
                name="date_watched"
                type="date"
                value={formValues.date_watched ?? ''}
                onChange={handleFieldChange}
              />
            </div>

            <div className="form-field-group full-width">
              <label htmlFor="media-comments">Comments</label>
              <textarea
                id="media-comments"
                className="form-textarea"
                name="comments"
                value={formValues.comments}
                onChange={handleFieldChange}
                placeholder="Notes, reactions, or a quick review"
              />
            </div>

            {formValues.status === 'stopped' ? (
              <div className="form-field-group full-width">
                <label htmlFor="media-stop-reason">Stop reason</label>
                <textarea
                  id="media-stop-reason"
                  className="form-textarea"
                  name="stop_reason"
                  value={formValues.stop_reason}
                  onChange={handleFieldChange}
                  placeholder="Why did you stop?"
                />
              </div>
            ) : null}
          </div>

          {error ? <p className="status-banner error">{error}</p> : null}

          <div className="modal-actions">
            <button type="button" className="modal-button cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="modal-button submit">
              {mode === 'edit' ? 'Save changes' : 'Create record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
