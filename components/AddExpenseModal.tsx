'use client';
import { useRef, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { db, auth } from '@/lib/firebase';
import { getUserPairId } from '@/lib/pairs';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

export default function AddExpenseModal({ show, onHide }: { show: boolean; onHide: () => void }) {
  const [descripcion, setDescripcion] = useState('');
  const [total, setTotal] = useState('');
  const [dividir, setDividir] = useState(false);
  const [registrarComoPareja, setRegistrarComoPareja] = useState(false);
  const [pagadoPorAmbos, setPagadoPorAmbos] = useState(false);
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

    if (isNaN(totalNum) || totalNum <= 0) return alert('Cantidad total invalida.');

    const usuarioEsAlec = user.email?.toLowerCase().includes('alex') ?? false;
    const pagadorEsAlec = registrarComoPareja ? !usuarioEsAlec : usuarioEsAlec;
    const importeParaSaldo = dividir ? Number((totalNum / 2).toFixed(2)) : totalNum;
    const mitadPagada = Number((totalNum / 2).toFixed(2));
    const alecNum = pagadoPorAmbos ? mitadPagada : pagadorEsAlec ? importeParaSaldo : 0;
    const parejaNum = pagadoPorAmbos ? mitadPagada : pagadorEsAlec ? 0 : importeParaSaldo;

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
      setDividir(false);
      setRegistrarComoPareja(false);
      setPagadoPorAmbos(false);
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

          <details className="modal-options-details mb-3">
            <summary>Otras opciones</summary>
            <Form.Check
              type="switch"
              id="registrar-como-pareja"
              label="Este gasto lo ha pagado la otra persona"
              checked={registrarComoPareja}
              onChange={(e) => {
                setRegistrarComoPareja(e.target.checked);
                if (e.target.checked) setPagadoPorAmbos(false);
              }}
              className="modal-switch-row mt-3"
              disabled={saving}
            />
            <Form.Check
              type="switch"
              id="pagado-por-ambos"
              label="Ambos han pagado lo mismo (saldo 0 EUR)"
              checked={pagadoPorAmbos}
              onChange={(e) => {
                setPagadoPorAmbos(e.target.checked);
                if (e.target.checked) setRegistrarComoPareja(false);
              }}
              className="modal-switch-row mt-2"
              disabled={saving}
            />
          </details>
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
