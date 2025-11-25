import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import { Spinner } from '../../components/ui/spinner';
import { api } from '../../services/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { BlogPost, Author } from '../../types';
import { 
  ArrowLeft, Edit3, Eye, Image as ImageIcon, 
  Bold, Italic, List, Link as LinkIcon, Quote, Code, 
  Calendar, MapPin, Users, ChevronLeft, ChevronRight,
  Search, X, CheckCircle2, Globe
} from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { cn } from '../../components/ui/utils';

const BlogEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = id !== 'new';
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Queries
  const { data: existingPost, isLoading } = useQuery({
    queryKey: ['post', id],
    queryFn: () => api.getPostById(id!),
    enabled: isEditing
  });

  const { data: users } = useQuery({ queryKey: ['users'], queryFn: api.getUsers });
  const { data: allPosts } = useQuery({ queryKey: ['posts'], queryFn: api.getPosts });
  const { data: allPhotos } = useQuery({ queryKey: ['photos'], queryFn: api.getPhotos });

  // Extract unique locations for suggestions
  const existingLocations = React.useMemo(() => {
    const locs = new Map<string, { lat: number, lng: number }>();
    allPosts?.forEach(p => p.location && locs.set(p.location.name, p.location));
    allPhotos?.forEach(p => p.location && locs.set(p.location.name, p.location));
    return Array.from(locs.entries()).map(([name, coords]) => ({ name, ...coords }));
  }, [allPosts, allPhotos]);

  // Form State
  const [formData, setFormData] = useState<BlogPost>({
    id: '',
    title: '',
    excerpt: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
    readTime: '5 min read',
    location: null,
    status: 'draft',
    partners: []
  });

  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('split');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (existingPost) {
      setFormData({
        ...existingPost,
        status: existingPost.status || 'published',
        partners: existingPost.partners || []
      });
    }
  }, [existingPost]);

  const mutation = useMutation({
    mutationFn: api.savePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      navigate('/admin/blog');
    }
  });

  // Handlers
  const handleChange = (field: keyof BlogPost, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLocationSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'custom') {
      setFormData(prev => ({ ...prev, location: { lat: 0, lng: 0, name: '' } }));
    } else if (val === 'none') {
      setFormData(prev => ({ ...prev, location: null }));
    } else {
      const loc = existingLocations.find(l => l.name === val);
      if (loc) {
        setFormData(prev => ({ ...prev, location: loc }));
      }
    }
  };

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    const textarea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const selection = text.substring(start, end);
    const after = text.substring(end);

    const newText = `${before}${prefix}${selection}${suffix}${after}`;
    handleChange('content', newText);
    
    // Defer cursor update to next tick
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        insertMarkdown(`![${file.name}](${base64})`);
      };
      reader.readAsDataURL(file);
    }
  };

  if (isEditing && isLoading) return (
    <div className="flex h-screen items-center justify-center gap-3 text-muted-foreground">
      <Spinner />
      <span>Loading editor...</span>
    </div>
  );

  return (
    <div className="flex flex-col h-full w-full bg-background"> 
      {/* Top Bar */}
      <header className="h-16 border-b border-white/10 bg-zinc-950 px-6 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/blog')} className="hover:bg-white/10 text-muted-foreground">
            <ArrowLeft size={20} />
          </Button>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white uppercase tracking-wider">
              {isEditing ? 'Edit Post' : 'New Story'}
            </span>
            <span className={cn("text-xs flex items-center gap-1", formData.status === 'published' ? "text-green-400" : "text-amber-400")}>
              <div className={cn("w-1.5 h-1.5 rounded-full", formData.status === 'published' ? "bg-green-400" : "bg-amber-400")} />
              {formData.status === 'published' ? 'Published' : 'Draft'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggles */}
          <div className="flex bg-zinc-900 rounded-lg border border-white/10 p-1 mr-4">
             <button 
               onClick={() => setViewMode('edit')}
               title="Edit Only"
               className={cn("p-2 rounded-md transition-all", viewMode === 'edit' ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-white")}
             >
               <Edit3 size={16} />
             </button>
             <button 
               onClick={() => setViewMode('split')}
               title="Split View"
               className={cn("p-2 rounded-md transition-all hidden md:block", viewMode === 'split' ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-white")}
             >
               <div className="flex gap-0.5">
                  <div className="w-2 h-4 border border-current rounded-sm"></div>
                  <div className="w-2 h-4 bg-current rounded-sm"></div>
               </div>
             </button>
             <button 
               onClick={() => setViewMode('preview')}
               title="Preview Only"
               className={cn("p-2 rounded-md transition-all", viewMode === 'preview' ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-white")}
             >
               <Eye size={16} />
             </button>
          </div>

          {/* Action Buttons */}
          <Button 
            variant="secondary" 
            onClick={() => {
              handleChange('status', 'draft');
              mutation.mutate({ ...formData, status: 'draft' });
            }}
            disabled={mutation.isPending}
            className="hidden sm:flex border border-white/10 hover:bg-zinc-800"
          >
            Save Draft
          </Button>
          
          <Button 
            onClick={() => {
              handleChange('status', 'published');
              mutation.mutate({ ...formData, status: 'published' });
            }} 
            disabled={mutation.isPending}
            className="bg-primary hover:bg-primary/90 text-white min-w-[100px] shadow-[0_0_15px_-3px_rgba(139,92,246,0.5)]"
          >
            {mutation.isPending ? 'Saving...' : 'Publish'}
          </Button>
          
          <div className="w-px h-6 bg-white/10 mx-1" />

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={cn("transition-transform", isSidebarOpen ? "bg-white/10 text-white" : "text-zinc-500")}
          >
            {isSidebarOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Editor Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-background relative">
          
          {/* Title Input */}
          <div className="px-8 pt-8 pb-4 shrink-0">
             <div className="max-w-5xl mx-auto w-full">
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Post Title"
                  className="w-full bg-transparent text-4xl font-bold border-none outline-none placeholder:text-zinc-700 text-white font-serif tracking-tight"
                />
             </div>
          </div>

          {/* Toolbar */}
          <div className="px-8 py-2 border-y border-white/5 flex items-center justify-center bg-zinc-950/30 backdrop-blur-sm sticky top-0 z-10 shrink-0">
             <div className="flex items-center gap-1 overflow-x-auto max-w-5xl w-full">
               <ToolbarBtn icon={Bold} onClick={() => insertMarkdown('**', '**')} tooltip="Bold" />
               <ToolbarBtn icon={Italic} onClick={() => insertMarkdown('*', '*')} tooltip="Italic" />
               <div className="w-px h-4 bg-white/10 mx-2" />
               <ToolbarBtn icon={LinkIcon} onClick={() => insertMarkdown('[', '](url)')} tooltip="Link" />
               <ToolbarBtn icon={ImageIcon} onClick={() => fileInputRef.current?.click()} tooltip="Upload Image" />
               <div className="w-px h-4 bg-white/10 mx-2" />
               <ToolbarBtn icon={Quote} onClick={() => insertMarkdown('> ')} tooltip="Quote" />
               <ToolbarBtn icon={Code} onClick={() => insertMarkdown('```\n', '\n```')} tooltip="Code Block" />
               <ToolbarBtn icon={List} onClick={() => insertMarkdown('- ')} tooltip="Bullet List" />
               <input 
                 type="file" 
                 ref={fileInputRef} 
                 className="hidden" 
                 accept="image/*"
                 onChange={handleImageUpload}
               />
             </div>
          </div>

          {/* Editor / Preview Container */}
          <div className="flex-1 flex overflow-hidden">
            {/* Markdown Input */}
            <div className={cn(
                "h-full overflow-y-auto transition-all duration-300",
                viewMode === 'split' ? "w-1/2 border-r border-white/10" : viewMode === 'edit' ? "w-full" : "hidden"
            )}>
              <div className="max-w-5xl mx-auto h-full flex flex-col">
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={(e) => handleChange('content', e.target.value)}
                  className="w-full flex-1 p-8 bg-transparent resize-none outline-none font-mono text-sm leading-relaxed text-zinc-300 placeholder:text-zinc-700"
                  placeholder="Start writing your story..."
                  spellCheck={false}
                />
              </div>
            </div>

            {/* Preview Output */}
            <div className={cn(
                "h-full overflow-y-auto bg-zinc-950/50 transition-all duration-300",
                viewMode === 'split' ? "w-1/2" : viewMode === 'preview' ? "w-full" : "hidden"
            )}>
               <div className="max-w-5xl mx-auto h-full">
                 <div className="p-8 prose prose-invert prose-zinc max-w-none prose-headings:font-bold prose-a:text-primary prose-img:rounded-xl prose-img:border prose-img:border-white/10 prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-white/10">
                    {formData.content ? (
                      <ReactMarkdown>{formData.content}</ReactMarkdown>
                    ) : (
                      <div className="h-[50vh] flex flex-col items-center justify-center text-zinc-700 select-none">
                        <Eye size={48} className="mb-4 opacity-20" />
                        <p className="text-sm">Preview mode</p>
                      </div>
                    )}
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Metadata */}
        <div className={cn(
          "w-80 border-l border-white/10 bg-zinc-900/50 overflow-y-auto transition-all duration-300 flex-shrink-0 backdrop-blur-xl",
          !isSidebarOpen && "w-0 border-l-0 opacity-0 overflow-hidden"
        )}>
           <div className="p-6 space-y-8">
              
              {/* Publishing Meta */}
              <div className="space-y-4">
                 <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                   <Globe size={12} /> Publishing
                 </h3>
                 <div className="bg-zinc-950/50 rounded-lg p-4 border border-white/5 space-y-4">
                    <div className="space-y-2">
                       <Label className="text-xs text-zinc-400">Publish Date</Label>
                       <div className="relative">
                         <div className="absolute left-3 top-2.5 pointer-events-none">
                           <Calendar size={14} className="text-zinc-500" />
                         </div>
                         <Input 
                           type="date"
                           value={formData.date} 
                           onChange={e => handleChange('date', e.target.value)} 
                           className="bg-zinc-900/50 pl-9 border-white/10 text-sm focus:border-primary/50 transition-colors"
                         />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <Label className="text-xs text-zinc-400">Read Time</Label>
                       <Input 
                         value={formData.readTime} 
                         onChange={e => handleChange('readTime', e.target.value)} 
                         className="bg-zinc-900/50 border-white/10 text-sm focus:border-primary/50 transition-colors"
                         placeholder="e.g. 5 min"
                       />
                    </div>
                 </div>
              </div>

              {/* Location */}
              <div className="space-y-4">
                 <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                   <MapPin size={12} /> Location
                 </h3>
                 <div className="bg-zinc-950/50 rounded-lg p-4 border border-white/5 space-y-3">
                    <div className="space-y-2">
                       <Label className="text-xs text-zinc-400">Select Location</Label>
                       <div className="relative">
                         <select 
                           className="w-full h-10 appearance-none rounded-md border border-white/10 bg-zinc-900/50 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 text-zinc-200 transition-colors cursor-pointer hover:bg-zinc-900"
                           onChange={handleLocationSelect}
                           value={formData.location ? formData.location.name : 'none'}
                         >
                           <option value="none">No Location</option>
                           {existingLocations.map((loc, idx) => (
                             <option key={idx} value={loc.name}>{loc.name}</option>
                           ))}
                           <option value="custom" className="text-primary font-bold">+ Custom Location</option>
                         </select>
                         <ChevronRight className="absolute right-3 top-3 h-4 w-4 rotate-90 text-zinc-500 pointer-events-none" />
                       </div>
                    </div>

                    {/* Custom Location Inputs */}
                    {formData.location && (
                      <div className="pt-3 mt-2 border-t border-white/5 space-y-3 animate-in fade-in slide-in-from-top-2">
                         <Input 
                           placeholder="Location Name"
                           value={formData.location.name}
                           onChange={e => setFormData(p => ({...p, location: {...p.location!, name: e.target.value}}))}
                           className="bg-zinc-900 border-white/10 text-xs h-8"
                         />
                         <div className="grid grid-cols-2 gap-2">
                           <Input 
                             type="number"
                             placeholder="Lat"
                             value={formData.location.lat}
                             onChange={e => setFormData(p => ({...p, location: {...p.location!, lat: parseFloat(e.target.value)}}))}
                             className="bg-zinc-900 border-white/10 text-xs h-8"
                           />
                           <Input 
                             type="number"
                             placeholder="Lng"
                             value={formData.location.lng}
                             onChange={e => setFormData(p => ({...p, location: {...p.location!, lng: parseFloat(e.target.value)}}))}
                             className="bg-zinc-900 border-white/10 text-xs h-8"
                           />
                         </div>
                      </div>
                    )}
                 </div>
              </div>

              {/* Partners Selector */}
              <div className="space-y-4">
                 <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                   <Users size={12} /> Partners
                 </h3>
                 <PartnerSelector 
                    partners={formData.partners || []}
                    allUsers={users || []}
                    onChange={(newPartners) => handleChange('partners', newPartners)}
                 />
              </div>

              {/* Excerpt */}
              <div className="space-y-4">
                 <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Excerpt</h3>
                 <Textarea 
                    value={formData.excerpt}
                    onChange={e => handleChange('excerpt', e.target.value)}
                    className="bg-zinc-950/50 border-white/10 min-h-[100px] text-sm leading-relaxed resize-none focus:border-primary/50 transition-colors"
                    placeholder="Write a brief summary..."
                 />
              </div>

           </div>
        </div>
      </div>
    </div>
  );
};

// --- Subcomponents ---

const ToolbarBtn = ({ icon: Icon, onClick, tooltip }: { icon: any, onClick: () => void, tooltip: string }) => (
  <button 
    onClick={onClick}
    title={tooltip}
    className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-md transition-colors flex-shrink-0"
  >
    <Icon size={16} />
  </button>
);

type UserBrief = { id: string; userName: string; nickName?: string; role?: string; avatar?: string };
const PartnerSelector = ({ partners, allUsers, onChange }: { partners: string[], allUsers: UserBrief[], onChange: (p: string[]) => void }) => {
   const [search, setSearch] = useState('');
   const [isOpen, setIsOpen] = useState(false);
   
  const filtered = allUsers.filter(u => 
     ((u.nickName || u.userName || '').toLowerCase().includes(search.toLowerCase())) && !partners.includes(u.id)
  );

   return (
      <div className="bg-zinc-950/50 border border-white/10 rounded-lg p-3 space-y-3">
         {/* Selected Chips */}
         {partners.length > 0 && (
            <div className="flex flex-wrap gap-2">
               {partners.map(pId => {
                  const user = allUsers.find(u => u.id === pId);
                  if(!user) return null;
                  return (
                     <Badge key={pId} variant="secondary" className="pl-1 pr-2 py-1 h-7 gap-1.5 bg-zinc-800 hover:bg-zinc-700 border-white/10 text-zinc-200">
                        {user.avatar && <img src={user.avatar} className="w-5 h-5 rounded-full object-cover" alt="" />}
                        {user.nickName || user.userName}
                        <button 
                           onClick={() => onChange(partners.filter(id => id !== pId))}
                           className="ml-1 text-zinc-500 hover:text-white"
                        >
                           <X size={12} />
                        </button>
                     </Badge>
                  )
               })}
            </div>
         )}

         {/* Search / Add Input */}
         <div className="relative group">
             <div className="absolute left-2.5 top-2.5 pointer-events-none">
                <Search size={14} className="text-zinc-500 group-focus-within:text-primary transition-colors" />
             </div>
             <input 
               className="w-full bg-zinc-900 border border-white/10 rounded-md text-sm pl-9 pr-3 py-2 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-zinc-600 text-zinc-200"
               placeholder="Add partner..."
               value={search}
               onChange={e => { setSearch(e.target.value); setIsOpen(true); }}
               onFocus={() => setIsOpen(true)}
               onBlur={() => setTimeout(() => setIsOpen(false), 200)} // Delay to allow click
             />
             
             {/* Dropdown */}
             {isOpen && (search || filtered.length > 0) && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-zinc-900 border border-white/10 rounded-md shadow-xl z-50 max-h-48 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                   {filtered.length > 0 ? (
                      filtered.map(user => (
                        <button 
                          key={user.id}
                          onMouseDown={() => { // Use onMouseDown to trigger before input blur
                              onChange([...partners, user.id]);
                              setSearch('');
                          }}
                          className="flex items-center gap-3 w-full p-2.5 hover:bg-white/5 text-sm text-zinc-300 text-left transition-colors"
                        >
                          {user.avatar && <img src={user.avatar} className="w-6 h-6 rounded-full object-cover" alt="" />}
                          <div className="flex flex-col">
                              <span className="font-medium text-xs">{user.nickName || user.userName}</span>
                              <span className="text-[10px] text-zinc-500">{user.role || ''}</span>
                          </div>
                        </button>
                      ))
                   ) : (
                      <div className="p-3 text-xs text-zinc-500 text-center">No matching partners found</div>
                   )}
                </div>
             )}
         </div>
      </div>
   );
};

export default BlogEditor;
