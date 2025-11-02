'use client';
import { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { GearFill, Plus } from 'react-bootstrap-icons';
import AddExpenseModal from './AddExpenseModal';
import SettingsModal from './SettingsModal';

export default function TopNav({ title }: { title: string }) {
  const [showAdd, setShowAdd] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <nav className="navbar border-bottom px-3" style={{ backgroundColor: 'rgb(30, 30, 30)', color: 'white' }}>
        <button className="btn btn-link text-white p-0" onClick={() => setShowSettings(true)}>
          <GearFill size={20} />
        </button>
        <h5 className="m-0">{title}</h5>
        <button className="btn btn-link text-success text-white p-0" onClick={() => setShowAdd(true)}>
          <Plus size={30} />
        </button>
      </nav>

      <AddExpenseModal show={showAdd} onHide={() => setShowAdd(false)} />
      <SettingsModal show={showSettings} onHide={() => setShowSettings(false)} />
    </>
  );
}
