import { Sprout } from 'lucide-react';

export default function Brand({ light = false, compact = false }) {
  return (
    <span className={`brand ${light ? 'brand-light' : ''}`}>
      <span className="brand-mark"><Sprout size={25} strokeWidth={1.8} aria-hidden="true" /></span>
      {!compact && <span><span className="brand-name">CropPilot<span className="brand-dot">.</span></span><span className="brand-tagline">Grow with clarity</span></span>}
    </span>
  );
}
