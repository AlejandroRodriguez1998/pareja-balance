'use client';
import { useState } from 'react';
import { GearFill, Plus } from 'react-bootstrap-icons';
import AddExpenseModal from './AddExpenseModal';
import SettingsModal from './SettingsModal';

type Props = {
  title: string;
  onAddClick?: () => void;
};

export default function TopNav({ title, onAddClick }: Props) {
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const usesExpenseModal = !onAddClick;

  return (
    <>
      <nav className="app-top-nav">
        <button className="nav-icon-button" onClick={() => setShowSettings(true)} aria-label="Ajustes">
          <GearFill size={20} />
        </button>
        <h5>{title}</h5>
        <button
          className="nav-icon-button nav-icon-button-primary"
          onClick={onAddClick || (() => setShowAddExpense(true))}
          aria-label="Anadir"
        >
          <Plus size={24} />
        </button>
      </nav>

      {usesExpenseModal && (
        <AddExpenseModal show={showAddExpense} onHide={() => setShowAddExpense(false)} />
      )}
      <SettingsModal show={showSettings} onHide={() => setShowSettings(false)} />
    </>
  );
}
