'use client';
import { Modal, Button, Form } from 'react-bootstrap';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type Theme = 'light' | 'dark';
type FavoriteAction = 'menu' | 'expense' | 'meal' | 'task' | 'plan';

const applyTheme = (theme: Theme) => {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  localStorage.setItem('pareja-balance-theme', theme);

  const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  themeColor?.setAttribute('content', theme === 'dark' ? '#101318' : '#f4f6f8');
};

export default function SettingsModal({ show, onHide }: { show: boolean; onHide: () => void }) {
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [theme, setTheme] = useState<Theme>('dark');
  const [favoriteAction, setFavoriteAction] = useState<FavoriteAction>('menu');

  // 🔹 Cargar los datos del usuario autenticado
  const syncSettings = () => {
    const user = auth.currentUser;
    if (user) {
      setEmail(user.email || '');
    }

    const activeTheme = document.documentElement.dataset.theme;
    setTheme(activeTheme === 'light' ? 'light' : 'dark');
    const savedAction = localStorage.getItem('pareja-balance-favorite-action');
    setFavoriteAction(['expense', 'meal', 'task', 'plan'].includes(savedAction || '') ? savedAction as FavoriteAction : 'menu');
  };

  const handleThemeChange = (nextTheme: Theme) => {
    setTheme(nextTheme);
    applyTheme(nextTheme);
  };

  const handleFavoriteActionChange = (action: FavoriteAction) => {
    setFavoriteAction(action);
    if (action === 'menu') localStorage.removeItem('pareja-balance-favorite-action');
    else localStorage.setItem('pareja-balance-favorite-action', action);
  };

  const handleCerrarSesion = async () => {
    try {
      await signOut(auth);
      onHide();
      router.push('/login');
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  };

  return (
    <Modal show={show} onHide={onHide} onEnter={syncSettings} scrollable dialogClassName="app-modal-dialog" contentClassName="custom-modal-bg">
      <Modal.Header closeButton>
        <Modal.Title>Configuración</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Group className="mb-4">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" value={email} disabled />
          </Form.Group>

          <fieldset className="theme-setting mb-4">
            <legend>Tema</legend>
            <div className="theme-setting-control" role="group" aria-label="Tema de la aplicación">
              <button
                type="button"
                className={`theme-option ${theme === 'light' ? 'is-selected' : ''}`}
                aria-pressed={theme === 'light'}
                onClick={() => handleThemeChange('light')}
              >
                Claro
              </button>
              <button
                type="button"
                className={`theme-option ${theme === 'dark' ? 'is-selected' : ''}`}
                aria-pressed={theme === 'dark'}
                onClick={() => handleThemeChange('dark')}
              >
                Oscuro
              </button>
            </div>
            <small>La preferencia se guarda en este dispositivo.</small>
          </fieldset>

          <fieldset className="favorite-action-setting mb-4">
            <legend>Acción favorita del botón +</legend>
            <div className="favorite-action-grid" role="group" aria-label="Acción favorita de Inicio">
              {([
                ['menu', 'Mostrar menú'],
                ['expense', 'Gasto'],
                ['meal', 'Comida'],
                ['task', 'Tarea'],
                ['plan', 'Plan'],
              ] as const).map(([value, label]) => (
                <button
                  type="button"
                  key={value}
                  className={`favorite-action-option ${favoriteAction === value ? 'is-selected' : ''}`}
                  aria-pressed={favoriteAction === value}
                  onClick={() => handleFavoriteActionChange(value)}
                >
                  {label}
                </button>
              ))}
            </div>
            <small>En Inicio, el botón + abrirá directamente esta opción.</small>
          </fieldset>
        </Form>

        <Button variant="outline-danger" className="w-100 py-2 fw-bold" onClick={handleCerrarSesion}>
          Cerrar sesión
        </Button>
      </Modal.Body>
    </Modal>
  );
}
