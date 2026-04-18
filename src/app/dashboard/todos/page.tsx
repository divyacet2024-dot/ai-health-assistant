'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CheckSquare, Plus, Check, Trash2, Clock, AlertTriangle, Flag } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { cn } from '@/lib/utils';
import { getRole } from '@/lib/store';
import { UserRole } from '@/lib/types';
import { getTodos, addTodo, toggleTodo, deleteTodo, TodoItem, seedCommunicationData } from '@/lib/communication';

const CATEGORIES: Record<string, string[]> = {
  patient: ['Medicine Reminder', 'Health Check', 'Exercise', 'Appointment', 'Diet', 'Other'],
  student: ['Study', 'Practice', 'Assignment', 'Exam Prep', 'Reading', 'Other'],
  doctor: ['Patient Follow-up', 'Lab Review', 'Surgery', 'Meeting', 'Research', 'Other'],
  professor: ['Grading', 'Assessment', 'Lecture Prep', 'Research', 'Meeting', 'Other'],
};

const PRIORITY_COLORS = {
  high: 'border-l-destructive text-destructive',
  medium: 'border-l-chart-5 text-chart-5',
  low: 'border-l-chart-3 text-chart-3',
};

export default function TodosPage() {
  const [role, setRoleState] = useState<UserRole | null>(null);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [newDueDate, setNewDueDate] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    setMounted(true);
    seedCommunicationData();
    const r = getRole();
    setRoleState(r);
    if (r) setTodos(getTodos(r));
  }, []);

  function refresh() {
    if (role) setTodos(getTodos(role));
  }

  function handleAdd() {
    if (!newTitle || !role) return;
    addTodo({ title: newTitle, description: newDesc, category: newCategory || 'Other', priority: newPriority, dueDate: newDueDate || undefined, role });
    setNewTitle(''); setNewDesc(''); setNewCategory(''); setNewPriority('medium'); setNewDueDate('');
    setShowAdd(false);
    refresh();
  }

  function handleToggle(id: string) { toggleTodo(id); refresh(); }
  function handleDelete(id: string) { deleteTodo(id); refresh(); }

  if (!mounted || !role) return null;

  const categories = CATEGORIES[role] || CATEGORIES.patient;
  const filteredTodos = todos.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });
  const completedCount = todos.filter((t) => t.completed).length;

  return (
    <AppShell>
      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold">To-Do List</h1>
            <p className="text-muted-foreground mt-1">Track your tasks, reminders, and follow-ups.</p>
          </div>
          <button onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition shadow-md">
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </motion.div>

        {/* Progress */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm font-bold font-display">{completedCount}/{todos.length}</span>
          </div>
          <div className="h-2.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${todos.length > 0 ? (completedCount / todos.length) * 100 : 0}%` }} />
          </div>
        </div>

        {/* Add Form */}
        {showAdd && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-5 space-y-3">
            <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Task title *"
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm outline-none focus:ring-2 focus:ring-primary/30" />
            <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Description (optional)"
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm outline-none resize-none focus:ring-2 focus:ring-primary/30" rows={2} />
            <div className="grid grid-cols-3 gap-3">
              <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)}
                className="px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none">
                <option value="">Category</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={newPriority} onChange={(e) => setNewPriority(e.target.value as 'high' | 'medium' | 'low')}
                className="px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none">
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
              <input type="date" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)}
                className="px-3 py-2 rounded-xl border border-border bg-background text-sm outline-none" />
            </div>
            <button onClick={handleAdd} disabled={!newTitle}
              className="px-5 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:opacity-90 transition disabled:opacity-40">
              Add Task
            </button>
          </motion.div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-1 bg-muted rounded-xl p-1">
          {(['all', 'active', 'completed'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn('flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all capitalize',
                filter === f ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}>{f} ({f === 'all' ? todos.length : f === 'active' ? todos.length - completedCount : completedCount})</button>
          ))}
        </div>

        {/* Todo List */}
        <div className="space-y-2">
          {filteredTodos.map((todo) => (
            <motion.div key={todo.id} layout
              className={cn('flex items-start gap-3 p-4 bg-card border border-border rounded-xl border-l-4 transition-all',
                PRIORITY_COLORS[todo.priority].split(' ')[0],
                todo.completed && 'opacity-50'
              )}>
              <button onClick={() => handleToggle(todo.id)}
                className={cn('w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition',
                  todo.completed ? 'bg-primary border-primary' : 'border-border hover:border-primary')}>
                {todo.completed && <Check className="w-3 h-3 text-primary-foreground" />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={cn('text-sm font-medium', todo.completed && 'line-through')}>{todo.title}</p>
                {todo.description && <p className="text-xs text-muted-foreground mt-0.5">{todo.description}</p>}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">{todo.category}</span>
                  <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium capitalize', PRIORITY_COLORS[todo.priority].split(' ').map((c) => c.replace('border-l-', 'bg-') + '/10').join(' '), PRIORITY_COLORS[todo.priority].split(' ')[1])}>
                    <Flag className="w-2.5 h-2.5 inline mr-0.5" />{todo.priority}
                  </span>
                  {todo.dueDate && (
                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" /> {todo.dueDate}
                    </span>
                  )}
                </div>
              </div>
              <button onClick={() => handleDelete(todo.id)}
                className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition shrink-0">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </div>

        {filteredTodos.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <CheckSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No {filter !== 'all' ? filter : ''} tasks found.</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
