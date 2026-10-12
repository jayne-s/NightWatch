const MEDIA_API =
  import.meta.env.VITE_MEDIA_API_URL ?? "http://localhost:8001";

const VIEWER_API =
  import.meta.env.VITE_VIEWER_API_URL ?? "http://localhost:8002";

export type WatchStatus =
  | "unwatched"
  | "planned"
  | "watched"
  | "stopped";

export interface Media {
  id: number;
  title: string;
  date_watched: string | null;
  rating: number | null;
  comments: string | null;
  viewer_id: number;
  status: WatchStatus;
  stop_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface MediaInput {
  title: string;
  date_watched: string | null;
  rating: number | null;
  comments: string | null;
  viewer_id: number;
  status: WatchStatus;
  stop_reason: string | null;
}

export interface Viewer {
  id: number;
  name: string;
}

async function request<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(
      body?.detail ?? `Request failed: ${response.status}`,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export function getMedia(params: {
  q?: string;
  status?: WatchStatus | "";
  viewer_id?: number | "";
} = {}) {
  const query = new URLSearchParams();

  if (params.q?.trim()) query.set("q", params.q.trim());
  if (params.status) query.set("status", params.status);
  if (params.viewer_id) {
    query.set("viewer_id", String(params.viewer_id));
  }

  return request<Media[]>(
    `${MEDIA_API}/media/?${query.toString()}`,
  );
}

export function createMedia(data: MediaInput) {
  return request<Media>(`${MEDIA_API}/media/`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateMedia(id: number, data: Partial<MediaInput>) {
  return request<Media>(`${MEDIA_API}/media/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteMedia(id: number) {
  return request<void>(`${MEDIA_API}/media/${id}`, {
    method: "DELETE",
  });
}

export function getViewers() {
  return request<Viewer[]>(`${VIEWER_API}/viewers/`);
}

export function createViewer(name: string) {
  return request<Viewer>(`${VIEWER_API}/viewers/`, {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export function deleteViewer(id: number) {
  return request<void>(`${VIEWER_API}/viewers/${id}`, {
    method: 'DELETE',
  });
}
