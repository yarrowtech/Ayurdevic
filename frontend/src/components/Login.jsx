import React, { useMemo, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { toast } from 'react-hot-toast';
import { loginUser, registerUser } from '../services/userService';

const Login = () => {
  const { setShowUserLogin, setUser } = useAppContext();

  const [state, setState] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Simple, robust email regex (no overfitting)
  const emailRegex = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i, []);

  const validate = () => {
    const trimmedEmail = email.trim();
    const trimmedName = name.trim();
    const trimmedPass = password;

    if (state === 'register') {
      if (!trimmedName) {
        toast.error('Please enter your name.');
        return false;
      }
      if (trimmedName.length < 2) {
        toast.error('Name should be at least 2 characters.');
        return false;
      }
    }

    if (!trimmedEmail) {
      toast.error('Please enter your email.');
      return false;
    }
    if (!emailRegex.test(trimmedEmail)) {
      toast.error('Please enter a valid email address.');
      return false;
    }

    if (!trimmedPass) {
      toast.error('Please enter your password.');
      return false;
    }
    if (trimmedPass.length < 6) {
      toast.error('Password should be at least 6 characters.');
      return false;
    }

    return true;
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    if (submitting) return;

    if (!validate()) return;

    try {
      setSubmitting(true);

      const data =
        state === 'register'
          ? await registerUser({ name: name.trim(), email: email.trim(), password })
          : await loginUser({ email: email.trim(), password });

      if (!data.success) {
        toast.error(data.message || 'Something went wrong. Please try again.');
        return;
      }

      setUser(data.user);
      setShowUserLogin(false);

      toast.success(state === 'register' ? 'Account created!' : 'Logged in!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      onClick={() => setShowUserLogin(false)}
      className="fixed inset-0 z-[80] flex items-center overflow-y-auto p-4 text-sm bg-black/50"
    >
      {/* Local toaster (you can keep a global one too) */}


      <form
        onSubmit={onSubmitHandler}
        onClick={(e) => e.stopPropagation()}
        className="
          relative flex flex-col gap-4 m-auto items-start w-full max-w-[352px] max-h-[calc(100dvh-2rem)] overflow-y-auto
          p-5 py-8 sm:p-8 rounded-lg shadow-xl
          border border-[var(--clay)]/70
          bg-[var(--paper)] text-[var(--ink)]
        "
      >
        <button type="button" aria-label="Close sign in" onClick={() => setShowUserLogin(false)} className="absolute right-1 top-1 flex h-11 w-11 items-center justify-center rounded text-xl">×</button>
        <p className="text-2xl font-medium m-auto">
          <span className="text-[var(--herbal)]">User</span>{' '}
          {state === 'login' ? 'Login' : 'Sign Up'}
        </p>

        {state === 'register' && (
          <div className="w-full">
            <p className="text-[var(--ink)]/80">Name</p>
            <input
              onChange={(e) => setName(e.target.value)}
              value={name}
              placeholder="Enter your name"
              className="
                border border-[var(--clay)] rounded w-full p-2 mt-1
                outline-[var(--herbal)]
                bg-white text-[var(--ink)]
                placeholder-[var(--ink)]/50
              "
              type="text"
              required
            />
          </div>
        )}

        <div className="w-full">
          <p className="text-[var(--ink)]/80">Email</p>
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            placeholder="Enter your email"
            className="
              border border-[var(--clay)] rounded w-full p-2 mt-1
              outline-[var(--herbal)]
              bg-white text-[var(--ink)]
              placeholder-[var(--ink)]/50
            "
            type="email"
            inputMode="email"
            autoComplete="email"
            required
          />
        </div>

        <div className="w-full">
          <p className="text-[var(--ink)]/80">Password</p>
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            placeholder="Enter your password"
            className="
              border border-[var(--clay)] rounded w-full p-2 mt-1
              outline-[var(--herbal)]
              bg-white text-[var(--ink)]
              placeholder-[var(--ink)]/50
            "
            type="password"
            autoComplete={state === 'login' ? 'current-password' : 'new-password'}
            required
          />
        </div>

        {state === 'register' ? (
          <p className="text-[var(--ink)]/80">
            Already have account?{' '}
            <span
              onClick={() => setState('login')}
              className="text-[var(--herbal)] cursor-pointer hover:underline"
            >
              click here
            </span>
          </p>
        ) : (
          <p className="text-[var(--ink)]/80">
            Create an account?{' '}
            <span
              onClick={() => setState('register')}
              className="text-[var(--herbal)] cursor-pointer hover:underline"
            >
              click here
            </span>
          </p>
        )}

        <button
          className={`
            w-full py-2 rounded-md cursor-pointer transition-all
            bg-[var(--herbal)] text-white hover:bg-[var(--herbal-dark)]
            ${submitting ? 'opacity-70 cursor-not-allowed' : ''}
          `}
          disabled={submitting}
        >
          {submitting
            ? state === 'register'
              ? 'Creating...'
              : 'Logging in...'
            : state === 'register'
            ? 'Create Account'
            : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default Login;
