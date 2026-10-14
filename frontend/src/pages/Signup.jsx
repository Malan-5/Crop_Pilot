import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, ScanLine, CalendarDays, CloudSun, Sprout, Files, BookOpen, Leaf, Check, MoveUpRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const features = [
  { icon: ScanLine, number: '01', title: 'Look closer. Know more.', description: 'Upload a leaf photo to identify possible disease and review the plant health result.', name: 'Crop health', path: '/disease-detection' },
  { icon: CalendarDays, number: '02', title: 'Give care a clear plan.', description: 'Turn treatment recommendations into a schedule and track each application.', name: 'Care planner', path: '/spray-scheduler' },
  { icon: CloudSun, number: '03', title: 'Work with the weather.', description: 'Check local conditions and weather-based spray advice before heading outside.', name: 'Weather outlook', path: '/weather-advisory' },
  { icon: Files, number: '04', title: 'Keep the whole story.', description: 'Find your earlier crop scans, diagnoses and treatment activity in one journal.', name: 'Scan journal', path: '/history-reports' },
  { icon: Sprout, number: '05', title: 'A home for your crops.', description: 'Review the crops identified in your saved scans and their care schedules.', name: 'Crop records', path: '/my-crops' },
  { icon: BookOpen, number: '06', title: 'Keep learning, keep growing.', description: 'Read practical reference notes on crop health, prevention and everyday care.', name: 'Growing guide', path: '/knowledge-base' },
];

export default function Signup() {
  return (
    <div className="landing-page">
      <Navbar />
      <main>
        <section className="landing-hero">
          <div className="hero-copy">
            <p className="eyebrow flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#728c38]" /> A companion for every growing season</p>
            <h1>Healthy crops.<br />Thoughtful care.<br /><span>A better tomorrow.</span></h1>
            <p className="hero-description">From the first sign on a leaf to your next care plan, bring every crop decision into focus.</p>
            <div className="flex flex-wrap items-center gap-5">
              <Link to="/register" className="primary-button">Start your workspace <ArrowRight size={18} /></Link>
              <a href="#how-it-works" className="text-sm font-bold text-[#234b36]">Take a look around <ArrowUpRight className="inline ml-1" size={16} /></a>
            </div>
            <div className="hero-footnote"><span><Check size={14} /> Personal scan history</span><span><Check size={14} /> Care & weather together</span></div>
          </div>
          <div className="field-illustration" role="img" aria-label="Illustration of green crop fields, a sun, and a growing plant">
            <div className="field-sun" /><div className="field-hill hill-back" /><div className="field-hill hill-front" /><div className="field-rows" />
            <div className="field-plant"><Sprout size={150} strokeWidth={1.1} /></div>
            <div className="field-note note-top"><span className="note-icon"><Leaf size={20} /></span><div><strong>Every leaf tells a story.</strong><small>Start with a closer look</small></div></div>
            <div className="field-note note-bottom"><CalendarDays size={21} /><div><strong>Small steps. Steady growth.</strong><small>Your care plan, all in one place</small></div><MoveUpRight size={18} /></div>
            <span className="field-caption">Rooted in care. Guided by clarity.</span>
          </div>
        </section>
        <section id="features" className="landing-section">
          <div className="section-heading"><div><p className="eyebrow">Everything has its place</p><h2>Meet your crop care workspace.</h2></div><p>Six useful tools. One connected view of your growing season.</p></div>
          <div className="feature-grid">{features.map(({ icon: Icon, number, title, description, name, path }) => <article key={number} className="feature-card"><div className="flex items-center justify-between"><span className="feature-icon"><Icon size={23} strokeWidth={1.6} /></span><span className="text-xs font-semibold text-[#59685b]">{number}</span></div><h3>{title}</h3><p>{description}</p><Link to={path}>{name}<ArrowUpRight size={16} /></Link></article>)}</div>
        </section>
        <section id="how-it-works" className="landing-section journey-section">
          <div><p className="eyebrow">From observation to action</p><h2>A simpler rhythm<br />for crop care.</h2><p className="mt-4 max-w-sm text-sm leading-7 text-[#59685b]">Make an observation, understand the result and keep track of what comes next.</p><Link to="/register" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#234b36]">Create your account <ArrowRight size={16} /></Link></div>
          <ol className="journey-list">{[
            ['Create your space', 'Choose a username and password to get your own workspace.'],
            ['Capture a crop', 'Upload a clear crop photo and review the health analysis.'],
            ['Plan and follow through', 'Review recommendations, schedule care and record completed sprays.'],
          ].map(([title, description], index) => <li key={title}><span>{String(index + 1).padStart(2, '0')}</span><div><h3>{title}</h3><p>{description}</p></div></li>)}</ol>
        </section>
        <section className="landing-cta"><Sprout size={38} strokeWidth={1.4} /><h2>Give your crops<br />a little more clarity.</h2><Link to="/register" className="primary-button !bg-[#cee39a] !text-[#234b36]">Let’s get growing <ArrowRight size={18} /></Link></section>
      </main>
      <div className="mx-auto max-w-7xl px-5 sm:px-8"><Footer /></div>
    </div>
  );
}
