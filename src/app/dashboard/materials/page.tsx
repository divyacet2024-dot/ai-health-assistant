'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BookOpen, FileText, Video, Plus, Trash2, Upload, Link as LinkIcon } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { cn } from '@/lib/utils';

interface Material {
  id: string;
  title: string;
  subject: string;
  type: 'document' | 'video' | 'link';
  description: string;
  dateShared: string;
}

const DEFAULT_MATERIALS: Material[] = [
  { id: 'mat1', title: 'Anatomy — Upper Limb Complete PDF', subject: 'Anatomy', type: 'document', description: 'Comprehensive notes covering muscles, nerves, and blood supply of the upper limb.', dateShared: '2026-04-05' },
  { id: 'mat2', title: 'Pharmacology — Drug Classification Chart', subject: 'Pharmacology', type: 'document', description: 'Quick reference chart for all major drug classes with mechanisms and uses.', dateShared: '2026-04-03' },
  { id: 'mat3', title: 'ECG Interpretation Tutorial', subject: 'Medicine', type: 'video', description: 'Step-by-step video guide to reading and interpreting ECGs.', dateShared: '2026-04-06' },
  { id: 'mat4', title: 'Pathology Slide Images Collection', subject: 'Pathology', type: 'link', description: 'Online repository of histopathology slide images for self-study.', dateShared: '2026-04-04' },
];

const STORAGE_KEY = 'aihealthassist_materials';
const SUBJECTS = ['Anatomy', 'Physiology', 'Biochemistry', 'Pharmacology', 'Pathology', 'Microbiology', 'Medicine', 'Surgery'];

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newType, setNewType] = useState<Material['type']>('document');
  const [newDesc, setNewDesc] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      setMaterials(saved ? JSON.parse(saved) : DEFAULT_MATERIALS);
    } catch {
      setMaterials(DEFAULT_MATERIALS);
    }
  }, []);

  function save(updated: Material[]) {
    setMaterials(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  function addMaterial() {
    if (!newTitle || !newSubject) return;
    const mat: Material = {
      id: `mat-${Date.now()}`,
      title: newTitle,
      subject: newSubject,
      type: newType,
      description: newDesc,
      dateShared: new Date().toISOString().split('T')[0],
    };
    save([mat, ...materials]);
    setNewTitle('');
    setNewSubject('');
    setNewDesc('');
    setShowAdd(false);
  }

  function deleteMaterial(id: string) {
    save(materials.filter((m) => m.id !== id));
  }

  if (!mounted) return null;

  const typeIcons = { document: FileText, video: Video, link: LinkIcon };
  const typeColors = { document: 'bg-chart-1/10 text-chart-1', video: 'bg-chart-3/10 text-chart-3', link: 'bg-chart-4/10 text-chart-4' };

  return (
    <AppShell>
      <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold">Teaching Materials</h1>
            <p className="text-muted-foreground mt-1">Share study materials with your students.</p>
          </div>
          <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition">
            <Plus className="w-4 h-4" /> Share New
          </button>
        </motion.div>

        {showAdd && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-5 space-y-3">
            <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Material title" className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm outline-none" />
            <div className="grid grid-cols-2 gap-3">
              <select value={newSubject} onChange={(e) => setNewSubject(e.target.value)} className="px-4 py-2.5 rounded-xl border border-border bg-background text-sm outline-none">
                <option value="">Select subject</option>
                {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <div className="flex gap-1 bg-muted rounded-xl p-1">
                {(['document', 'video', 'link'] as const).map((t) => (
                  <button key={t} onClick={() => setNewType(t)} className={cn('flex-1 px-2 py-1.5 rounded-lg text-xs font-medium capitalize transition', newType === t ? 'bg-card shadow-sm' : 'text-muted-foreground')}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Description (optional)" className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm resize-none outline-none" rows={2} />
            <button onClick={addMaterial} disabled={!newTitle || !newSubject} className="px-5 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition disabled:opacity-40">
              <Upload className="w-4 h-4 inline mr-1" /> Share Material
            </button>
          </motion.div>
        )}

        <div className="space-y-3">
          {materials.map((mat, i) => {
            const Icon = typeIcons[mat.type];
            return (
              <motion.div
                key={mat.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-card border border-border rounded-2xl p-5 flex items-start gap-4"
              >
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', typeColors[mat.type])}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm">{mat.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">{mat.subject}</span>
                    <span className="text-[10px] text-muted-foreground capitalize">{mat.type}</span>
                    <span className="text-[10px] text-muted-foreground">· {mat.dateShared}</span>
                  </div>
                  {mat.description && <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{mat.description}</p>}
                </div>
                <button onClick={() => deleteMaterial(mat.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
