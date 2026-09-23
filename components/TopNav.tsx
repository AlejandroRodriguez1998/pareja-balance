'use client';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { CashCoin, Check2Square, EggFried, GearFill, HeartFill, Plus } from 'react-bootstrap-icons';
import { Modal } from 'react-bootstrap';
import AddExpenseModal from './AddExpenseModal';
import AddMealModal from './AddMealModal';
import CoupleDataModal from './CoupleDataModal';
import SettingsModal from './SettingsModal';
import TaskModal from './TaskModal';

type Props = {
  title: string;
  onAddClick?: () => void;
};

export default function TopNav({ title, onAddClick }: Props) {
  const pathname = usePathname();
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const chooseAction = (action: 'expense' | 'meal' | 'task' | 'plan') => {
    setShowActions(false);
    if (action === 'expense') setShowAddExpense(true);
    if (action === 'meal') setShowAddMeal(true);
    if (action === 'task') setShowAddTask(true);
    if (action === 'plan') setShowAddPlan(true);
  };

  const handleDefaultAdd = () => {
    if (pathname === '/history') {
      chooseAction('expense');
      return;
    }

    if (pathname === '/dashboard') {
      const favorite = localStorage.getItem('pareja-balance-favorite-action');
      if (favorite === 'expense' || favorite === 'meal' || favorite === 'task' || favorite === 'plan') {
        chooseAction(favorite);
        return;
      }
    }
    setShowActions(true);
  };

  return (
    <>
      <nav className="app-top-nav">
        <button className="nav-icon-button" onClick={() => setShowSettings(true)} aria-label="Ajustes">
          <GearFill size={20} />
        </button>
        <h5>{title}</h5>
        <button
          className="nav-icon-button nav-icon-button-primary"
          onClick={onAddClick || handleDefaultAdd}
          aria-label="Anadir"
        >
          <Plus size={24} />
        </button>
      </nav>

      {!onAddClick && (
        <>
          <Modal show={showActions} onHide={() => setShowActions(false)} dialogClassName="app-modal-dialog quick-action-dialog" contentClassName="custom-modal-bg quick-action-sheet">
            <Modal.Header closeButton><Modal.Title>Añadir</Modal.Title></Modal.Header>
            <Modal.Body>
              <div className="quick-action-list">
                <button type="button" onClick={() => chooseAction('expense')}><CashCoin /><span><strong>Gasto</strong><small>Registrar un gasto compartido</small></span></button>
                <button type="button" onClick={() => chooseAction('meal')}><EggFried /><span><strong>Comida</strong><small>Añadir al plan semanal</small></span></button>
                <button type="button" onClick={() => chooseAction('task')}><Check2Square /><span><strong>Tarea</strong><small>Crear una tarea compartida</small></span></button>
                <button type="button" onClick={() => chooseAction('plan')}><HeartFill /><span><strong>Plan</strong><small>Guardar vuestro próximo plan</small></span></button>
              </div>
            </Modal.Body>
          </Modal>
          <AddExpenseModal show={showAddExpense} onHide={() => setShowAddExpense(false)} />
          <AddMealModal show={showAddMeal} onHide={() => setShowAddMeal(false)} />
          <TaskModal show={showAddTask} onHide={() => setShowAddTask(false)} />
          <CoupleDataModal show={showAddPlan} focusPlan onHide={() => setShowAddPlan(false)} />
        </>
      )}
      <SettingsModal show={showSettings} onHide={() => setShowSettings(false)} />
    </>
  );
}
