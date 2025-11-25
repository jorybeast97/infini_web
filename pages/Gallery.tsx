import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { MapPin, X, Loader2 } from 'lucide-react';
import Map from '../components/Map';

const Gallery: React.FC = () => {
  const { data: photos, isLoading } = useQuery({ queryKey: ['photos'], queryFn: api.getPhotos });
  const { data: authors } = useQuery({ queryKey: ['authors'], queryFn: api.getAuthors });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const [loadingMore, setLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const parseSizeFromUrl = (url: string) => {
    const m = url.match(/picsum\.photos\/(\d+)\/(\d+)/);
    if (!m) return 0.8;
    const w = parseInt(m[1], 10);
    const h = parseInt(m[2], 10);
    if (!w || !h) return 0.8;
    return h / w;
  };
  const [colCount, setColCount] = useState(3);
  const [columns, setColumns] = useState<Array<Array<any>>>([[], [], []]);

  const addMoreDemoPhotos = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    const randomBetween = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
    const sizes = [
      [600, 400],
      [600, 600],
      [600, 800],
      [700, 500],
      [800, 600],
      [500, 700]
    ];
    for (let i = 0; i < 12; i++) {
      const [w, h] = sizes[i % sizes.length];
      const randomId = Date.now() + i;
      const dayOffset = randomBetween(0, 365);
      const date = new Date(Date.now() - dayOffset * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const authorPool = ['1', '2', '3'];
      const photo = {
        id: 'new',
        url: `https://picsum.photos/${w}/${h}?random=${randomId}`,
        caption: `Demo Photo ${randomId}`,
        date,
        location: { lat: 37.7749, lng: -122.4194, name: 'Demo Location' },
        authorId: authorPool[i % authorPool.length]
      };
      await api.savePhoto(photo);
    }
    await queryClient.invalidateQueries({ queryKey: ['photos'] });
    setLoadingMore(false);
  };

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry.isIntersecting && !loadingMore) {
        addMoreDemoPhotos();
      }
    }, { rootMargin: '400px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadingMore, photos]);

  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      const next = w < 768 ? 1 : w < 1024 ? 2 : 3;
      setColCount(next);
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!photos || photos.length === 0) {
      setColumns(Array.from({ length: colCount }, () => []));
      return;
    }
    setColumns((prev) => {
      const existingIds = new Set(prev.flat().map((p) => p.id));
      const newItems = photos.filter((p) => !existingIds.has(p.id));
      let cols = prev;
      if (prev.length !== colCount) {
        cols = Array.from({ length: colCount }, () => []);
        const heights = new Array(colCount).fill(0);
        for (const p of photos) {
          const r = parseSizeFromUrl(p.url);
          const idx = heights.indexOf(Math.min(...heights));
          cols[idx].push(p);
          heights[idx] += r;
        }
        return cols;
      }
      if (newItems.length === 0) return prev;
      const heights = prev.map((col) => col.reduce((sum, p) => sum + parseSizeFromUrl(p.url), 0));
      for (const p of newItems) {
        const r = parseSizeFromUrl(p.url);
        const idx = heights.indexOf(Math.min(...heights));
        cols[idx] = [...cols[idx], p];
        heights[idx] += r;
      }
      return cols.map((c) => [...c]);
    });
  }, [photos, colCount]);

  if (isLoading) return <div className="p-10 text-center">Loading visual memories...</div>;

  const selectedPhoto = photos?.find(p => p.id === selectedId);

  return (
    <div className="container mx-auto max-w-7xl p-4 pb-32">
      <motion.h1 
         initial={{ opacity: 0 }} animate={{ opacity: 1 }}
         className="text-3xl font-bold tracking-tight mb-8 px-2"
      >
        Gallery
      </motion.h1>

      <div className="flex gap-4">
        {columns.slice(0, colCount).map((col, ci) => (
          <div key={`col-${ci}`} className="flex-1">
            {col.map((photo, i) => (
              <motion.div
                key={photo.id}
                layoutId={`photo-${photo.id}`}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.02 }}
                className="relative rounded-xl overflow-hidden cursor-pointer group mb-4 bg-zinc-900 border border-white/10"
                onClick={() => setSelectedId(photo.id)}
              >
                {(() => {
                  const ratio = parseSizeFromUrl(photo.url);
                  return (
                    <div className="relative w-full" style={{ paddingTop: `${ratio * 100}%` }}>
                      <img 
                        src={photo.url} 
                        alt={photo.caption} 
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                  );
                })()}
                <div className="p-4 bg-zinc-950/60">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const a = authors?.find(x => x.id === photo.authorId);
                      return (
                        <>
                          {a?.avatar && (
                            <img src={a.avatar} alt={a.name} className="w-8 h-8 rounded-full object-cover" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-medium">{a?.name ?? 'Unknown Author'}</p>
                            <p className="text-xs text-muted-foreground">{photo.date}</p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  <p className="text-sm mt-3">{photo.caption}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                    <MapPin size={12} />
                    {photo.location.name}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ))}
      </div>
      <div ref={loadMoreRef} className="h-16 flex items-center justify-center">
        {loadingMore && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="animate-spin" size={18} />
            正在加载更多...
          </div>
        )}
      </div>

      {/* Expanded View Modal */}
      <AnimatePresence>
        {selectedId && selectedPhoto && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
            onClick={() => setSelectedId(null)}
          >
            <motion.div 
              layoutId={`photo-${selectedId}`}
              className="bg-zinc-900 rounded-2xl overflow-hidden max-w-5xl w-full max-h-[90vh] flex flex-col md:flex-row shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative flex-1 h-[50vh] md:h-auto">
                 <img 
                  src={selectedPhoto.url} 
                  alt={selectedPhoto.caption} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="w-full md:w-80 lg:w-96 bg-zinc-950 p-6 flex flex-col border-l border-white/10">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-xl font-bold">{selectedPhoto.caption}</h2>
                  <button onClick={() => setSelectedId(null)} className="text-muted-foreground hover:text-white">
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-6 flex-1">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Details</h3>
                    <p className="text-sm">{selectedPhoto.date}</p>
                  </div>
                  
                  <div className="flex-1 min-h-[200px] rounded-lg overflow-hidden border border-white/10 relative">
                    <Map 
                       locations={[{ lat: selectedPhoto.location.lat, lng: selectedPhoto.location.lng, title: selectedPhoto.caption, type: 'photo' }]}
                       center={[selectedPhoto.location.lat, selectedPhoto.location.lng]}
                       zoom={10}
                       className="h-full w-full"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Gallery;
