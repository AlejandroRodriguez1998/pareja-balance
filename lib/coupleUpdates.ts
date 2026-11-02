import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import type { CoupleData } from './types';

export async function updateCouple(pairId: string, change: (current: CoupleData, uid: string) => Partial<CoupleData>) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Inicia sesión para guardar.');
  await runTransaction(db, async (transaction) => {
    const reference = doc(db, 'coupleData', pairId);
    const snapshot = await transaction.get(reference);
    const current = snapshot.exists() ? snapshot.data() as CoupleData : { pairId };
    const patch = { ...change(current, uid), pairId, updatedAt: serverTimestamp() };
    if (snapshot.exists()) transaction.update(reference, patch);
    else transaction.set(reference, patch);
  });
}
