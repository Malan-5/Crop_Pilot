import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ScanLine, Sprout, CalendarDays, CloudSun, Files, BookOpen, NotebookPen, UserRound, Menu, X, LogOut, ArrowUpRight } from 'lucide-react';
import Brand from './Brand';

const groups = [
  { label: 'Your workspace', items: [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Crop health', path: '/disease-detection', icon: ScanLine },
    { name: 'Crop records', path: '/my-crops', icon: Sprout },
    { name: 'Care planner', path: '/spray-scheduler', icon: CalendarDays },
    { name: 'Weather outlook', path: '/weather-advisory', icon: CloudSun },
  ] },
  { label: 'Library & account', items: [
    { name: 'Scan journal', path: '/history-reports', icon: Files },
    { name: 'Field journal', path: '/field-journal', icon: NotebookPen },
    { name: 'Growing guide', path: '/knowledge-base', icon: BookOpen },
    { name: 'My account', path: '/profile', icon: UserRound },
  ] },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('agro_stats');
    localStorage.removeItem('agro_last_scan');
    navigate('/login', { replace: true });
  }
  return (
    <>
      <div className="mobile-appbar lg:hidden"><Link to="/dashboard"><Brand /></Link><button type="button" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} aria-controls="workspace-sidebar" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button></div>
      {open && <button type="button" className="fixed inset-0 z-40 bg-black/35 lg:hidden" aria-label="Close navigation overlay" onClick={() => setOpen(false)} />}
      <aside id="workspace-sidebar" className={`workspace-sidebar ${open ? 'sidebar-open' : ''}`}>
        <Link className="mb-10 hidden lg:block" to="/"><Brand light /></Link>
        <nav aria-label="Workspace navigation" className="min-h-0 flex-1 overflow-y-auto">
          {groups.map((group) => <div key={group.label} className="mb-7">
            <p className="sidebar-label">{group.label}</p>
            {group.items.map(({ name, path, icon: Icon }) => <NavLink key={path} to={path} onClick={() => setOpen(false)} className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}><Icon size={18} /><span>{name}</span></NavLink>)}
          </div>)}
        </nav>
        <Link to="/knowledge-base" onClick={() => setOpen(false)} className="sidebar-tip"><Sprout size={22} /><span><strong>Good care starts here.</strong><small>Explore the growing guide</small></span><ArrowUpRight size={15} /></Link>
        <button type="button" onClick={logout} className="sidebar-link mt-4"><LogOut size={18} /> Sign out</button>
      </aside>
    </>
  );
}
