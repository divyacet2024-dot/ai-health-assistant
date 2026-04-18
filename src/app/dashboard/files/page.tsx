'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Upload, FileText, Download, Trash2, Eye, Search, FolderOpen, Plus, X, File } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { cn } from '@/lib/utils';
import { getRole } from '@/lib/store';
import { getSession } from '@/lib/auth';
import { UserRole } from '@/lib/types';
import { getUploadedFiles, addUploadedFile, deleteUploadedFile, UploadedFile, seedCommunicationData } from '@/lib/communication';

const FILE_CATEGORIES = ['Anatomy', 'Physiology', 'Biochemistry', 'Pharmacology', 'Pathology', 'Microbiology', 'Medicine', 'Surgery', 'Forensic Medicine', 'Other'];

export default function FilesPage() {
  const [role, setRoleState] = useState<UserRole | null>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [viewingFile, setViewingFile] = useState<UploadedFile | null>(null);

  // Upload form
  const [fileName, setFileName] = useState('');
  const [fileCategory, setFileCategory] = useState('');
  const [fileDesc, setFileDesc] = useState('');
  const [fileType, setFileType] = useState('application/pdf');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
    seedCommunicationData();
    const r = getRole();
    setRoleState(r);
    setFiles(getUploadedFiles());
  }, []);

  function refresh() { setFiles(getUploadedFiles()); }

  function handleUpload() {
    if (!fileName || !fileCategory) return;
    const session = getSession();
    addUploadedFile({
      name: fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`,
      type: fileType,
      size: Math.floor(Math.random() * 5000000) + 500000,
      category: fileCategory,
      uploadedBy: session?.name || 'Unknown',
      uploadedByRole: role || 'professor',
      description: fileDesc,
      downloadUrl: '#',
    });
    setFileName(''); setFileCategory(''); setFileDesc('');
    setShowUpload(false);
    setUploadSuccess(true);
    setTimeout(() => setUploadSuccess(false), 2000);
    refresh();
  }

  function handleDelete(id: string) {
    deleteUploadedFile(id);
    refresh();
  }

  function handleDownload(file: UploadedFile) {
    const content = `
═══════════════════════════════════════════════
          AI HEALTH ASSIST
       STUDY MATERIAL
═══════════════════════════════════════════════

Title:       ${file.name}
Category:    ${file.category}
Uploaded by: ${file.uploadedBy}
Date:        ${new Date(file.createdAt).toLocaleDateString()}

───────────────────────────────────────────────
DESCRIPTION
───────────────────────────────────────────────

${file.description || 'No description provided.'}

───────────────────────────────────────────────

This is a placeholder document from AI Health Assist.
In a production environment, this would be the actual
uploaded PDF file.

Size: ${(file.size / 1024 / 1024).toFixed(1)} MB
Type: ${file.type}

═══════════════════════════════════════════════
    AI Health Assist — Healthcare Platform
═══════════════════════════════════════════════
`.trim();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name.replace('.pdf', '.txt');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  if (!mounted || !role) return null;

  const canUpload = role === 'professor' || role === 'doctor';
  const filtered = files.filter((f) => {
    const matchSearch = !search || f.name.toLowerCase().includes(search.toLowerCase()) || f.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = !categoryFilter || f.category === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <AppShell>
      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold">Study Materials & Files</h1>
            <p className="text-muted-foreground mt-1">
              {canUpload ? 'Upload and share teaching materials with students' : 'Browse and download study materials'}
            </p>
          </div>
          {canUpload && (
            <button onClick={() => setShowUpload(!showUpload)}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition shadow-md">
              <Upload className="w-4 h-4" /> Upload File
            </button>
          )}
        </motion.div>

        {uploadSuccess && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-chart-3/10 border border-chart-3/30 rounded-xl p-3 text-sm text-chart-3 font-medium text-center">
            File uploaded successfully!
          </motion.div>
        )}

        {/* Upload Form */}
        {showUpload && canUpload && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-semibold text-lg flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" /> Upload New Material
              </h2>
              <button onClick={() => setShowUpload(false)} className="p-2 rounded-lg hover:bg-muted"><X className="w-4 h-4" /></button>
            </div>

            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/30 transition cursor-pointer">
              <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">Drag and drop files here, or click to browse</p>
              <p className="text-[10px] text-muted-foreground mt-1">Supports PDF, DOC, PPT, images</p>
              <input type="file" className="hidden" accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.png" />
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">File Name *</label>
                <input type="text" value={fileName} onChange={(e) => setFileName(e.target.value)} placeholder="e.g., Anatomy_Upper_Limb_Notes.pdf"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Category *</label>
                <select value={fileCategory} onChange={(e) => setFileCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="">Select category</option>
                  {FILE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Description</label>
              <textarea value={fileDesc} onChange={(e) => setFileDesc(e.target.value)} placeholder="Brief description of the content..."
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm outline-none resize-none focus:ring-2 focus:ring-primary/30" rows={2} />
            </div>
            <button onClick={handleUpload} disabled={!fileName || !fileCategory}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition disabled:opacity-40 shadow-md">
              <Upload className="w-4 h-4" /> Upload & Share
            </button>
          </motion.div>
        )}

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search files..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:ring-2 focus:ring-primary/30 outline-none" />
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            <button onClick={() => setCategoryFilter('')}
              className={cn('px-3 py-1.5 rounded-lg text-xs font-medium border transition whitespace-nowrap',
                !categoryFilter ? 'bg-primary/10 border-primary text-primary' : 'border-border hover:bg-muted')}>All</button>
            {FILE_CATEGORIES.slice(0, 6).map((c) => (
              <button key={c} onClick={() => setCategoryFilter(categoryFilter === c ? '' : c)}
                className={cn('px-3 py-1.5 rounded-lg text-xs font-medium border transition whitespace-nowrap',
                  categoryFilter === c ? 'bg-primary/10 border-primary text-primary' : 'border-border hover:bg-muted')}>{c}</button>
            ))}
          </div>
        </div>

        {/* Files Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((file, i) => (
            <motion.div key={file.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.3) }}
              className="bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-destructive" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">{file.name}</h3>
                  <p className="text-[10px] text-muted-foreground">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                </div>
              </div>
              {file.description && <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{file.description}</p>}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">{file.category}</span>
                <span className="text-[10px] text-muted-foreground">by {file.uploadedBy}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setViewingFile(file)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-border hover:bg-muted transition text-xs font-medium">
                  <Eye className="w-3.5 h-3.5" /> View
                </button>
                <button onClick={() => handleDownload(file)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition text-xs font-medium">
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
                {canUpload && (
                  <button onClick={() => handleDelete(file.id)}
                    className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-display font-medium">No files found</p>
            <p className="text-sm mt-1">{canUpload ? 'Upload your first study material' : 'No materials available yet'}</p>
          </div>
        )}

        {/* View Modal */}
        {viewingFile && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setViewingFile(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-card border border-border rounded-2xl p-6 max-w-lg w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-destructive" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-lg">{viewingFile.name}</h2>
                    <p className="text-xs text-muted-foreground">{(viewingFile.size / 1024 / 1024).toFixed(1)} MB · {viewingFile.category}</p>
                  </div>
                </div>
                <button onClick={() => setViewingFile(null)} className="p-2 rounded-lg hover:bg-muted"><X className="w-4 h-4" /></button>
              </div>
              <div className="bg-muted/50 rounded-xl p-4 mb-4 space-y-2">
                <p className="text-sm"><strong>Uploaded by:</strong> {viewingFile.uploadedBy} ({viewingFile.uploadedByRole})</p>
                <p className="text-sm"><strong>Date:</strong> {new Date(viewingFile.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                <p className="text-sm"><strong>Type:</strong> {viewingFile.type}</p>
              </div>
              {viewingFile.description && (
                <div className="mb-4">
                  <h3 className="text-xs font-semibold text-muted-foreground mb-1">Description</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{viewingFile.description}</p>
                </div>
              )}
              <div className="bg-muted rounded-xl p-8 text-center mb-4">
                <File className="w-16 h-16 mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-xs text-muted-foreground">PDF preview would appear here in production</p>
              </div>
              <button onClick={() => { handleDownload(viewingFile); }}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition flex items-center justify-center gap-2 shadow-md">
                <Download className="w-4 h-4" /> Download File
              </button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </AppShell>
  );
}
