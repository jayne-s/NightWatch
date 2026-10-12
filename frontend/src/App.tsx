import { useEffect, useMemo, useState } from 'react';
import './App.css';
import MediaCard from './components/MediaCard';
import MediaFormModal, { type MediaFormValues } from './components/MediaFormModal';
import SearchBar from './components/SearchBar';
import StatusFilter from './components/StatusFilter';
import {
  createMedia,
  createViewer,
  deleteMedia,
  deleteViewer,
  getMedia,
  getViewers,
  updateMedia,
  type Media,
  type Viewer,
  type WatchStatus,
} from './api';

const EMPTY_FORM: MediaFormValues = {
  title: '',
  viewer_id: 0,
  status: 'unwatched',
  rating: null,
  date_watched: '',
  comments: '',
  stop_reason: '',
};

function App() {
  const [media, setMedia] = useState<Media[]>([]);
  const [viewers, setViewers] = useState<Viewer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<WatchStatus | 'all'>('all');
  const [viewerFilter, setViewerFilter] = useState<number | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedia, setEditingMedia] = useState<Media | null>(null);
  const [viewerDraft, setViewerDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const viewerMap = useMemo(
    () => Object.fromEntries(viewers.map((viewer) => [viewer.id, viewer.name])),
    [viewers],
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const [viewerResponse, mediaResponse] = await Promise.all([
        getViewers(),
        getMedia({
          q: searchQuery,
          status: statusFilter === 'all' ? '' : statusFilter,
          viewer_id: viewerFilter === 'all' ? '' : viewerFilter,
        }),
      ]);

      setViewers(viewerResponse);
      setMedia(mediaResponse);
      setError(null);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Unable to load the movie tracker right now.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [searchQuery, statusFilter, viewerFilter]);

  const handleOpenCreate = () => {
    setEditingMedia(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Media) => {
    setEditingMedia(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMedia(null);
  };

  const handleSubmit = async (values: MediaFormValues) => {
    if (editingMedia) {
      await updateMedia(editingMedia.id, values);
    } else {
      await createMedia(values);
    }

    await loadData();
    handleCloseModal();
  };

  const handleDelete = async (mediaId: number) => {
    const confirmed = window.confirm('Remove this title from your tracker?');
    if (!confirmed) {
      return;
    }

    await deleteMedia(mediaId);
    setMedia((current) => current.filter((item) => item.id !== mediaId));
  };

  const handleAddViewer = async () => {
    const trimmed = viewerDraft.trim();
    if (!trimmed) {
      setError('Viewer name cannot be blank.');
      return;
    }

    try {
      await createViewer(trimmed);
      setViewerDraft('');
      setError(null);
      await loadData();
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : 'Unable to create viewer.',
      );
    }
  };

  const handleDeleteViewer = async (viewerId: number) => {
    const viewer = viewers.find((entry) => entry.id === viewerId);
    if (!viewer) {
      return;
    }

    const confirmed = window.confirm(`Delete viewer “${viewer.name}”?`);
    if (!confirmed) {
      return;
    }

    try {
      await deleteViewer(viewerId);
      if (viewerFilter === viewerId) {
        setViewerFilter('all');
      }
      await loadData();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : 'Unable to delete viewer.',
      );
    }
  };

  return (
    <div className="dashboard-shell">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Watchlist dashboard</p>
          <h1>NightWatch Tracker</h1>
        </div>
        <button type="button" className="primary-button" onClick={handleOpenCreate}>
          + Add title
        </button>
      </header>

      <section className="toolbar">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
        <StatusFilter
          status={statusFilter}
          viewerId={viewerFilter}
          viewers={viewers}
          onStatusChange={setStatusFilter}
          onViewerChange={setViewerFilter}
        />
      </section>

      <section className="viewer-manager" aria-label="Viewer manager">
        <div className="viewer-manager-header">
          <label className="filter-label" htmlFor="viewer-name-input">
            Manage viewers
          </label>
        </div>
        <div className="viewer-manager-row">
          <input
            id="viewer-name-input"
            className="search-input"
            type="text"
            value={viewerDraft}
            onChange={(event) => setViewerDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                void handleAddViewer();
              }
            }}
            placeholder="Add viewer name"
          />
          <button type="button" className="primary-button" onClick={() => void handleAddViewer()}>
            + Add viewer
          </button>
        </div>

        <div className="viewer-chip-list">
          {viewers.length === 0 ? (
            <span className="viewer-empty">No viewers yet.</span>
          ) : (
            viewers.map((viewer) => (
              <span key={viewer.id} className="viewer-chip">
                {viewer.name}
                <button
                  type="button"
                  className="viewer-delete-button"
                  onClick={() => void handleDeleteViewer(viewer.id)}
                  aria-label={`Delete viewer ${viewer.name}`}
                >
                  Remove
                </button>
              </span>
            ))
          )}
        </div>
      </section>

      {error ? <div className="status-banner error">{error}</div> : null}

      <section className="media-grid" aria-live="polite">
        {loading ? (
          <div className="empty-state">Loading your watchlist…</div>
        ) : media.length === 0 ? (
          <div className="empty-state">
            No titles match your filters yet. Try a different search or add a new record.
          </div>
        ) : (
          media.map((item) => (
            <MediaCard
              key={item.id}
              media={item}
              viewerName={viewerMap[item.viewer_id] ?? 'Unknown viewer'}
              onEdit={() => handleOpenEdit(item)}
              onDelete={() => void handleDelete(item.id)}
            />
          ))
        )}
      </section>

      <MediaFormModal
        open={isModalOpen}
        mode={editingMedia ? 'edit' : 'create'}
        viewers={viewers}
        initialData={
          editingMedia
            ? {
                title: editingMedia.title,
                viewer_id: editingMedia.viewer_id,
                status: editingMedia.status,
                rating: editingMedia.rating,
                date_watched: editingMedia.date_watched ?? '',
                comments: editingMedia.comments ?? '',
                stop_reason: editingMedia.stop_reason ?? '',
              }
            : EMPTY_FORM
        }
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

export default App;
