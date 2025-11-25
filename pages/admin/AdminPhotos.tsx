import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Photo } from '../../types';

const AdminPhotos = () => {
  const queryClient = useQueryClient();
  const { data: photos, isLoading } = useQuery({ queryKey: ['photos'], queryFn: api.getPhotos });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);

  const [formData, setFormData] = useState<Partial<Photo>>({
    url: '',
    caption: '',
    date: new Date().toISOString().split('T')[0],
    location: { lat: 0, lng: 0, name: '' }
  });

  const saveMutation = useMutation({
    mutationFn: api.savePhoto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos'] });
      setIsDialogOpen(false);
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: api.deletePhoto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos'] });
    }
  });

  const resetForm = () => {
    setEditingPhoto(null);
    setFormData({ url: '', caption: '', date: new Date().toISOString().split('T')[0], location: { lat: 0, lng: 0, name: '' } });
  };

  const handleEdit = (photo: Photo) => {
    setEditingPhoto(photo);
    setFormData(photo);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this photo?')) deleteMutation.mutate(id);
  };

  const handleSave = () => {
    if (!formData.url || !formData.caption) return;
    saveMutation.mutate({
      ...formData,
      id: editingPhoto?.id || '',
    } as Photo);
  };

  const handleLocationChange = (field: string, val: any) => {
    setFormData(prev => ({ 
      ...prev, 
      location: { ...prev.location!, [field]: field === 'name' ? val : parseFloat(val) } 
    }));
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gallery Photos</h1>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if(!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus size={18} className="mr-2" /> Add Photo</Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-950 border-white/10 text-white">
            <DialogHeader>
              <DialogTitle>{editingPhoto ? 'Edit Photo' : 'Add New Photo'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
               <div className="space-y-2">
                 <Label>Image URL</Label>
                 <Input value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} className="bg-zinc-900 border-white/10" />
               </div>
               <div className="space-y-2">
                 <Label>Caption</Label>
                 <Input value={formData.caption} onChange={e => setFormData({...formData, caption: e.target.value})} className="bg-zinc-900 border-white/10" />
               </div>
               <div className="space-y-2">
                 <Label>Date</Label>
                 <Input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="bg-zinc-900 border-white/10" />
               </div>
               <div className="space-y-2">
                  <Label>Location</Label>
                  <Input placeholder="Location Name" value={formData.location?.name} onChange={e => handleLocationChange('name', e.target.value)} className="bg-zinc-900 border-white/10 mb-2" />
                  <div className="grid grid-cols-2 gap-2">
                     <Input type="number" placeholder="Lat" value={formData.location?.lat} onChange={e => handleLocationChange('lat', e.target.value)} className="bg-zinc-900 border-white/10" />
                     <Input type="number" placeholder="Lng" value={formData.location?.lng} onChange={e => handleLocationChange('lng', e.target.value)} className="bg-zinc-900 border-white/10" />
                  </div>
               </div>
               <Button onClick={handleSave} className="w-full">{saveMutation.isPending ? 'Saving...' : 'Save'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {photos?.map(photo => (
          <div key={photo.id} className="group relative rounded-xl overflow-hidden aspect-[4/5] bg-zinc-900 border border-white/10">
             <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover" />
             <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
                <div className="flex justify-end gap-2">
                   <Button variant="secondary" size="icon" onClick={() => handleEdit(photo)}><Edit2 size={16} /></Button>
                   <Button variant="destructive" size="icon" onClick={() => handleDelete(photo.id)}><Trash2 size={16} /></Button>
                </div>
                <div>
                   <p className="font-bold text-white text-sm">{photo.caption}</p>
                   <p className="text-xs text-white/70">{photo.location.name}</p>
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPhotos;