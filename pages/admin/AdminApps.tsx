import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Plus, Edit2, Trash2, Box, X } from 'lucide-react';
import { AppProject } from '../../types';

const AdminApps = () => {
  const queryClient = useQueryClient();
  const { data: apps, isLoading } = useQuery({ queryKey: ['apps'], queryFn: api.getApps });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<AppProject | null>(null);

  const [formData, setFormData] = useState<Partial<AppProject>>({
    name: '',
    description: '',
    icon: 'Box',
    url: '',
    tags: []
  });

  const saveMutation = useMutation({
    mutationFn: api.saveApp,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apps'] });
      setIsDialogOpen(false);
      resetForm();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteApp,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apps'] });
    }
  });

  const resetForm = () => {
    setEditingApp(null);
    setFormData({ name: '', description: '', icon: 'Box', url: '', tags: [] });
  };

  const handleEdit = (app: AppProject) => {
    setEditingApp(app);
    setFormData(app);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this app?')) deleteMutation.mutate(id);
  };

  const handleSave = () => {
    if (!formData.name || !formData.description) return;
    saveMutation.mutate({
      ...formData,
      id: editingApp?.id || '',
      tags: formData.tags || []
    } as AppProject);
  };

  const handleTagsChange = (val: string) => {
    setFormData(prev => ({ ...prev, tags: val.split(',').map(s => s.trim()).filter(Boolean) }));
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Applications</h1>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if(!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus size={18} className="mr-2" /> New App</Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-950 border-white/10 text-white">
            <DialogHeader>
              <DialogTitle>{editingApp ? 'Edit App' : 'Add New App'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
               <div className="space-y-2">
                 <Label>Name</Label>
                 <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-zinc-900 border-white/10" />
               </div>
               <div className="space-y-2">
                 <Label>Description</Label>
                 <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="bg-zinc-900 border-white/10" />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Icon Name (Lucide)</Label>
                    <Input value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} className="bg-zinc-900 border-white/10" />
                  </div>
                  <div className="space-y-2">
                    <Label>Project URL</Label>
                    <Input value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} className="bg-zinc-900 border-white/10" />
                  </div>
               </div>
               <div className="space-y-2">
                 <Label>Tags (comma separated)</Label>
                 <Input value={formData.tags?.join(', ')} onChange={e => handleTagsChange(e.target.value)} className="bg-zinc-900 border-white/10" />
               </div>
               <Button onClick={handleSave} className="w-full">{saveMutation.isPending ? 'Saving...' : 'Save'}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {apps?.map(app => (
          <div key={app.id} className="p-6 rounded-xl bg-zinc-900/50 border border-white/10 hover:border-primary/30 transition-all flex flex-col gap-4">
             <div className="flex justify-between items-start">
               <div className="p-2 bg-zinc-800 rounded-lg text-white">
                  <Box size={24} />
               </div>
               <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(app)}><Edit2 size={16} /></Button>
                  <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300" onClick={() => handleDelete(app.id)}><Trash2 size={16} /></Button>
               </div>
             </div>
             <div>
                <h3 className="font-bold text-lg">{app.name}</h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{app.description}</p>
             </div>
             <div className="flex flex-wrap gap-2 mt-auto">
                {app.tags.map(tag => (
                   <span key={tag} className="text-[10px] px-2 py-1 rounded bg-white/5 border border-white/5">{tag}</span>
                ))}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminApps;