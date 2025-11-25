import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Calendar, Clock, MapPin } from 'lucide-react';

const Blog: React.FC = () => {
  const { data: posts, isLoading } = useQuery({ queryKey: ['posts'], queryFn: api.getPosts });

  if (isLoading) return <div className="p-10 text-center">Loading thoughts...</div>;

  return (
    <div className="container mx-auto max-w-3xl p-6 pb-32">
      <motion.h1 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-3xl font-bold tracking-tight mb-8"
      >
        Writings
      </motion.h1>

      <div className="space-y-6">
        {posts?.map((post, i) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="group cursor-pointer hover:bg-secondary/20 transition-colors">
              <CardHeader>
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mb-2">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} />
                    {post.date}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    {post.readTime}
                  </div>
                  {post.location && (
                    <div className="flex items-center gap-1 text-primary/80">
                      <MapPin size={12} />
                      {post.location.name}
                    </div>
                  )}
                </div>
                <CardTitle className="group-hover:text-primary transition-colors">{post.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {post.excerpt}
                </p>
                <div className="mt-4 text-sm font-medium text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                  Read more →
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Blog;