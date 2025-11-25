import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { MapPin, X } from 'lucide-react';
import Map from '../components/Map';

const Gallery: React.FC = () => {
  const { data: photos, isLoading } = useQuery({ queryKey: ['photos'], queryFn: api.getPhotos });
  const [selectedId, setSelectedId] = useState<string | null>(null);

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {photos?.map((photo, i) => (
          <motion.div
            key={photo.id}
            layoutId={`photo-${photo.id}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="relative aspect-[4/5] rounded-xl overflow-hidden cursor-pointer group"
            onClick={() => setSelectedId(photo.id)}
          >
            <img 
              src={photo.url} 
              alt={photo.caption} 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
              <p className="text-white font-medium">{photo.caption}</p>
              <div className="flex items-center gap-1 text-white/70 text-xs mt-1">
                <MapPin size={12} />
                {photo.location.name}
              </div>
            </div>
          </motion.div>
        ))}
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