'use client';
import { useState } from 'react';
import { Modal } from 'react-bootstrap';
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
      <nav className="navbar border-bottom px-3" style={{ backgroundColor: 'rgb(30, 30, 30)', color: 'white' }}>
        <button className="btn btn-link text-white p-0" onClick={() => setShowSettings(true)}>
          <GearFill size={20} />
        </button>
        <h5 className="m-0">{title}</h5>
        <button
          className="btn btn-link text-success text-white p-0"
          onClick={onAddClick || (() => setShowAddExpense(true))}
        >
          <Plus size={30} />
        </button>
      </nav>

      {usesExpenseModal && (
        <AddExpenseModal show={showAddExpense} onHide={() => setShowAddExpense(false)} />
      )}
      <SettingsModal show={showSettings} onHide={() => setShowSettings(false)} />
    </>
  );
}
