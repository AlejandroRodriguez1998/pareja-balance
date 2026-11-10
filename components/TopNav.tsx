'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { CashCoin, Check2Square, EggFried, GearFill, HeartFill, Plus } from 'react-bootstrap-icons';
import { Modal } from 'react-bootstrap';
import AddExpenseModal from './AddExpenseModal';
import AddMealModal from './AddMealModal';
import BrandMark from './BrandMark';
import ChopperHat from './ChopperHat';
import CoupleDataModal from './CoupleDataModal';
import SettingsModal from './SettingsModal';
import TaskModal from './TaskModal';

type Props = {
  title: string;
  onAddClick?: () => void;
};

const formatToday = () => new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })
  .format(new Date())
  .replace('.', '');

export default function TopNav({ title, onAddClick }: Props) {
  const pathname = usePathname();
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  // La fecha se pinta en cliente para no desajustar la hidratación por zona horaria.
  const [today, setToday] = useState('');

  useEffect(() => {
    setToday(formatToday());
    const onScroll = () => setIsScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
      <nav className={`app-top-nav top-nav-brand ${isScrolled ? 'is-scrolled' : ''}`}>
        <div className="top-nav-identity">
          <span className="top-nav-logo" aria-hidden="true">
            <BrandMark className="top-nav-logo-mark" ring={false} />
          </span>
          <div className="top-nav-heading">
            <span className="top-nav-eyebrow">{today || ' '}</span>
            <h5>{title}</h5>
          </div>
        </div>
        <button type="button" className="top-nav-settings" onClick={() => setShowSettings(true)} aria-label="Ajustes">
          <ChopperHat className="top-nav-settings-hat" />
          <span className="top-nav-settings-badge" aria-hidden="true">
            <GearFill size={9} />
          </span>
        </button>
      </nav>

      <button
        type="button"
        className={`app-fab ${showActions ? 'is-open' : ''}`}
        onClick={onAddClick || handleDefaultAdd}
        aria-label="Añadir"
        aria-haspopup="dialog"
      >
        <span className="app-fab-glow" aria-hidden="true" />
        <Plus className="app-fab-icon" size={30} aria-hidden="true" />
      </button>

      {!onAddClick && (
        <>
          <Modal show={showActions} onHide={() => setShowActions(false)} centered contentClassName="custom-modal-bg quick-action-sheet">
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
