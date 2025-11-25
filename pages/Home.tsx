import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin, Github, Twitter, Linkedin } from 'lucide-react';
import { api } from '../services/api';
import Map from '../components/Map';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Link } from 'react-router-dom';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 }
};

const Home: React.FC = () => {
  const { data: posts } = useQuery({ queryKey: ['posts'], queryFn: api.getPosts });
  const { data: photos } = useQuery({ queryKey: ['photos'], queryFn: api.getPhotos });
  const { data: authors } = useQuery({ queryKey: ['authors'], queryFn: api.getAuthors });

  // Combine locations for map
  const avatarList = (authors || []).map(a => a.avatar);
  const mapLocations = [
    ...(posts?.filter(p => p.location).map(p => ({ lat: p.location!.lat, lng: p.location!.lng, title: p.title, type: 'post' as const, avatars: avatarList.slice(0,4) })) || []),
    ...(photos?.map(p => ({ lat: p.location.lat, lng: p.location.lng, title: p.caption, type: 'photo' as const, avatars: avatarList.slice(0,4) })) || [])
  ];

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="container mx-auto max-w-6xl p-6 pb-32 space-y-6"
    >
      {/* Hero / Intro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={item} className="md:col-span-2">
          <Card className="h-full flex flex-col justify-center border-primary/20 bg-gradient-to-br from-card to-primary/5 overflow-visible z-10">
            <CardHeader>
              <CardTitle className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">
                Infini Collective.
              </CardTitle>
              <CardDescription className="text-lg mt-2">
                A digital garden of shared experiences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground leading-relaxed">
                We are a team of creators, engineers, and explorers building accessible, pixel-perfect web experiences. 
                This platform serves as our unified journal where we track our travels, open-source projects, and technical thoughts.
              </p>
              
              <div className="flex flex-col gap-3 pt-2">
                 <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Contributors</span>
                 <div className="flex items-center">
                   <div className="flex -space-x-3 hover:space-x-1 transition-all duration-300">
                      {authors?.map((author) => (
                        <div key={author.id} className="relative group">
                           {/* Avatar Circle */}
                           <div className="w-12 h-12 rounded-full border-2 border-background bg-zinc-800 overflow-hidden relative z-10 cursor-pointer transition-transform duration-300 group-hover:scale-110 group-hover:z-20 group-hover:border-primary/50">
                             <img src={author.avatar} alt={author.name} className="w-full h-full object-cover" />
                           </div>
                           
                           {/* Tooltip Hover Card */}
                           <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 opacity-0 translate-y-2 pointer-events-none group-hover:pointer-events-auto group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-50">
                              <div className="bg-zinc-950/90 backdrop-blur-xl border border-white/10 rounded-xl p-4 shadow-2xl">
                                 <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 shrink-0">
                                       <img src={author.avatar} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                       <div className="font-bold text-white text-sm">{author.name}</div>
                                       <div className="text-[10px] text-primary font-medium tracking-wide">{author.role}</div>
                                    </div>
                                 </div>
                                 <p className="text-xs text-zinc-400 leading-relaxed mb-3">
                                   {author.bio}
                                 </p>
                                 <div className="flex gap-3 border-t border-white/5 pt-3">
                                    {author.social.github && <Github size={14} className="text-zinc-500 hover:text-white transition-colors cursor-pointer" />}
                                    {author.social.twitter && <Twitter size={14} className="text-zinc-500 hover:text-white transition-colors cursor-pointer" />}
                                    {author.social.linkedin && <Linkedin size={14} className="text-zinc-500 hover:text-white transition-colors cursor-pointer" />}
                                 </div>
                              </div>
                              {/* Tooltip Arrow */}
                              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-zinc-950/90 border-r border-b border-white/10 rotate-45"></div>
                           </div>
                        </div>
                      ))}
                   </div>
                   {authors && (
                     <div className="ml-4 text-xs text-muted-foreground/50 italic">
                        + {authors.length} active members
                     </div>
                   )}
                 </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Status / Quick Info */}
        <motion.div variants={item} className="flex flex-col gap-6 h-full">
           <Card className="bg-zinc-900/50 backdrop-blur flex-shrink-0">
             <CardHeader className="pb-2">
               <CardTitle className="text-base">Current Status</CardTitle>
             </CardHeader>
             <CardContent>
               <div className="flex items-center gap-2 text-green-400">
                 <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                 <span className="text-sm font-medium">Accepting Projects</span>
               </div>
               <p className="text-xs text-muted-foreground mt-2">Global / Remote First</p>
             </CardContent>
           </Card>
           <Card className="bg-zinc-900/50 backdrop-blur flex-1 flex flex-col justify-center">
              <CardContent className="flex justify-between items-center w-full p-6">
                 <div>
                   <div className="text-2xl font-bold">{posts?.length || 0}</div>
                   <div className="text-xs text-muted-foreground">Articles Written</div>
                 </div>
                 <div className="h-8 w-[1px] bg-border"></div>
                 <div>
                   <div className="text-2xl font-bold">{photos?.length || 0}</div>
                   <div className="text-xs text-muted-foreground">Photos Taken</div>
                 </div>
              </CardContent>
           </Card>
        </motion.div>
      </div>

      {/* Map Section */}
      <motion.div variants={item} className="h-[400px] w-full">
        <Map locations={mapLocations} className="h-full w-full shadow-2xl" />
      </motion.div>

      {/* Bento Grid Lower Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Latest Article */}
        <motion.div variants={item}>
          <Card className="h-full group cursor-pointer hover:bg-zinc-900/80 transition-all">
            <Link to="/blog">
              <CardHeader>
                <div className="flex justify-between items-center mb-2">
                  <Badge variant="outline">Latest Post</Badge>
                  <ArrowRight className="text-muted-foreground group-hover:text-primary transition-colors" size={18} />
                </div>
                <CardTitle className="line-clamp-1">{posts?.[0]?.title}</CardTitle>
                <CardDescription>{posts?.[0]?.date}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {posts?.[0]?.excerpt}
                </p>
              </CardContent>
            </Link>
          </Card>
        </motion.div>

        {/* Latest Photo */}
         <motion.div variants={item}>
           <Card className="h-full overflow-hidden group relative border-0">
             <Link to="/gallery">
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors z-10" />
                <img 
                  src={photos?.[0]?.url || "https://picsum.photos/800/400"} 
                  alt="Latest" 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                <div className="relative z-20 p-6 h-full flex flex-col justify-end">
                  <div className="flex items-center gap-2 text-white/80 text-xs mb-1">
                    <MapPin size={12} />
                    {photos?.[0]?.location.name}
                  </div>
                  <h3 className="text-white font-bold text-xl">{photos?.[0]?.caption}</h3>
                </div>
             </Link>
           </Card>
         </motion.div>
      </div>

      {/* Footer */}
      <motion.div variants={item} className="flex justify-between items-center text-xs text-muted-foreground mt-12 py-6 border-t border-white/5">
        <span>&copy; 2024 Infini Collective. All rights reserved.</span>
        <Link to="/admin/login" className="hover:text-primary transition-colors">Admin Access</Link>
      </motion.div>
    </motion.div>
  );
};

export default Home;
