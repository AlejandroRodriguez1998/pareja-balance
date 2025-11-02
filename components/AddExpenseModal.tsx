'use client';
import { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { db, auth } from '@/lib/firebase';
import { getUserPairId } from '@/lib/pairs';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

export default function AddExpenseModal({ show, onHide }: { show: boolean; onHide: () => void }) {
  const [descripcion, setDescripcion] = useState('');
  const [total, setTotal] = useState('');
  const [pagadoAlec, setPagadoAlec] = useState('');
  const [pagadoPareja, setPagadoPareja] = useState('');
  const [saving, setSaving] = useState(false);

  const handleGuardar = async () => {
    const user = auth.currentUser;
    if (!user) return alert('Debes iniciar sesión.');
    if (!descripcion.trim()) return alert('Añade una descripción.');

    const totalNum = Number(total);
    const alecNum = Number(pagadoAlec);
    const parejaNum = Number(pagadoPareja);

    if (isNaN(totalNum) || totalNum <= 0) return alert('Cantidad total inválida.');
    if (isNaN(alecNum) || isNaN(parejaNum)) return alert('Introduce valores numéricos.');
    if (Math.abs(alecNum + parejaNum - totalNum) > 0.01)
      return alert('La suma de los pagos no coincide con el total.');

    try {
      const pairId = await getUserPairId(user.uid);
      if (!pairId) return alert('No se encontró una pareja asociada.');

      setSaving(true);
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
      onHide();
    } catch (err: any) {
      console.error(err);
      alert(`Error al guardar: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      contentClassName="custom-modal-bg" // fondo personalizado
    >
      <Modal.Header closeButton>
        <Modal.Title className="text-white">Añadir gasto</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          {/* Descripción */}
          <Form.Group className="mb-3">
            <Form.Label className="text-white">Descripción:</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ej. Compra supermercado"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              disabled={saving}
            />
          </Form.Group>

          {/* Total */}
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

          {/* Pagado por ambos (dos columnas) */}
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

          <Form.Text className="text-light-50">
            La suma de ambos pagos debe coincidir con el total del gasto.
          </Form.Text>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={saving}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleGuardar} disabled={saving}>
          {saving ? 'Guardando…' : 'Guardar'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
