'use client';
import { useEffect, useRef, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { db } from '@/lib/firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';

type Props = {
  show: boolean;
  onHide: () => void;
  expense: {
    id: string;
    description: string;
    total: number;
    pagadoAlec: number;
    pagadoMario: number;
  } | null;
};

export default function EditExpenseModal({ show, onHide, expense }: Props) {
  const [descripcion, setDescripcion] = useState('');
  const [total, setTotal] = useState('');
  const [pagadoAlec, setPagadoAlec] = useState('');
  const [pagadoMario, setPagadoMario] = useState('');
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);

  useEffect(() => {
    if (expense) {
      setDescripcion(expense.description || '');
      setTotal(expense.total?.toString() || '');
      setPagadoAlec(expense.pagadoAlec?.toString() || '');
      setPagadoMario(expense.pagadoMario?.toString() || '');
    }
  }, [expense]);

  const closeIfIdle = () => {
    if (!savingRef.current) onHide();
  };

  const handleGuardar = async () => {
    if (savingRef.current || !expense) return;

    const totalNum = Number(total);
    const alecNum = Number(pagadoAlec);
    const marioNum = Number(pagadoMario);

    if (!descripcion.trim()) return alert('Anade una descripcion.');
    if (isNaN(totalNum) || totalNum <= 0) return alert('Total invalido.');
    if (isNaN(alecNum) || isNaN(marioNum)) return alert('Introduce valores numericos.');

    savingRef.current = true;
    setSaving(true);

    try {
      const ref = doc(db, 'expenses', expense.id);
      await updateDoc(ref, {
        description: descripcion.trim(),
        total: totalNum,
        pagadoAlec: alecNum,
        pagadoMario: marioNum,
        updatedAt: new Date(),
      });
      onHide();
    } catch (err: unknown) {
      console.error(err);
      alert('Error al guardar cambios: ' + (err instanceof Error ? err.message : 'Error desconocido'));
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const handleEliminar = async () => {
    if (savingRef.current || !expense) return;
    const confirmar = confirm('Seguro que deseas eliminar este gasto?');
    if (!confirmar) return;

    savingRef.current = true;
    setSaving(true);

    try {
      await deleteDoc(doc(db, 'expenses', expense.id));
      onHide();
    } catch (err: unknown) {
      console.error(err);
      alert('Error al eliminar: ' + (err instanceof Error ? err.message : 'Error desconocido'));
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={closeIfIdle} dialogClassName="app-modal-dialog" contentClassName="custom-modal-bg">
      <Modal.Header closeButton>
        <Modal.Title>Editar gasto</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Descripcion</Form.Label>
            <Form.Control
              type="text"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              disabled={saving}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Total (EUR)</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              disabled={saving}
            />
          </Form.Group>

          <div className="row">
            <div className="col-6">
              <Form.Group className="mb-3">
                <Form.Label>Alejandro</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  value={pagadoAlec}
                  onChange={(e) => setPagadoAlec(e.target.value)}
                  disabled={saving}
                />
              </Form.Group>
            </div>
            <div className="col-6">
              <Form.Group className="mb-3">
                <Form.Label>Mario</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  value={pagadoMario}
                  onChange={(e) => setPagadoMario(e.target.value)}
                  disabled={saving}
                />
              </Form.Group>
            </div>
          </div>
        </Form>
      </Modal.Body>

      <Modal.Footer className="d-flex justify-content-between">
        <Button variant="danger" onClick={handleEliminar} disabled={saving}>
          Eliminar
        </Button>
        <div>
          <Button variant="secondary" onClick={closeIfIdle} disabled={saving} className="me-2">
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleGuardar} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}
