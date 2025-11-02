'use client';
import { Modal, Button, Form } from 'react-bootstrap';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SettingsModal({ show, onHide }: { show: boolean; onHide: () => void }) {
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [nombre, setNombre] = useState<string>('');

  // 🔹 Cargar los datos del usuario autenticado
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setEmail(user.email || '');
      setNombre(user.displayName || 'Alec');
    }
  }, [show]);

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
    <Modal show={show} onHide={onHide} centered contentClassName="custom-modal-bg">
      <Modal.Header closeButton>
        <Modal.Title>Configuración</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Group className="mb-4">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" value={email} disabled />
          </Form.Group>
        </Form>

        <Button variant="outline-danger" className="w-100 py-2 fw-bold" onClick={handleCerrarSesion}>
          Cerrar sesión
        </Button>
      </Modal.Body>
    </Modal>
  );
}
