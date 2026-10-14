import { Link } from 'react-router-dom';
import Brand from './Brand';

export default function Footer() {
  return (
    <footer className="app-footer">
      <Link to="/" aria-label="CropPilot home"><Brand compact /></Link>
      <p className="text-xs text-[#59685b]">CropPilot · A clearer view of crop care</p>
      <div className="flex gap-5 text-xs font-semibold text-[#234b36]"><Link to="/knowledge-base">Growing guide</Link><Link to="/profile">My account</Link></div>
    </footer>
  );
}
