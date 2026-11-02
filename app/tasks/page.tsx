'use client';

import { useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, onSnapshot, query, runTransaction, serverTimestamp, where } from 'firebase/firestore';
import { Check2Circle, Circle, PersonFill } from 'react-bootstrap-icons';
import AuthGuard from '@/components/AuthGuard';
import BottomNav from '@/components/BottomNav';
import TaskModal from '@/components/TaskModal';
import TopNav from '@/components/TopNav';
import { auth, db } from '@/lib/firebase';
import { getUserPairId } from '@/lib/pairs';
import type { SharedTask } from '@/lib/types';
import SectionLoader from '@/components/SectionLoader';
import { nextTaskDate } from '@/lib/taskDates';
import { dateKey } from '@/lib/coupleCalendar';

export default function TasksPage() {
  const [tasks, setTasks] = useState<SharedTask[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedTask, setSelectedTask] = useState<SharedTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string[]>([]);

  useEffect(() => {
    let unsubscribeTasks: (() => void) | undefined;
    let cancelled = false;
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      unsubscribeTasks?.();
      if (!user) return setLoading(false);
      try {
        const pairId = await getUserPairId(user.uid);
        if (!pairId || cancelled) return setLoading(false);
        const tasksQuery = query(collection(db, 'tasks'), where('pairId', '==', pairId));
        unsubscribeTasks = onSnapshot(tasksQuery, (snapshot) => {
          const nextTasks = snapshot.docs.map((taskDoc) => ({
            id: taskDoc.id,
            ...taskDoc.data(),
          } as SharedTask));
          nextTasks.sort((a, b) => {
            const aTime = 'seconds' in (a.createdAt || {}) ? (a.createdAt as { seconds: number }).seconds : 0;
            const bTime = 'seconds' in (b.createdAt || {}) ? (b.createdAt as { seconds: number }).seconds : 0;
            return bTime - aTime;
          });
          setTasks(nextTasks);
          setLoading(false);
        }, (error) => {
          console.error('Error loading tasks:', error);
          setLoading(false);
        });
      } catch (error) {
        console.error('Error resolving pair:', error);
        setLoading(false);
      }
    });
    return () => { cancelled = true; unsubscribeAuth(); unsubscribeTasks?.(); };
  }, []);

  const pending = useMemo(() => tasks.filter((task) => !task.completed).sort((a, b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999')), [tasks]);
  const completed = useMemo(() => tasks.filter((task) => task.completed), [tasks]);

  const toggleTask = async (task: SharedTask) => {
    setUpdating((current) => [...current, task.id]);
    try {
      await runTransaction(db, async (transaction) => {
        const reference = doc(db, 'tasks', task.id);
        const snapshot = await transaction.get(reference);
        if (!snapshot.exists()) return;
        const current = snapshot.data() as SharedTask;
        if (current.completed !== task.completed) return;
        // A deterministic ID prevents duplicate occurrences when both people complete a task.
        if (!current.completed && current.repeat && current.repeat !== 'none') {
          const repeatDay = current.repeatDay || Number(current.dueDate?.slice(-2)) || new Date().getDate();
          const nextDate = nextTaskDate(current.dueDate || '', current.repeat, undefined, repeatDay);
          const nextId = `${task.id.split('__next__')[0]}__next__${nextDate}`;
          const nextReference = doc(db, 'tasks', nextId);
          const nextSnapshot = await transaction.get(nextReference);
          if (!nextSnapshot.exists()) transaction.set(nextReference, { pairId: current.pairId, title: current.title, assignedTo: current.assignedTo, dueDate: nextDate, repeat: current.repeat, repeatDay, completed: false, completedAt: null, createdAt: serverTimestamp() });
        }
        transaction.update(reference, { completed: !current.completed, completedAt: current.completed ? null : serverTimestamp() });
      });
    } catch (error) {
      console.error('Error toggling task:', error);
      alert('No se pudo actualizar la tarea.');
    } finally { setUpdating((current) => current.filter((id) => id !== task.id)); }
  };

  const renderTask = (task: SharedTask) => (
    <article className={`shared-task-row ${task.completed ? 'is-completed' : ''}`} key={task.id}>
      <button
        type="button"
        className="task-toggle"
        aria-label={task.completed ? `Marcar ${task.title} como pendiente` : `Completar ${task.title}`}
        aria-pressed={task.completed}
        disabled={updating.includes(task.id)}
        onClick={() => toggleTask(task)}
      >
        {task.completed ? <Check2Circle size={24} /> : <Circle size={24} />}
      </button>
      <button type="button" className="task-copy" onClick={() => setSelectedTask(task)}>
        <strong>{task.title}</strong>
        <span><PersonFill size={12} aria-hidden="true" /> {task.assignedTo}</span>
        {task.dueDate && <span className={!task.completed && task.dueDate < dateKey(new Date()) ? 'task-overdue' : ''}>{!task.completed && task.dueDate < dateKey(new Date()) ? 'Vencida · ' : ''}{new Date(`${task.dueDate}T12:00:00`).toLocaleDateString('es-ES')}</span>}
        {task.repeat && task.repeat !== 'none' && <span>↻ {({ daily: 'Cada día', weekly: 'Cada semana', monthly: 'Cada mes' })[task.repeat]}</span>}
      </button>
    </article>
  );

  if (loading) return <SectionLoader label="Cargando tareas" />;

  return (
    <AuthGuard>
      <TopNav title="Tareas" onAddClick={() => setShowAdd(true)} />
      <main className="dashboard-shell">
        <div className="container dashboard-container tasks-page">
          <section className="tasks-panel" aria-labelledby="pending-title">
            <div className="section-heading">
              <div><span className="section-kicker">Compartidas</span><h1 id="pending-title">Tareas pendientes</h1></div>
              <span className="count-badge">{pending.length}</span>
            </div>
            <div className="shared-task-list">
              {pending.length ? pending.map(renderTask) : (
                <div className="empty-state task-empty-state"><p><strong>Todo hecho por ahora <span aria-hidden="true">♥</span></strong><small>No tenéis ninguna tarea pendiente.</small></p><button type="button" className="inline-action" onClick={() => setShowAdd(true)}>Añadir tarea</button></div>
              )}
            </div>
          </section>
          <section className="tasks-panel" aria-labelledby="completed-title">
            <div className="section-heading"><div><span className="section-kicker">Hechas</span><h2 id="completed-title">Completadas</h2></div><span className="count-badge">{completed.length}</span></div>
            <div className="shared-task-list">
              {completed.length ? completed.map(renderTask) : <div className="tasks-empty-copy"><strong>Aún no habéis completado ninguna tarea.</strong><span>Cuando terminéis alguna, aparecerá aquí.</span></div>}
            </div>
          </section>
        </div>
      </main>
      <TaskModal show={showAdd} onHide={() => setShowAdd(false)} />
      <TaskModal show={!!selectedTask} task={selectedTask} onHide={() => setSelectedTask(null)} />
      <BottomNav />
    </AuthGuard>
  );
}
