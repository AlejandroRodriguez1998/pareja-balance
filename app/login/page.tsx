'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { ArrowLeft, Envelope, Eye, EyeSlash, Lock } from 'react-bootstrap-icons';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import BrandMark from '@/components/BrandMark';

// Traduce los códigos de error de Firebase a mensajes que se entienden.
function loginErrorMessage(error: unknown) {
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') return 'El email o la contraseña no son correctos.';
  if (code === 'auth/invalid-email') return 'Ese email no parece válido.';
  if (code === 'auth/too-many-requests') return 'Demasiados intentos. Espera un momento y vuelve a probar.';
  if (code === 'auth/network-request-failed') return 'No hay conexión. Comprueba tu Internet.';
  return 'No se pudo iniciar sesión. Inténtalo de nuevo.';
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const signIn = async (event: FormEvent) => {
    event.preventDefault();
    if (loading) return;
    try {
      setLoading(true);
      setError('');
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.push('/dashboard');
    } catch (e: unknown) {
      setError(loginErrorMessage(e));
      setLoading(false);
    }
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
    <div className="login-screen">
      <Link href="/" className="login-back" aria-label="Volver a la portada"><ArrowLeft size={18} /></Link>

      <form className="login-card" onSubmit={signIn} noValidate>
        <BrandMark className="login-mark" />
        <h1>Hola de nuevo</h1>
        <p className="login-subtitle">Entra con vuestra cuenta de Pareja Balance.</p>

        <label className="login-field">
          <span>Email</span>
          <span className="login-input">
            <Envelope aria-hidden="true" />
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </span>
        </label>

        <label className="login-field">
          <span>Contraseña</span>
          <span className="login-input">
            <Lock aria-hidden="true" />
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
            <button
              type="button"
              className="login-toggle"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? <EyeSlash /> : <Eye />}
            </button>
          </span>
        </label>

        {error && <p className="login-error" role="alert">{error}</p>}

        <button type="submit" className="login-submit" disabled={loading || !email || !password}>
          {loading ? <><span className="login-spinner" aria-hidden="true" /> Entrando…</> : 'Entrar'}
        </button>

        {/* <button disabled={loading} onClick={signUp} className="btn btn-outline-light w-100 mt-2">
          Crear cuenta
        </button> */}
      </form>
    </div>
  );
}
