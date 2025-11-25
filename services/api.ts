import { MOCK_APPS, MOCK_POSTS, MOCK_PHOTOS, MOCK_AUTHORS } from '../constants';
import { AppProject, BlogPost, Photo, Author } from '../types';

// Simple Storage Helper to simulate DB
const DB_KEYS = {
  APPS: 'infini_apps',
  POSTS: 'infini_posts',
  PHOTOS: 'infini_photos',
  AUTHORS: 'infini_authors',
  TOKEN: 'infini_token',
  USER: 'infini_user'
};

const getFromStorage = <T>(key: string, defaultData: T): T => {
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(defaultData));
    return defaultData;
  }
  return JSON.parse(stored);
};

const saveToStorage = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const API_LOCAL = (import.meta as any).env?.VITE_API_LOCAL === 'true';
const API_ORIGIN = API_LOCAL ? 'http://localhost:3000' : 'https://infini-api.vercel.app';
const API_BASE = `${API_ORIGIN}/api`;

export const api = {
  // Public Data
  getApps: async (): Promise<AppProject[]> => {
    await delay(600);
    return getFromStorage(DB_KEYS.APPS, MOCK_APPS);
  },
  getUsers: async (): Promise<Array<{id:string; userName:string; nickName?:string; role?:string; avatar?:string}>> => {
    const res = await fetch(`${API_BASE}/users/list`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: 1, limit: 100 })
    });
    if (!res.ok) return [];
    const json = await res.json();
    const data = json?.data || [];
    return data.map((u: any) => ({ id: u.id, userName: u.userName, nickName: u.nickName, role: u.role, avatar: u.avatar }));
  },
  getPosts: async (): Promise<BlogPost[]> => {
    const res = await fetch(`${API_BASE}/posts/list`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: 1, limit: 100, sort: 'date:desc' })
    });
    if (!res.ok) {
      // fallback to mock for graceful degradation
      return getFromStorage(DB_KEYS.POSTS, MOCK_POSTS);
    }
    const json = await res.json();
    const data = (json.data || json) as any[];
    return data.map(p => ({
      id: p.id,
      title: p.title,
      excerpt: p.excerpt,
      content: p.content,
      // backend uses int64 timestamp seconds; format to YYYY-MM-DD
      date: p.date ? new Date(p.date * 1000).toISOString().slice(0,10) : '',
      readTime: p.readTime,
      location: p.location || null,
      status: p.status,
      partners: p.partners || [],
      updatedAt: p.updatedAt ? new Date(p.updatedAt * 1000).toISOString().replace('T', ' ').slice(0,16) : undefined,
      createdAt: p.createdAt ? new Date(p.createdAt * 1000).toISOString().replace('T', ' ').slice(0,16) : undefined,
    })) as BlogPost[];
  },
  getPostById: async (id: string): Promise<BlogPost | undefined> => {
    const res = await fetch(`${API_BASE}/posts/get`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    if (!res.ok) return undefined;
    const wrapper = await res.json();
    const p = wrapper?.data || wrapper;
    const bp: BlogPost = {
      id: p.id,
      title: p.title,
      excerpt: p.excerpt,
      content: p.content || '',
      date: p.date ? new Date(p.date * 1000).toISOString().slice(0,10) : '',
      readTime: p.readTime || '',
      location: p.location || null,
      status: p.status || 'draft',
      partners: p.partners || []
    };
    return bp;
  },
  getPhotos: async (): Promise<Photo[]> => {
    await delay(1000);
    return getFromStorage(DB_KEYS.PHOTOS, MOCK_PHOTOS);
  },
  getAuthors: async (): Promise<Author[]> => {
    await delay(400);
    return getFromStorage(DB_KEYS.AUTHORS, MOCK_AUTHORS);
  },

  // Auth
  login: async (username: string, password: string): Promise<{ token: string, user: any }> => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || 'Invalid credentials');
    }
    const data = await res.json();
    if (data?.token) {
      localStorage.setItem(DB_KEYS.TOKEN, data.token);
    }
    if (data?.user) {
      localStorage.setItem(DB_KEYS.USER, JSON.stringify(data.user));
    }
    return { token: data?.token, user: data?.user };
  },
  registerUser: async (payload: { userName: string; password: string; nickName?: string; avatar?: string }): Promise<void> => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || 'Register failed');
    }
  },
  logout: () => {
    localStorage.removeItem(DB_KEYS.TOKEN);
    localStorage.removeItem(DB_KEYS.USER);
  },
  isAuthenticated: () => {
    return !!localStorage.getItem(DB_KEYS.TOKEN);
  },

  getCurrentUser: async (): Promise<any | null> => {
    const cached = localStorage.getItem(DB_KEYS.USER);
    return cached ? JSON.parse(cached) : null;
  },

  updateUser: async (id: string, payload: { nickName?: string; avatar?: string }): Promise<void> => {
    const token = localStorage.getItem(DB_KEYS.TOKEN);
    const res = await fetch(`${API_BASE}/users/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id, ...payload })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || 'Update failed');
    }
    const u = await res.json();
    localStorage.setItem(DB_KEYS.USER, JSON.stringify(u));
  },

  // Admin CRUD - Apps
  saveApp: async (app: AppProject): Promise<void> => {
    await delay(500);
    const apps = getFromStorage(DB_KEYS.APPS, MOCK_APPS) as AppProject[];
    const index = apps.findIndex(a => a.id === app.id);
    if (index >= 0) {
      apps[index] = app;
    } else {
      apps.push({ ...app, id: Date.now().toString() });
    }
    saveToStorage(DB_KEYS.APPS, apps);
  },
  deleteApp: async (id: string): Promise<void> => {
    await delay(500);
    const apps = getFromStorage(DB_KEYS.APPS, MOCK_APPS) as AppProject[];
    const filtered = apps.filter(a => a.id !== id);
    saveToStorage(DB_KEYS.APPS, filtered);
  },

  // Admin CRUD - Posts
  savePost: async (post: BlogPost): Promise<void> => {
    const token = localStorage.getItem(DB_KEYS.TOKEN);
    const body = {
      id: post.id,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      date: post.date ? Math.floor(Date.parse(post.date)/1000) : Math.floor(Date.now()/1000),
      readTime: post.readTime,
      location: post.location,
      status: post.status || 'draft',
      partners: post.partners || []
    };
    const res = await fetch(`${API_BASE}/posts/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
      body: JSON.stringify({ post: body })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || 'Save failed');
    }
  },
  deletePost: async (id: string): Promise<void> => {
    const token = localStorage.getItem(DB_KEYS.TOKEN);
    const res = await fetch(`${API_BASE}/posts/delete`, {
      method: 'POST',
      headers: { Authorization: token ? `Bearer ${token}` : '' }
      , body: JSON.stringify({ id })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || 'Delete failed');
    }
  },

  // Admin CRUD - Photos
  savePhoto: async (photo: Photo): Promise<void> => {
    await delay(500);
    const photos = getFromStorage(DB_KEYS.PHOTOS, MOCK_PHOTOS) as Photo[];
    const index = photos.findIndex(p => p.id === photo.id);
    if (index >= 0) {
      photos[index] = photo;
    } else {
      photos.push({ ...photo, id: Date.now().toString() });
    }
    saveToStorage(DB_KEYS.PHOTOS, photos);
  },
  deletePhoto: async (id: string): Promise<void> => {
    await delay(500);
    const photos = getFromStorage(DB_KEYS.PHOTOS, MOCK_PHOTOS) as Photo[];
    const filtered = photos.filter(p => p.id !== id);
    saveToStorage(DB_KEYS.PHOTOS, filtered);
  }
};
