'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Video, ExternalLink, Play, Search } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { cn } from '@/lib/utils';
import { STUDY_NOTES } from '@/lib/mock-data';

const VIDEO_RECOMMENDATIONS = [
  { id: 'v1', title: 'Cardiovascular Physiology — Complete Lecture', subject: 'Physiology', channel: 'Medical Lectures Hub', duration: '45 min', url: 'https://www.youtube.com/results?search_query=cardiovascular+physiology+lecture' },
  { id: 'v2', title: 'Antibiotics Classification Made Easy', subject: 'Pharmacology', channel: 'Pharma Simplified', duration: '30 min', url: 'https://www.youtube.com/results?search_query=antibiotics+classification+pharmacology' },
  { id: 'v3', title: 'Diabetes Mellitus — Pathogenesis to Treatment', subject: 'Medicine', channel: 'Clinical Medicine Pro', duration: '55 min', url: 'https://www.youtube.com/results?search_query=diabetes+mellitus+medicine+lecture' },
  { id: 'v4', title: 'Brachial Plexus — Anatomy in 10 Minutes', subject: 'Anatomy', channel: 'Anatomy World', duration: '12 min', url: 'https://www.youtube.com/results?search_query=brachial+plexus+anatomy' },
  { id: 'v5', title: 'ECG Interpretation — Step by Step', subject: 'Medicine', channel: 'ECG Academy', duration: '40 min', url: 'https://www.youtube.com/results?search_query=ecg+interpretation+step+by+step' },
  { id: 'v6', title: 'Renal Physiology — GFR & Clearance', subject: 'Physiology', channel: 'Medical Lectures Hub', duration: '35 min', url: 'https://www.youtube.com/results?search_query=renal+physiology+GFR+lecture' },
  { id: 'v7', title: 'Immunology Basics — Innate vs Adaptive', subject: 'Microbiology', channel: 'Micro Made Simple', duration: '25 min', url: 'https://www.youtube.com/results?search_query=immunology+basics+innate+adaptive' },
  { id: 'v8', title: 'Inflammation & Healing — Pathology', subject: 'Pathology', channel: 'Pathology Pro', duration: '50 min', url: 'https://www.youtube.com/results?search_query=inflammation+healing+pathology+lecture' },
];

export default function VideosPage() {
  const [search, setSearch] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const filtered = VIDEO_RECOMMENDATIONS.filter((v) =>
    !search || v.title.toLowerCase().includes(search.toLowerCase()) || v.subject.toLowerCase().includes(search.toLowerCase())
  );

  if (!mounted) return null;

  return (
    <AppShell>
      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Video Lectures</h1>
          <p className="text-muted-foreground mt-1">Curated video lectures for every medical subject.</p>
        </motion.div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search video lectures..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:ring-2 focus:ring-primary/30 outline-none"
          />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((video, i) => (
            <motion.a
              key={video.id}
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="aspect-video bg-gradient-to-br from-primary/20 via-accent/10 to-chart-3/20 flex items-center justify-center relative">
                <div className="w-14 h-14 rounded-full bg-primary/20 backdrop-blur flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-6 h-6 text-primary ml-0.5" />
                </div>
                <span className="absolute bottom-2 right-2 text-[10px] px-2 py-0.5 rounded bg-black/60 text-white font-medium">{video.duration}</span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-2">{video.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{video.channel}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">{video.subject}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
