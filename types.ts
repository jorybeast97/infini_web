
export interface Location {
  lat: number;
  lng: number;
  name: string;
}

export interface AppProject {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name or image url
  url: string;
  tags: string[];
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  location: Location | null;
  readTime: string;
  status?: 'published' | 'draft';
  partners?: string[];
}

export interface Photo {
  id: string;
  url: string;
  caption: string;
  location: Location;
  date: string;
  authorId?: string;
}

export interface Author {
  id: string;
  name: string;
  role: string;
  avatar: string;
  bio: string;
  social: {
    github?: string;
    twitter?: string;
    linkedin?: string;
  };
}

export enum SectionType {
  APPS = 'APPS',
  BLOG = 'BLOG',
  PHOTOS = 'PHOTOS',
}
