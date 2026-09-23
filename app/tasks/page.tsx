'use client';

import { useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, onSnapshot, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { Check2Circle, Circle, PersonFill } from 'react-bootstrap-icons';
import AuthGuard from '@/components/AuthGuard';
import BottomNav from '@/components/BottomNav';
import TaskModal from '@/components/TaskModal';
import TopNav from '@/components/TopNav';
import { auth, db } from '@/lib/firebase';
import { getUserPairId } from '@/lib/pairs';
import type { SharedTask } from '@/lib/types';

export default function TasksPage() {
  const [tasks, setTasks] = useState<SharedTask[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedTask, setSelectedTask] = useState<SharedTask | null>(null);
  const [loading, setLoading] = useState(true);

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

  const pending = useMemo(() => tasks.filter((task) => !task.completed), [tasks]);
  const completed = useMemo(() => tasks.filter((task) => task.completed), [tasks]);

  const toggleTask = async (task: SharedTask) => {
    try {
      await updateDoc(doc(db, 'tasks', task.id), {
        completed: !task.completed,
        completedAt: task.completed ? null : serverTimestamp(),
      });
    } catch (error) {
      console.error('Error toggling task:', error);
      alert('No se pudo actualizar la tarea.');
    }
  };

  const renderTask = (task: SharedTask) => (
    <article className={`shared-task-row ${task.completed ? 'is-completed' : ''}`} key={task.id}>
      <button
        type="button"
        className="task-toggle"
        aria-label={task.completed ? `Marcar ${task.title} como pendiente` : `Completar ${task.title}`}
        aria-pressed={task.completed}
        onClick={() => toggleTask(task)}
      >
        {task.completed ? <Check2Circle size={24} /> : <Circle size={24} />}
      </button>
      <button type="button" className="task-copy" onClick={() => setSelectedTask(task)}>
        <strong>{task.title}</strong>
        <span><PersonFill size={12} aria-hidden="true" /> {task.assignedTo}</span>
      </button>
    </article>
  );

  if (loading) return <div className="app-loading-screen"><div className="spinner-border app-loading-spinner" role="status" /></div>;

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
