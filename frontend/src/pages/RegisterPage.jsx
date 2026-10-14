import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, LoaderCircle } from 'lucide-react';
import axios from 'axios';
import AuthLayout from '../components/AuthLayout';
import Brand from '../components/Brand';

import { API_URL, apiErrorMessage } from "../services/api.js";

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    if (loading) return;
    setError('');
    if (new TextEncoder().encode(password).length > 72) {
      setError('Your password must use no more than 72 UTF-8 bytes.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.post(`${API_URL}/api/auth/register`, { username: username.trim(), password, confirmPassword });
      navigate('/login', { replace: true, state: { message: data.message } });
    } catch (requestError) {
      setError(apiErrorMessage(requestError, 'Unable to create your account. Check your connection and try again.'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="mb-8 lg:hidden"><Brand /></div>
      <p className="eyebrow">Start your growing journey</p>
      <h1 className="mt-3 text-4xl font-bold text-[#234b36]">Make room to grow.</h1>
      <p className="mb-7 mt-3 text-sm leading-relaxed text-[#59685b]">Create your account to keep scans and care plans together.</p>
      {error && <p role="alert" className="form-error">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-5" aria-busy={loading}>
        <div>
          <label className="field-label" htmlFor="register-username">Choose a username</label>
          <input className="field-input" id="register-username" name="username" autoComplete="username" autoCapitalize="none" spellCheck={false} required minLength={3} maxLength={32} pattern={'[a-zA-Z][a-zA-Z0-9_.\\-]{2,31}'} title="3–32 characters, starting with a letter; letters, numbers, dots, hyphens and underscores." aria-describedby="username-help" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="e.g. greenfield_01" />
          <p id="username-help" className="mt-2 text-xs text-[#59685b]">3–32 characters. Start with a letter; use letters, numbers, dots, hyphens or underscores.</p>
        </div>
        <div>
          <label className="field-label" htmlFor="register-password">Password</label>
          <input className="field-input" id="register-password" name="password" type="password" autoComplete="new-password" required minLength={8} maxLength={72} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" />
        </div>
        <div>
          <label className="field-label" htmlFor="register-confirm">Confirm password</label>
          <input className="field-input" id="register-confirm" name="confirmPassword" type="password" autoComplete="new-password" required minLength={8} maxLength={72} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Enter your password again" />
        </div>
        <button className="primary-button w-full" type="submit" disabled={loading}>{loading ? <LoaderCircle size={18} className="animate-spin" /> : <ArrowRight size={18} />}{loading ? 'Creating account…' : 'Create account'}</button>
      </form>
      <p className="mt-7 text-center text-sm text-[#59685b]">Already growing with us? <Link to="/login" className="font-bold text-[#234b36] underline underline-offset-4">Sign in</Link></p>
    </AuthLayout>
  );
}
