import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Menu, X } from 'lucide-react';
import axios from 'axios';
import Brand from './Brand';

import { API_URL } from "../services/api.js";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    let active = true;
    axios.get(`${API_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => { if (active) setAuthenticated(true); })
      .catch((error) => {
        if ([401, 404].includes(error.response?.status)) localStorage.removeItem('token');
      });
    return () => { active = false; };
  }, []);
  return (
    <header className="site-navbar">
      <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
        <Link to="/" aria-label="CropPilot home"><Brand /></Link>
        <nav className="hidden items-center gap-8 text-sm font-semibold text-[#59685b] md:flex" aria-label="Main navigation">
          <a href="#features">The workspace</a><a href="#how-it-works">How it works</a>
        </nav>
        <div className="flex items-center gap-4">
          <Link className="hidden text-sm font-bold text-[#234b36] sm:block" to={authenticated ? '/dashboard' : '/login'}>{authenticated ? 'My workspace' : 'Sign in'}</Link>
          <Link to={authenticated ? '/dashboard' : '/register'} className="primary-button !min-h-10 !px-4 !py-2 text-xs sm:text-sm">{authenticated ? 'Dashboard' : 'Get started'}<ArrowRight size={15} /></Link>
          <button type="button" className="p-2 md:hidden" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="landing-menu" onClick={() => setOpen(!open)}>{open ? <X size={21} /> : <Menu size={21} />}</button>
        </div>
      </div>
      {open && <nav id="landing-menu" className="flex flex-col gap-4 border-t border-[#dce3d5] bg-white p-5 text-sm font-semibold md:hidden" aria-label="Mobile navigation"><a href="#features" onClick={() => setOpen(false)}>The workspace</a><a href="#how-it-works" onClick={() => setOpen(false)}>How it works</a><Link to="/login">Sign in</Link></nav>}
    </header>
  );
}
