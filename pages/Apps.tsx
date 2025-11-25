import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { ExternalLink, CheckCircle, TrendingUp, Mic, Box } from 'lucide-react';

const iconMap: Record<string, any> = {
  CheckCircle,
  TrendingUp,
  Mic,
  Box
};

const Apps: React.FC = () => {
  const { data: apps, isLoading } = useQuery({ queryKey: ['apps'], queryFn: api.getApps });

  if (isLoading) return <div className="flex h-screen items-center justify-center text-muted-foreground">Loading Projects...</div>;

  return (
    <div className="container mx-auto max-w-5xl p-6 pb-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="text-3xl font-bold tracking-tight mb-2">Applications</h1>
        <p className="text-muted-foreground">Tools and experiments I've shipped recently.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {apps?.map((app, i) => {
          const Icon = iconMap[app.icon] || Box;
          return (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="h-full flex flex-col hover:border-primary/50 transition-colors group">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform duration-300">
                    <Icon size={24} />
                  </div>
                  <CardTitle>{app.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground mb-4">{app.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {app.tags.map(tag => (
                      <Badge key={tag} className="bg-secondary/50 hover:bg-secondary">{tag}</Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                   <a 
                     href={app.url} 
                     className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                   >
                     View Project <ExternalLink size={14} />
                   </a>
                </CardFooter>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Apps;