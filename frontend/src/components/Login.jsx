import { useEffect, useRef, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { toast } from 'react-hot-toast';
import { getGoogleConfig, googleSignIn, loginUser, registerUser } from '../services/userService';

const fieldStyle = 'mt-1 min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-base outline-green-700';

let gisScriptPromise = null;
const loadGoogleScript = () => {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (gisScriptPromise) return gisScriptPromise;
  gisScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => { gisScriptPromise = null; reject(new Error('Unable to load Google sign-in.')); };
    document.head.appendChild(script);
  });
  return gisScriptPromise;
};

export default function Login() {
  const { setShowUserLogin, setUser } = useAppContext();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const dialog = useRef(null);
  const googleButton = useRef(null);
  const register = mode === 'register';
  useEffect(() => {
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.current?.focus();
    return () => { document.body.style.overflow = overflow; previous?.focus(); };
  }, []);
  useEffect(() => {
    let cancelled = false;
    const handleCredential = async response => {
      if (cancelled || !response?.credential) return;
      setSubmitting(true);
      setError('');
      try {
        const data = await googleSignIn(response.credential);
        if (cancelled) return;
        if (!data.success || !data.user) { setError(data.message || 'Unable to sign in with Google. Please try again.'); return; }
        setUser(data.user);
        setShowUserLogin(false);
        toast.success(`Welcome, ${data.user.name}!`);
      } catch (err) { setError(err.response?.data?.message || 'Unable to sign in with Google. Please try again.'); }
      finally { setSubmitting(false); }
    };
    (async () => {
      try {
        const config = await getGoogleConfig();
        if (cancelled || !config?.clientId) return;
        await loadGoogleScript();
        if (cancelled || !googleButton.current) return;
        window.google.accounts.id.initialize({ client_id: config.clientId, callback: handleCredential });
        const width = Math.min(320, dialog.current.clientWidth - (window.innerWidth < 640 ? 40 : 64));
        window.google.accounts.id.renderButton(googleButton.current, { theme: 'outline', size: 'large', width, text: 'continue_with' });
        setGoogleEnabled(true);
      } catch { /* Google sign-in stays hidden; email sign-in remains available. */ }
    })();
    return () => { cancelled = true; };
  }, [setShowUserLogin, setUser]);
  const close = () => { if (!submitting) setShowUserLogin(false); };
  const switchMode = next => { setMode(next); setError(''); setPassword(''); setConfirmPassword(''); setShowPassword(false); };
  const onKeyDown = event => {
    if (event.key === 'Escape') { event.preventDefault(); close(); }
    if (event.key === 'Tab') {
      const elements = [...dialog.current.querySelectorAll('button:not(:disabled), input:not(:disabled), iframe, [role="button"][tabindex="0"]')];
      const first = elements[0];
      const last = elements.at(-1);
      if (event.shiftKey && [first, dialog.current].includes(document.activeElement)) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
  };
  const submit = async event => {
    event.preventDefault();
    if (submitting) return;
    setError('');
    if (register && (name.trim().length < 2 || name.trim().length > 100)) return setError('Enter your name (2–100 characters).');
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(normalizedEmail)) return setError('Enter a valid email address.');
    if (register && (password.length < 8 || new TextEncoder().encode(password).length > 72)) return setError('Use at least 8 characters and no more than 72 bytes for your password.');
    if (register && password !== confirmPassword) return setError('Passwords do not match.');
    setSubmitting(true);
    try {
      const data = register ? await registerUser({ name: name.trim(), email: normalizedEmail, password }) : await loginUser({ email: normalizedEmail, password });
      if (!data.success || !data.user) { setError(data.message || 'Unable to sign in. Please try again.'); return; }
      setUser(data.user);
      setShowUserLogin(false);
      toast.success(register ? 'Account created. You are now signed in.' : `Welcome back, ${data.user.name}!`);
    } catch (err) { setError(err.response?.data?.message || 'Unable to connect. Please try again.'); }
    finally { setSubmitting(false); }
  };
  return <div onClick={close} className="fixed inset-0 z-[80] flex items-center overflow-y-auto bg-black/50 p-4">
    <div ref={dialog} role="dialog" aria-modal="true" aria-labelledby="auth-title" tabIndex={-1} onKeyDown={onKeyDown} onClick={event => event.stopPropagation()} className="relative m-auto max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-stone-200 bg-[var(--paper)] p-5 shadow-xl outline-none sm:p-8">
      <button type="button" disabled={submitting} aria-label="Close sign in" onClick={close} className="absolute right-1 top-1 flex h-11 w-11 items-center justify-center rounded text-2xl">×</button>
      <p className="text-sm font-medium text-green-800">Ayurvedic</p>
      <h1 id="auth-title" className="mt-2 pr-4 text-2xl font-semibold">{register ? 'Create your account' : 'Welcome back'}</h1>
      <p className="mt-2 text-sm text-stone-600">{register ? 'Sign up to shop with your own account.' : 'Sign in to continue shopping.'}</p>
      <div className={googleEnabled ? 'mt-6 space-y-4' : 'hidden'}>
        <div ref={googleButton} inert={submitting || undefined} className={`flex justify-center [color-scheme:light] ${submitting ? 'opacity-50' : ''}`} />
        <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-stone-400"><span className="h-px flex-1 bg-stone-200" />or<span className="h-px flex-1 bg-stone-200" /></div>
      </div>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <fieldset disabled={submitting} className="min-w-0 space-y-4 disabled:opacity-60">
          {register && <label className="block text-sm" htmlFor="auth-name">Full name<input id="auth-name" name="name" required minLength={2} maxLength={100} autoComplete="name" value={name} onChange={e => setName(e.target.value)} className={fieldStyle} /></label>}
          <label className="block text-sm" htmlFor="auth-email">Email address<input id="auth-email" name="email" required type="email" maxLength={254} autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className={fieldStyle} /></label>
          <div><label className="block text-sm" htmlFor="auth-password">Password</label>
            <div className="relative"><input id="auth-password" name="password" required minLength={register ? 8 : undefined} type={showPassword ? 'text' : 'password'} autoComplete={register ? 'new-password' : 'current-password'} value={password} onChange={e => setPassword(e.target.value)} className={`${fieldStyle} pr-20`} /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(current => !current)} className="absolute inset-y-0 right-0 min-h-11 px-3 text-sm font-medium text-green-800">{showPassword ? 'Hide' : 'Show'}</button></div>
            {register && <p className="mt-1 text-xs text-stone-500">Use at least 8 characters.</p>}
          </div>
          {register && <label className="block text-sm" htmlFor="auth-confirm-password">Confirm password<input id="auth-confirm-password" name="confirmPassword" required type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={fieldStyle} /></label>}
        </fieldset>
        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <button disabled={submitting} className="min-h-11 w-full rounded-lg bg-green-800 px-4 py-3 font-medium text-white hover:bg-green-900 disabled:opacity-60">{submitting ? (register ? 'Creating account...' : 'Signing in...') : (register ? 'Create account' : 'Sign in')}</button>
      </form>
      <p className="mt-4 text-center text-sm text-stone-600">
        {register ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button type="button" disabled={submitting} onClick={() => switchMode(register ? 'login' : 'register')} className="min-h-11 px-1 font-medium text-green-800 underline underline-offset-4 hover:text-green-950 disabled:opacity-60">
          {register ? 'Sign in' : 'Create account'}
        </button>
      </p>
    </div>
  </div>;
}
