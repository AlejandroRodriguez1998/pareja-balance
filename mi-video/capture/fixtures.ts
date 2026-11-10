// Isolated, deterministic demonstration data. This module never imports Firebase.
export const auth = {currentUser: {uid: 'demo-alex', email: 'alex@example.invalid'}};
export const db = {};
export const onAuthStateChanged = (_auth: unknown, callback: (user: typeof auth.currentUser | null) => void) => {
  let active = true;
  queueMicrotask(() => {if (active) callback(new URLSearchParams(location.search).get('page') === 'landing' ? null : auth.currentUser);});
  return () => {active = false;};
};
export const signOut = async () => {};
export const getUserPairId = async () => 'demo-pair';
export const createPair = async () => 'demo-pair';

type Data = Record<string, any>;
type Ref = {path: string; id?: string};
const common = {pairId: 'demo-pair', createdAt: {seconds: 1794304800}};
const data: Record<string, Record<string, Data>> = {
  expenses: {
    e1: {...common, description: 'Compra de la semana', total: 62.5, pagadoAlec: 31.25, pagadoMario: 0, date: {seconds: 1794304800}},
    e2: {...common, description: 'Cena del viernes', total: 38, pagadoAlec: 0, pagadoMario: 19, date: {seconds: 1794218400}},
    e3: {...common, description: 'Cosas para casa', total: 60.5, pagadoAlec: 30.25, pagadoMario: 0, date: {seconds: 1794132000}},
  },
  meals: {
    m1: {...common, day: 0, name: 'Lentejas con verduras'},
    m2: {...common, day: 1, name: 'Pasta al pesto'},
    m3: {...common, day: 2, name: 'Salmón al horno'},
    m4: {...common, day: 3, name: 'Crema de calabaza'},
    m5: {...common, day: 4, name: 'Pizza casera'},
    m6: {...common, day: 5, name: 'Arroz con verduras'},
    m7: {...common, day: 6, name: 'Tortilla de patatas'},
  },
  tasks: {
    t1: {...common, title: 'Poner la lavadora', assignedTo: 'Alejandro', completed: false, dueDate: '2026-11-10', repeat: 'none'},
    t2: {...common, title: 'Hacer la compra', assignedTo: 'Mario', completed: false, dueDate: '2026-11-10', repeat: 'none'},
    t3: {...common, title: 'Regar las plantas', assignedTo: 'Ambos', completed: false, dueDate: '2026-11-11', repeat: 'none'},
    t4: {...common, title: 'Bajar la basura', assignedTo: 'Mario', completed: true, dueDate: '2026-11-10', repeat: 'none'},
  },
  shoppingItems: {
    s1: {...common, name: 'Tomates', category: 'Fruta y verdura', completed: false},
    s2: {...common, name: 'Aguacates', category: 'Fruta y verdura', completed: false},
    s3: {...common, name: 'Yogur natural', category: 'Lácteos', completed: false},
    s4: {...common, name: 'Pasta', category: 'Despensa', completed: false},
    s5: {...common, name: 'Aceite de oliva', category: 'Despensa', completed: true},
  },
  coupleData: {
    'demo-pair': {
      ...common, partnerOneName: 'Alejandro', partnerTwoName: 'Mario', relationshipStart: '2023-05-20',
      nextPlan: {title: 'Una escapada a la sierra', dateTime: '2026-11-14T10:00'},
      goals: [
        {id: 'g1', title: 'Escapada de fin de semana', completed: false, targetCents: 50000, contributions: [{id: 'c1', author: 'demo-alex', amountCents: 15000, date: '2026-11-08'}, {id: 'c2', author: 'demo-mario', amountCents: 15000, date: '2026-11-09'}]},
        {id: 'g2', title: 'Hacer más planes al aire libre', completed: false},
      ],
      planHistory: [{id: 'p1', title: 'Tarde de cine y paseo', dateTime: '2026-11-07T18:00', completedAt: '2026-11-07T22:00'}],
      dates: [], wishes: [],
    },
  },
};
const subscriptions = new Set<() => void>();
const notify = () => subscriptions.forEach((listener) => listener());
export const collection = (_db: unknown, path: string): Ref => ({path});
export const doc = (_db: unknown, path: string, id: string): Ref => ({path, id});
export const where = (..._args: unknown[]) => null;
export const orderBy = (..._args: unknown[]) => null;
export const query = (ref: Ref, ..._args: unknown[]) => ref;
export const serverTimestamp = () => ({seconds: 1794304800});
export const arrayUnion = (...items: unknown[]) => ({__arrayUnion: items});
const document = (ref: Ref) => ({id: ref.id!, exists: () => Boolean(data[ref.path]?.[ref.id!]), data: () => structuredClone(data[ref.path]?.[ref.id!] || {})});
const snapshot = (ref: Ref) => {
  if (ref.id) return document(ref);
  const docs = Object.keys(data[ref.path] || {}).map((id) => document({...ref, id}));
  return {docs, empty: docs.length === 0, forEach: (callback: (doc: ReturnType<typeof document>) => void) => docs.forEach(callback)};
};
export const onSnapshot = (ref: Ref, callback: (snap: any) => void) => {
  const listener = () => callback(snapshot(ref));
  subscriptions.add(listener);
  queueMicrotask(() => {if (subscriptions.has(listener)) listener();});
  return () => {subscriptions.delete(listener);};
};
export const getDocs = async (ref: Ref) => snapshot(ref);
export const updateDoc = async (ref: Ref, patch: Data) => {
  const current = data[ref.path][ref.id!];
  for (const [key, value] of Object.entries(patch)) {
    current[key] = value?.__arrayUnion ? [...(current[key] || []), ...value.__arrayUnion] : value;
  }
  notify();
};
export const setDoc = async (ref: Ref, value: Data) => {
  data[ref.path] ||= {};
  data[ref.path][ref.id!] = value;
  notify();
};
export const addDoc = async (ref: Ref, value: Data) => {
  const id = 'demo-' + Object.keys(data[ref.path] || {}).length;
  await setDoc({...ref, id}, value);
  return {id};
};
export const deleteDoc = async (ref: Ref) => {delete data[ref.path][ref.id!]; notify();};
export const runTransaction = async (_db: unknown, callback: (transaction: unknown) => Promise<void>) => callback({
  get: async (ref: Ref) => document(ref),
  update: (ref: Ref, patch: Data) => updateDoc(ref, patch),
  set: (ref: Ref, value: Data) => setDoc(ref, value),
});
