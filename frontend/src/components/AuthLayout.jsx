import { Link } from 'react-router-dom';
import { ArrowLeft, ScanLine, CalendarDays, CloudSun } from 'lucide-react';
import Brand from './Brand';

export default function AuthLayout({ children }) {
  return (
    <main className="auth-layout">
      <aside className="auth-story">
        <Link to="/" aria-label="CropPilot home"><Brand light /></Link>
        <div>
          <p className="eyebrow text-[#cee39a]">Your growing season, connected</p>
          <h2>A little clarity.<br />A healthier harvest.</h2>
          <p className="auth-story-copy">Keep crop observations, care plans and changing weather together in one place.</p>
          <div className="auth-story-tools">
            <span><ScanLine size={18} /> Understand your crops</span>
            <span><CalendarDays size={18} /> Plan the next step</span>
            <span><CloudSun size={18} /> Follow the forecast</span>
          </div>
        </div>
        <p className="text-xs text-white/60">CropPilot · Your crop care companion</p>
      </aside>
      <div className="auth-content">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#59685b] hover:text-[#234b36]"><ArrowLeft size={16} /> Back to home</Link>
        <section className="auth-form-card">{children}</section>
        <p className="text-center text-xs text-[#59685b]">Made for the work between planting and harvest.</p>
      </div>
    </main>
  );
}
