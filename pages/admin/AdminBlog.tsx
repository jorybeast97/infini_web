import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Button } from '../../components/ui/button';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Spinner } from '../../components/ui/spinner';
import { BlogPost } from '../../types';

const AdminBlog = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: posts, isLoading } = useQuery({ queryKey: ['posts'], queryFn: api.getPosts });

  const deleteMutation = useMutation({
    mutationFn: api.deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    }
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-40 bg-white/10 rounded animate-pulse" />
        <div className="h-10 w-28 bg-white/10 rounded animate-pulse" />
      </div>
      <div className="bg-zinc-900/50 border border-white/10 rounded-xl overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4"><Spinner /><span className="text-sm text-muted-foreground">Loading posts...</span></div>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="grid grid-cols-4 gap-4">
                <div className="h-6 bg-white/10 rounded animate-pulse" />
                <div className="h-6 bg-white/10 rounded animate-pulse" />
                <div className="h-6 bg-white/10 rounded animate-pulse" />
                <div className="h-6 bg-white/10 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Blog Posts</h1>
        <Button onClick={() => navigate('/admin/blog/new')}>
          <Plus size={18} className="mr-2" /> New Post
        </Button>
      </div>

      <div className="bg-zinc-900/50 border border-white/10 rounded-xl overflow-hidden">
         <table className="w-full text-left border-collapse">
            <thead>
               <tr className="border-b border-white/10 bg-zinc-950/50">
                 <th className="p-4 font-medium text-muted-foreground">Title</th>
                 <th className="p-4 font-medium text-muted-foreground">Date</th>
                 <th className="p-4 font-medium text-muted-foreground">Updated</th>
                 <th className="p-4 font-medium text-muted-foreground">Status</th>
                 <th className="p-4 font-medium text-muted-foreground">Location</th>
                 <th className="p-4 font-medium text-muted-foreground text-right">Actions</th>
               </tr>
            </thead>
            <tbody>
               {posts?.map(post => (
                 <tr key={post.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4 font-medium">{post.title}</td>
                    <td className="p-4 text-sm text-zinc-400">{post.date}</td>
                    <td className="p-4 text-sm text-zinc-400">{post.updatedAt || '-'}</td>
                    <td className="p-4 text-sm">
                      <span className={"px-2 py-1 rounded text-xs border " + (post.status === 'published' ? 'text-green-400 border-green-400' : 'text-amber-400 border-amber-400') }>
                        {post.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-zinc-400">{post.location?.name || '-'}</td>
                    <td className="p-4 text-right space-x-2">
                       <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/blog/${post.id}`)}>
                         <Edit2 size={16} />
                       </Button>
                       <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300" onClick={() => handleDelete(post.id)}>
                         <Trash2 size={16} />
                       </Button>
                    </td>
                 </tr>
               ))}
               {posts?.length === 0 && (
                 <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">No posts found. Start writing!</td>
                 </tr>
               )}
            </tbody>
         </table>
      </div>
    </div>
  );
};

export default AdminBlog;
