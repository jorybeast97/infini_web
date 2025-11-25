import { AppProject, BlogPost, Photo, Author } from './types';

export const MOCK_APPS: AppProject[] = [
  {
    id: '1',
    name: 'ZenTask',
    description: 'A minimalist productivity app focused on flow state.',
    icon: 'CheckCircle',
    url: '#',
    tags: ['Productivity', 'React Native', 'iOS'],
  },
  {
    id: '2',
    name: 'CryptoPulse',
    description: 'Real-time cryptocurrency market visualization tool.',
    icon: 'TrendingUp',
    url: '#',
    tags: ['Finance', 'D3.js', 'Web3'],
  },
  {
    id: '3',
    name: 'EchoNotes',
    description: 'AI-powered voice memo organizer and summarizer.',
    icon: 'Mic',
    url: '#',
    tags: ['AI', 'Audio', 'Utility'],
  },
];

export const MOCK_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'The Future of Declarative UI',
    excerpt: 'Why keeping your UI logic declarative makes scaling easier than you think.',
    content: 'Full content here...',
    date: '2024-03-15',
    readTime: '5 min read',
    location: { lat: 37.7749, lng: -122.4194, name: 'San Francisco, CA' },
  },
  {
    id: '2',
    title: 'Nomad Life in Tokyo',
    excerpt: 'Spending a month working remotely from Shibuya.',
    content: 'Full content here...',
    date: '2023-11-10',
    readTime: '8 min read',
    location: { lat: 35.6895, lng: 139.6917, name: 'Tokyo, Japan' },
  },
  {
    id: '3',
    title: 'Building performant lists in React',
    excerpt: 'Virtualization techniques deep dive.',
    content: 'Full content here...',
    date: '2023-09-22',
    readTime: '10 min read',
    location: null,
  },
];

export const MOCK_PHOTOS: Photo[] = [
  {
    id: '1',
    url: 'https://picsum.photos/600/400?random=1',
    caption: 'Sunset over the Golden Gate',
    date: '2024-03-10',
    location: { lat: 37.8199, lng: -122.4783, name: 'Golden Gate Bridge' },
    authorId: '1',
  },
  {
    id: '2',
    url: 'https://picsum.photos/600/800?random=2',
    caption: 'Neon streets of Shinjuku',
    date: '2023-11-15',
    location: { lat: 35.6909, lng: 139.7005, name: 'Shinjuku' },
    authorId: '2',
  },
  {
    id: '3',
    url: 'https://picsum.photos/600/600?random=3',
    caption: 'Coffee shop vibes in Berlin',
    date: '2023-08-05',
    location: { lat: 52.5200, lng: 13.4050, name: 'Berlin, Germany' },
    authorId: '3',
  },
  {
    id: '4',
    url: 'https://picsum.photos/600/400?random=4',
    caption: 'Hiking in the Swiss Alps',
    date: '2023-07-20',
    location: { lat: 46.8182, lng: 8.2275, name: 'Swiss Alps' },
    authorId: '1',
  },
];

export const MOCK_AUTHORS: Author[] = [
  {
    id: '1',
    name: 'Infini',
    role: 'Frontend Architect',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop', 
    bio: 'Obsessed with pixel perfection and accessible UI systems. Building the digital future.',
    social: {
      github: '#',
      twitter: '#',
      linkedin: '#'
    }
  },
  {
    id: '2',
    name: 'Aria',
    role: 'UX Researcher',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    bio: 'Decoding human behavior to build intuitive digital experiences.',
    social: {
      linkedin: '#',
      twitter: '#'
    }
  },
  {
    id: '3',
    name: 'Cipher',
    role: 'Backend Engineer',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop',
    bio: 'Scalable infrastructure and secure data pipelines.',
    social: {
      github: '#'
    }
  }
];
