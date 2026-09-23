'use client';

import { useEffect, useRef, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { SHOPPING_CATEGORIES, type ShoppingCategory, type ShoppingItem } from '@/lib/types';

type Props = {
  item: ShoppingItem | null;
  pairId: string;
  onHide: () => void;
};

export default function ShoppingItemModal({ item, pairId, onHide }: Props) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ShoppingCategory>('Otros');
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);

  useEffect(() => {
    if (!item) return;
    setName(item.name);
    setCategory(item.category);
  }, [item]);

  const belongsToPair = item?.pairId === pairId;

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!item || !belongsToPair || !trimmedName || savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'shoppingItems', item.id), { name: trimmedName, category });
      onHide();
    } catch (error) {
      console.error('Error updating shopping item:', error);
      alert('No se pudo actualizar el producto.');
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!item || !belongsToPair || savingRef.current || !confirm(`¿Eliminar “${item.name}”?`)) return;
    savingRef.current = true;
    setSaving(true);
    try {
      await deleteDoc(doc(db, 'shoppingItems', item.id));
      onHide();
    } catch (error) {
      console.error('Error deleting shopping item:', error);
      alert('No se pudo eliminar el producto.');
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  return (
    <Modal show={!!item} onHide={() => !savingRef.current && onHide()} centered contentClassName="custom-modal-bg">
      <Modal.Header closeButton><Modal.Title>Editar producto</Modal.Title></Modal.Header>
      <Modal.Body>
        <Form onSubmit={(event) => { event.preventDefault(); void handleSave(); }}>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="shopping-item-name">Producto</Form.Label>
            <Form.Control id="shopping-item-name" autoFocus value={name} onChange={(event) => setName(event.target.value)} disabled={saving} />
          </Form.Group>
          <Form.Group>
            <Form.Label htmlFor="shopping-item-category">Categoría</Form.Label>
            <Form.Select id="shopping-item-category" value={category} onChange={(event) => setCategory(event.target.value as ShoppingCategory)} disabled={saving}>
              {SHOPPING_CATEGORIES.map((option) => <option key={option}>{option}</option>)}
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-between">
        <Button variant="danger" onClick={() => void handleDelete()} disabled={saving || !belongsToPair}>Eliminar</Button>
        <div>
          <Button variant="secondary" className="me-2" onClick={onHide} disabled={saving}>Cancelar</Button>
          <Button variant="primary" onClick={() => void handleSave()} disabled={saving || !name.trim() || !belongsToPair}>{saving ? 'Guardando...' : 'Guardar'}</Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}
