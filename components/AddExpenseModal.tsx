'use client';
import { useRef, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { db, auth } from '@/lib/firebase';
import { getUserPairId } from '@/lib/pairs';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

export default function AddExpenseModal({ show, onHide }: { show: boolean; onHide: () => void }) {
  const [descripcion, setDescripcion] = useState('');
  const [total, setTotal] = useState('');
  const [pagadoAlec, setPagadoAlec] = useState('');
  const [pagadoPareja, setPagadoPareja] = useState('');
  const [dividir, setDividir] = useState(false);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);

  const closeIfIdle = () => {
    if (!savingRef.current) onHide();
  };

  const handleGuardar = async () => {
    if (savingRef.current) return;

    const user = auth.currentUser;
    if (!user) return alert('Debes iniciar sesion.');
    if (!descripcion.trim()) return alert('Anade una descripcion.');

    const totalNum = Number(total);
    let alecNum = Number(pagadoAlec);
    let parejaNum = Number(pagadoPareja);

    if (isNaN(totalNum) || totalNum <= 0) return alert('Cantidad total invalida.');
    if (isNaN(alecNum) || isNaN(parejaNum)) return alert('Introduce valores numericos.');

    if (dividir) {
      alecNum = Number((alecNum / 2).toFixed(2));
      parejaNum = Number((parejaNum / 2).toFixed(2));
    }

    savingRef.current = true;
    setSaving(true);

    try {
      const pairId = await getUserPairId(user.uid);
      if (!pairId) return alert('No se encontro una pareja asociada.');

      await addDoc(collection(db, 'expenses'), {
        pairId,
        user_id: user.uid,
        description: descripcion.trim(),
        total: totalNum,
        pagadoAlec: alecNum,
        pagadoMario: parejaNum,
        date: serverTimestamp(),
      });

      setDescripcion('');
      setTotal('');
      setPagadoAlec('');
      setPagadoPareja('');
      setDividir(false);
      onHide();
    } catch (err: any) {
      console.error(err);
      alert(`Error al guardar: ${err.message}`);
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={closeIfIdle} centered contentClassName="custom-modal-bg">
      <Modal.Header closeButton>
        <Modal.Title className="text-white">Anadir gasto</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label className="text-white">Descripcion:</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ejemplo: Supermercado"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              disabled={saving}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="text-white">Total:</Form.Label>
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
                <Form.Label className="text-white">Alejandro:</Form.Label>
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
                <Form.Label className="text-white">Mario:</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  value={pagadoPareja}
                  onChange={(e) => setPagadoPareja(e.target.value)}
                  disabled={saving}
                />
              </Form.Group>
            </div>
          </div>

          <Form.Group className="mb-3">
            <Form.Check
              type="switch"
              id="switch-dividir"
              label="Dividir entre dos"
              checked={dividir}
              onChange={(e) => setDividir(e.target.checked)}
              className="modal-switch-row"
              disabled={saving}
            />
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={closeIfIdle} disabled={saving}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleGuardar} disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
