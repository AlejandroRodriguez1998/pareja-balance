'use client';

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { addDoc, collection, deleteDoc, doc, onSnapshot, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { Basket2, CheckCircleFill, Circle, PlusLg, ThreeDotsVertical } from 'react-bootstrap-icons';
import { auth, db } from '@/lib/firebase';
import { SHOPPING_CATEGORIES, type ShoppingCategory, type ShoppingItem } from '@/lib/types';
import ShoppingItemModal from './ShoppingItemModal';

export type ShoppingListHandle = { focusInput: () => void };
type Props = { pairId: string };

const timestampValue = (value: ShoppingItem['createdAt']) => {
  if (!value) return 0;
  if (value instanceof Date) return value.getTime();
  return value.seconds * 1000;
};

const ShoppingList = forwardRef<ShoppingListHandle, Props>(function ShoppingList({ pairId }, ref) {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [name, setName] = useState('');
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ShoppingItem | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const addingRef = useRef(false);

  useImperativeHandle(ref, () => ({ focusInput: () => inputRef.current?.focus() }), []);

  useEffect(() => {
    setLoading(true);
    const itemsQuery = query(collection(db, 'shoppingItems'), where('pairId', '==', pairId));
    return onSnapshot(itemsQuery, (snapshot) => {
      setItems(snapshot.docs.map((itemDoc) => ({ id: itemDoc.id, ...itemDoc.data() } as ShoppingItem)));
      setLoading(false);
    }, (error) => {
      console.error('Error loading shopping list:', error);
      setLoading(false);
    });
  }, [pairId]);

  const pendingByCategory = useMemo(() => SHOPPING_CATEGORIES.map((category) => ({
    category,
    items: items.filter((item) => !item.completed && item.category === category).sort((a, b) => timestampValue(a.createdAt) - timestampValue(b.createdAt)),
  })).filter((group) => group.items.length), [items]);

  const completed = useMemo(() => items.filter((item) => item.completed).sort((a, b) => timestampValue(b.completedAt) - timestampValue(a.completedAt)), [items]);

  const addItem = async () => {
    const trimmedName = name.trim();
    const user = auth.currentUser;
    if (!trimmedName || !user || addingRef.current) return;
    addingRef.current = true;
    setAdding(true);
    try {
      await addDoc(collection(db, 'shoppingItems'), {
        pairId,
        name: trimmedName,
        category: 'Otros' satisfies ShoppingCategory,
        completed: false,
        createdAt: serverTimestamp(),
        completedAt: null,
        createdBy: user.uid,
      });
      setName('');
      requestAnimationFrame(() => inputRef.current?.focus());
    } catch (error) {
      console.error('Error adding shopping item:', error);
      alert('No se pudo añadir el producto.');
    } finally {
      addingRef.current = false;
      setAdding(false);
    }
  };

  const toggleItem = async (item: ShoppingItem) => {
    if (item.pairId !== pairId) return;
    try {
      await updateDoc(doc(db, 'shoppingItems', item.id), {
        completed: !item.completed,
        completedAt: item.completed ? null : serverTimestamp(),
      });
    } catch (error) {
      console.error('Error toggling shopping item:', error);
      alert('No se pudo actualizar el producto.');
    }
  };

  const clearCompleted = async () => {
    const deletable = completed.filter((item) => item.pairId === pairId);
    if (!deletable.length || !confirm('¿Eliminar los productos ya comprados?')) return;
    try {
      await Promise.all(deletable.map((item) => deleteDoc(doc(db, 'shoppingItems', item.id))));
    } catch (error) {
      console.error('Error clearing completed shopping items:', error);
      alert('No se pudieron limpiar los productos comprados.');
    }
  };

  const renderItem = (item: ShoppingItem) => (
    <li className={`shopping-item-row ${item.completed ? 'is-completed' : ''}`} key={item.id}>
      <button type="button" className="shopping-item-toggle" onClick={() => void toggleItem(item)} aria-label={item.completed ? `Marcar ${item.name} como pendiente` : `Marcar ${item.name} como comprado`} aria-pressed={item.completed}>
        {item.completed ? <CheckCircleFill aria-hidden="true" /> : <Circle aria-hidden="true" />}
      </button>
      <span className="shopping-item-name">{item.name}</span>
      <button type="button" className="shopping-item-menu" onClick={() => setSelectedItem(item)} aria-label={`Editar o eliminar ${item.name}`}><ThreeDotsVertical aria-hidden="true" /></button>
    </li>
  );

  return (
    <section className="shopping-list-view" aria-labelledby="shopping-list-title">
      <div className="shopping-list-heading">
        <div><span className="section-kicker">Compartida</span><h1 id="shopping-list-title">Lista de la compra</h1></div>
        <Basket2 size={22} aria-hidden="true" />
      </div>

      <form className="shopping-quick-add" onSubmit={(event) => { event.preventDefault(); void addItem(); }}>
        <label className="visually-hidden" htmlFor="shopping-quick-input">Añadir producto</label>
        <input ref={inputRef} id="shopping-quick-input" type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="Añadir producto..." autoComplete="off" enterKeyHint="done" disabled={adding} />
        <button type="submit" disabled={adding || !name.trim()} aria-label="Añadir producto"><PlusLg aria-hidden="true" /></button>
      </form>

      {loading ? <div className="shopping-list-loading" role="status">Cargando lista...</div> : items.length === 0 ? (
        <div className="shopping-empty-state"><Basket2 size={34} aria-hidden="true" /><strong>Lista vacía por ahora</strong><p>Añadid lo que necesitéis y aparecerá aquí para los dos.</p></div>
      ) : (
        <div className="shopping-list-content">
          {pendingByCategory.map(({ category, items: categoryItems }) => (
            <section className="shopping-category" key={category} aria-labelledby={`shopping-${category.replaceAll(' ', '-').toLowerCase()}`}>
              <h2 id={`shopping-${category.replaceAll(' ', '-').toLowerCase()}`}>{category}<span>{categoryItems.length}</span></h2>
              <ul>{categoryItems.map(renderItem)}</ul>
            </section>
          ))}
          {completed.length > 0 && (
            <section className="shopping-category shopping-completed" aria-labelledby="shopping-completed-title">
              <div className="shopping-completed-heading"><h2 id="shopping-completed-title">Comprados<span>{completed.length}</span></h2><button type="button" onClick={() => void clearCompleted()}>Limpiar comprados</button></div>
              <ul>{completed.map(renderItem)}</ul>
            </section>
          )}
        </div>
      )}
      <ShoppingItemModal item={selectedItem} pairId={pairId} onHide={() => setSelectedItem(null)} />
    </section>
  );
});

export default ShoppingList;
