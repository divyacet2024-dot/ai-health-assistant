'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Mail, Send, Inbox, ArrowRight, Clock, Check, FileText, Megaphone, Award, X } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { cn } from '@/lib/utils';
import { getRole } from '@/lib/store';
import { getSession } from '@/lib/auth';
import { UserRole } from '@/lib/types';
import { getInbox, getSentMessages, sendMessage, markMessageRead, Message, seedCommunicationData } from '@/lib/communication';

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  message: Mail, prescription: FileText, assignment: FileText, announcement: Megaphone, report: FileText, grade: Award,
};
const TYPE_COLORS: Record<string, string> = {
  message: 'bg-chart-1/10 text-chart-1', prescription: 'bg-chart-3/10 text-chart-3', assignment: 'bg-chart-2/10 text-chart-2',
  announcement: 'bg-chart-5/10 text-chart-5', report: 'bg-chart-4/10 text-chart-4', grade: 'bg-accent/10 text-accent',
};

export default function MessagesPage() {
  const [role, setRoleState] = useState<UserRole | null>(null);
  const [inbox, setInbox] = useState<Message[]>([]);
  const [sent, setSent] = useState<Message[]>([]);
  const [tab, setTab] = useState<'inbox' | 'sent' | 'compose'>('inbox');
  const [selected, setSelected] = useState<Message | null>(null);
  const [mounted, setMounted] = useState(false);

  // Compose
  const [toName, setToName] = useState('');
  const [toRole, setToRole] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [msgType, setMsgType] = useState<Message['type']>('message');
  const [sendSuccess, setSendSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
    seedCommunicationData();
    const r = getRole();
    setRoleState(r);
    if (r) { setInbox(getInbox(r)); setSent(getSentMessages(r)); }
  }, []);

  function refresh() {
    if (role) { setInbox(getInbox(role)); setSent(getSentMessages(role)); }
  }

  function handleSend() {
    if (!toName || !subject || !content || !role) return;
    const session = getSession();
    sendMessage({
      fromId: session?.userId || 'unknown',
      fromName: session?.name || 'Unknown',
      fromRole: role,
      toId: 'target',
      toName,
      toRole: toRole || 'patient',
      subject,
      content,
      type: msgType,
    });
    setSendSuccess(true);
    setToName(''); setToRole(''); setSubject(''); setContent(''); setMsgType('message');
    refresh();
    setTimeout(() => { setSendSuccess(false); setTab('sent'); }, 1500);
  }

  function handleRead(msg: Message) {
    markMessageRead(msg.id);
    setSelected(msg);
    refresh();
  }

  if (!mounted || !role) return null;

  const unreadCount = inbox.filter((m) => !m.read).length;
  const canCompose = role === 'doctor' || role === 'professor';
  const recipientRoles = role === 'doctor' ? ['patient'] : role === 'professor' ? ['student'] : [];
  const messageTypes: Message['type'][] = role === 'doctor' ? ['message', 'prescription', 'report'] : role === 'professor' ? ['message', 'announcement', 'assignment', 'grade'] : ['message'];

  return (
    <AppShell>
      <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Messages</h1>
          <p className="text-muted-foreground mt-1">
            {role === 'doctor' ? 'Send updates and prescriptions to patients' :
             role === 'professor' ? 'Send announcements and assignments to students' :
             'View messages from your doctor or professor'}
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted rounded-xl p-1">
          <button onClick={() => setTab('inbox')} className={cn('flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition',
            tab === 'inbox' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground')}>
            <Inbox className="w-3.5 h-3.5" /> Inbox {unreadCount > 0 && <span className="w-4 h-4 bg-destructive text-destructive-foreground rounded-full text-[9px] flex items-center justify-center">{unreadCount}</span>}
          </button>
          <button onClick={() => setTab('sent')} className={cn('flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition',
            tab === 'sent' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground')}>
            <Send className="w-3.5 h-3.5" /> Sent ({sent.length})
          </button>
          {canCompose && (
            <button onClick={() => setTab('compose')} className={cn('flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition',
              tab === 'compose' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground')}>
              <Mail className="w-3.5 h-3.5" /> Compose
            </button>
          )}
        </div>

        {/* Inbox */}
        {tab === 'inbox' && (
          <div className="space-y-2">
            {inbox.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Inbox className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No messages yet</p>
              </div>
            ) : inbox.map((msg) => {
              const Icon = TYPE_ICONS[msg.type] || Mail;
              return (
                <motion.button key={msg.id} layout onClick={() => handleRead(msg)}
                  className={cn('w-full bg-card border border-border rounded-xl p-4 text-left hover:shadow-md transition-shadow flex items-start gap-3',
                    !msg.read && 'border-l-4 border-l-primary')}>
                  <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', TYPE_COLORS[msg.type] || TYPE_COLORS.message)}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={cn('text-sm truncate', !msg.read ? 'font-bold' : 'font-medium')}>{msg.subject}</p>
                      {!msg.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">From: {msg.fromName} ({msg.fromRole})</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{msg.content}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium capitalize', TYPE_COLORS[msg.type])}>{msg.type}</span>
                    <p className="text-[10px] text-muted-foreground mt-1">{new Date(msg.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}

        {/* Sent */}
        {tab === 'sent' && (
          <div className="space-y-2">
            {sent.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Send className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No sent messages</p>
              </div>
            ) : sent.map((msg) => (
              <div key={msg.id} className="bg-card border border-border rounded-xl p-4 flex items-start gap-3 opacity-80">
                <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', TYPE_COLORS[msg.type])}>
                  <Check className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{msg.subject}</p>
                  <p className="text-xs text-muted-foreground">To: {msg.toName} ({msg.toRole})</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{msg.content}</p>
                </div>
                <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium capitalize', TYPE_COLORS[msg.type])}>{msg.type}</span>
              </div>
            ))}
          </div>
        )}

        {/* Compose */}
        {tab === 'compose' && canCompose && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-6 space-y-4">
            {sendSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-chart-3/20 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-chart-3" />
                </div>
                <h3 className="font-display font-bold text-xl text-chart-3">Message Sent!</h3>
              </div>
            ) : (
              <>
                <h2 className="font-display font-semibold text-lg">New Message</h2>
                <div className="grid md:grid-cols-2 gap-3">
                  <input type="text" value={toName} onChange={(e) => setToName(e.target.value)} placeholder="Recipient name *"
                    className="px-4 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                  <select value={toRole} onChange={(e) => setToRole(e.target.value)}
                    className="px-4 py-2.5 rounded-xl border border-border bg-background text-sm outline-none">
                    <option value="">Recipient role</option>
                    {recipientRoles.map((r) => <option key={r} value={r} className="capitalize">{r}</option>)}
                  </select>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject *"
                    className="px-4 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                  <select value={msgType} onChange={(e) => setMsgType(e.target.value as Message['type'])}
                    className="px-4 py-2.5 rounded-xl border border-border bg-background text-sm outline-none">
                    {messageTypes.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
                  </select>
                </div>
                <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Message content *"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm outline-none resize-none focus:ring-2 focus:ring-primary/30" rows={5} />
                <button onClick={handleSend} disabled={!toName || !subject || !content}
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition disabled:opacity-40 shadow-md">
                  <Send className="w-4 h-4" /> Send Message
                </button>
              </>
            )}
          </motion.div>
        )}

        {/* Message Detail Modal */}
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelected(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-card border border-border rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="font-display font-bold text-lg">{selected.subject}</h2>
                  <p className="text-xs text-muted-foreground mt-1">From: {selected.fromName} ({selected.fromRole}) · {new Date(selected.createdAt).toLocaleDateString()}</p>
                </div>
                <button onClick={() => setSelected(null)} className="p-2 rounded-lg hover:bg-muted"><X className="w-4 h-4" /></button>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <span className={cn('text-xs px-2.5 py-1 rounded-full font-medium capitalize', TYPE_COLORS[selected.type])}>{selected.type}</span>
                <span className="text-xs text-muted-foreground">To: {selected.toName}</span>
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap">{selected.content}</div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </AppShell>
  );
}
