/**
 * Admin API client — Bearer token from sessionStorage or VITE_ADMIN_API_TOKEN.
 */
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";

export type ApiError = { code: string; message: string };

export function getAdminToken(): string {
  return (
    sessionStorage.getItem("admin_api_token") ??
    import.meta.env.VITE_ADMIN_API_TOKEN ??
    ""
  );
}

export function setAdminToken(token: string): void {
  sessionStorage.setItem("admin_api_token", token);
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  admin = false,
): Promise<T> {
  const headers = new Headers(init.headers);
  if (!(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (admin) {
    const token = getAdminToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = (payload as { error?: ApiError }).error;
    throw new Error(err?.message ?? `Request failed (${res.status})`);
  }
  return (payload as { data: T }).data;
}

export const adminApi = {
  listAssets: () => request<Asset[]>("/admin/assets", {}, true),
  uploadAsset: (file: File) => {
    const body = new FormData();
    body.append("file", file);
    return request<Asset>("/admin/assets", { method: "POST", body }, true);
  },
  deleteAsset: (id: string) =>
    request<{ message: string }>(`/admin/assets/${id}`, { method: "DELETE" }, true),

  listArticles: () => request<Article[]>("/admin/articles", {}, true),
  getArticle: (id: string) => request<Article>(`/admin/articles/${id}`, {}, true),
  createArticle: (body: Partial<Article>) =>
    request<Article>("/admin/articles", { method: "POST", body: JSON.stringify(body) }, true),
  updateArticle: (id: string, body: Partial<Article>) =>
    request<Article>(`/admin/articles/${id}`, { method: "PUT", body: JSON.stringify(body) }, true),
  deleteArticle: (id: string) =>
    request<{ message: string }>(`/admin/articles/${id}`, { method: "DELETE" }, true),

  getBoard: () => request<BoardContent>("/admin/board", {}, true),
  saveBoardSettings: (hero: unknown) =>
    request<{ hero: unknown }>("/admin/board/settings", {
      method: "PUT",
      body: JSON.stringify({ hero }),
    }, true),
  listMinistries: () => request<BoardMinistry[]>("/admin/board/ministries", {}, true),
  createMinistry: (body: Partial<BoardMinistry>) =>
    request<BoardMinistry>("/admin/board/ministries", {
      method: "POST",
      body: JSON.stringify(body),
    }, true),
  updateMinistry: (id: string, body: Partial<BoardMinistry>) =>
    request<BoardMinistry>(`/admin/board/ministries/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }, true),
  deleteMinistry: (id: string) =>
    request<{ message: string }>(`/admin/board/ministries/${id}`, { method: "DELETE" }, true),
  listPosts: (ministryId: string) =>
    request<BoardPost[]>(`/admin/board/ministries/${ministryId}/posts`, {}, true),
  createPost: (ministryId: string, body: Partial<BoardPost>) =>
    request<BoardPost>(`/admin/board/ministries/${ministryId}/posts`, {
      method: "POST",
      body: JSON.stringify(body),
    }, true),
  getPost: (id: string) => request<BoardPost>(`/admin/board/posts/${id}`, {}, true),
  updatePost: (id: string, body: Partial<BoardPost>) =>
    request<BoardPost>(`/admin/board/posts/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }, true),
  deletePost: (id: string) =>
    request<{ message: string }>(`/admin/board/posts/${id}`, { method: "DELETE" }, true),

  listActivities: () => request<Activity[]>("/admin/activities", {}, true),
  getActivity: (id: string) => request<Activity>(`/admin/activities/${id}`, {}, true),
  createActivity: (body: Partial<Activity>) =>
    request<Activity>("/admin/activities", {
      method: "POST",
      body: JSON.stringify(body),
    }, true),
  updateActivity: (id: string, body: Partial<Activity>) =>
    request<Activity>(`/admin/activities/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }, true),
  deleteActivity: (id: string) =>
    request<{ message: string }>(`/admin/activities/${id}`, { method: "DELETE" }, true),
};

export type Asset = {
  id: string;
  publicId: string;
  url: string;
  secureUrl: string;
  resourceType: string;
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
  folder?: string;
  originalFilename?: string;
  createdAt: string;
  updatedAt: string;
};

export type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverAssetId?: string;
  coverUrl: string;
  bodyHtml: string;
  bodyGjs?: unknown;
  status: "draft" | "published";
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type BoardPost = {
  id: string;
  ministryId: string;
  slug: string;
  title: string;
  body: string;
  bodyHtml: string;
  bodyGjs?: unknown;
  dateLabel: string;
  tag?: string;
  pinned: boolean;
  imageSrc?: string;
  imageAlt?: string;
  imageObjectPosition?: string;
  variant?: "image" | "brand";
  palette?: string;
  align?: string;
  sortOrder: number;
  status: "draft" | "published";
};

export type BoardMinistry = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  imageSrc: string;
  imageAlt: string;
  imageObjectPosition: string;
  sortOrder: number;
  posts?: BoardPost[];
};

export type BoardContent = {
  hero: unknown;
  ministries: BoardMinistry[];
};

export type Activity = {
  id: string;
  slug: string;
  name: string;
  description: string;
  dateLabel: string;
  href: string;
  cta: string;
  imageSrc: string;
  imageAlt: string;
  icon: string;
  className: string;
  bodyHtml: string;
  bodyGjs?: unknown;
  sortOrder: number;
  status: "draft" | "published";
};
