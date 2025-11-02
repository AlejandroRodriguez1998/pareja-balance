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

  /*const signUp = async () => {
    try {
      setLoading(true);
      await createUserWithEmailAndPassword(auth, email, password);
      alert('Cuenta creada. Inicia sesión.');
    } catch (e: any) {
      alert(e.message);
    } finally { setLoading(false); }
  };*/

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-dark">
      <div className="card shadow-lg p-4 border-0 bg-dark text-white" style={{ width: '22rem' }}>
        <h1 className="text-center mb-4 fw-semibold">Iniciar sesión</h1>

        <input
          type="email"
          className="form-control mb-3 bg-secondary text-white border-0"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="form-control mb-4 bg-secondary text-white border-0"
          placeholder="Contraseña"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          disabled={loading}
          onClick={signIn}
          className="btn btn-primary w-100 fw-semibold"
        >
          Entrar
        </button>

        {/* <button disabled={loading} onClick={signUp} className="btn btn-outline-light w-100 mt-2">
          Crear cuenta
        </button> */}
      </div>
    </div>
  );
}
