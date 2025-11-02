'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

export default function LoginPage() {
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const signIn = async () => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (e: any) {
      alert(e.message);
    } finally { setLoading(false); }
  };

  const signUp = async () => {
    try {
      setLoading(true);
      await createUserWithEmailAndPassword(auth, email, password);
      alert('Cuenta creada. Inicia sesión.');
    } catch (e: any) {
      alert(e.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-sm mx-auto mt-16 bg-white p-6 rounded shadow">
      <h1 className="text-xl font-semibold mb-4">Iniciar sesión</h1>
      <input className="input mb-2" placeholder="Email" onChange={e=>setEmail(e.target.value)} />
      <input className="input mb-4" placeholder="Contraseña" type="password" onChange={e=>setPassword(e.target.value)} />
      <button disabled={loading} onClick={signIn} className="btn-primary w-full mb-2">Entrar</button>
      <button disabled={loading} onClick={signUp} className="btn-ghost w-full">Crear cuenta</button>
    </div>
  );
}
