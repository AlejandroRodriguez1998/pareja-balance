import { db } from './firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';

export async function getUserPairId(uid: string) {
  const q = query(collection(db, 'pairs'), where('members', 'array-contains', uid));
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    return snapshot.docs[0].id;
  }
  return null;
}

export async function createPair(uidA: string, uidB: string) {
  const pairId = `${uidA}_${uidB}`;
  await addDoc(collection(db, 'pairs'), {
    members: [uidA, uidB],
    createdAt: new Date(),
  });
  return pairId;
}
