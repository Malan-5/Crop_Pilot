import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, LoaderCircle } from 'lucide-react';
import axios from 'axios';
import AuthLayout from '../components/AuthLayout';
import Brand from '../components/Brand';

import { API_URL, apiErrorMessage } from "../services/api.js";

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_URL}/api/auth/login`, { username: username.trim(), password });
      if (!data.token) throw new Error('Unable to start your session.');
      localStorage.setItem('token', data.token);
      localStorage.removeItem('agro_stats');
      localStorage.removeItem('agro_last_scan');
      navigate('/dashboard', { replace: true });
    } catch (requestError) {
      setError(apiErrorMessage(requestError, 'Unable to sign in. Check your connection and try again.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="mb-8 lg:hidden"><Brand /></div>
      <p className="eyebrow">Welcome back</p>
      <h1 className="mt-3 text-4xl font-bold text-[#234b36]">Your farm awaits.</h1>
      <p className="mb-7 mt-3 text-sm leading-relaxed text-[#59685b]">Sign in to pick up where you left off.</p>
      {location.state?.message && <p role="status" className="form-success">{location.state.message}</p>}
      {error && <p role="alert" className="form-error">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-5" aria-busy={loading}>
        <div>
          <label className="field-label" htmlFor="login-username">Username</label>
          <input className="field-input" id="login-username" name="username" autoComplete="username" autoCapitalize="none" spellCheck={false} required maxLength={80} value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Your username" />
        </div>
        <div>
          <label className="field-label" htmlFor="login-password">Password</label>
          <div className="relative">
            <input className="field-input pr-12" id="login-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Your password" />
            <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
          </div>
        </div>
        <button className="primary-button w-full" type="submit" disabled={loading}>{loading ? <LoaderCircle size={18} className="animate-spin" /> : <ArrowRight size={18} />}{loading ? 'Signing in…' : 'Sign in'}</button>
      </form>
      <p className="mt-7 text-center text-sm text-[#59685b]">New here? <Link to="/register" className="font-bold text-[#234b36] underline underline-offset-4">Create an account</Link></p>
    </AuthLayout>
  );
}
