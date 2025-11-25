import { MOCK_APPS, MOCK_POSTS, MOCK_PHOTOS, MOCK_AUTHORS } from '../constants';
import { AppProject, BlogPost, Photo, Author } from '../types';

// Simple Storage Helper to simulate DB
const DB_KEYS = {
  APPS: 'infini_apps',
  POSTS: 'infini_posts',
  PHOTOS: 'infini_photos',
  AUTHORS: 'infini_authors',
  TOKEN: 'infini_token'
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

export const api = {
  // Public Data
  getApps: async (): Promise<AppProject[]> => {
    await delay(600);
    return getFromStorage(DB_KEYS.APPS, MOCK_APPS);
  },
  getPosts: async (): Promise<BlogPost[]> => {
    await delay(800);
    return getFromStorage(DB_KEYS.POSTS, MOCK_POSTS);
  },
  getPostById: async (id: string): Promise<BlogPost | undefined> => {
    await delay(400);
    const posts = getFromStorage(DB_KEYS.POSTS, MOCK_POSTS) as BlogPost[];
    return posts.find(p => p.id === id);
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
  login: async (username: string, password: string): Promise<{ token: string, user: string }> => {
    await delay(1000);
    // Case insensitive username check
    if (username.toLowerCase() === 'admin' && password === 'password') {
      const token = 'mock-jwt-token-' + Date.now();
      localStorage.setItem(DB_KEYS.TOKEN, token);
      return { token, user: 'Admin' };
    }
    throw new Error('Invalid credentials');
  },
  logout: () => {
    localStorage.removeItem(DB_KEYS.TOKEN);
  },
  isAuthenticated: () => {
    return !!localStorage.getItem(DB_KEYS.TOKEN);
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
    await delay(500);
    const posts = getFromStorage(DB_KEYS.POSTS, MOCK_POSTS) as BlogPost[];
    const index = posts.findIndex(p => p.id === post.id);
    if (index >= 0) {
      posts[index] = post;
    } else {
      posts.push({ ...post, id: Date.now().toString() });
    }
    saveToStorage(DB_KEYS.POSTS, posts);
  },
  deletePost: async (id: string): Promise<void> => {
    await delay(500);
    const posts = getFromStorage(DB_KEYS.POSTS, MOCK_POSTS) as BlogPost[];
    const filtered = posts.filter(p => p.id !== id);
    saveToStorage(DB_KEYS.POSTS, filtered);
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