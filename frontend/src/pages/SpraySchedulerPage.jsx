import { useState } from "react";
import { Link } from "react-router-dom";
import UpcomingSpraysCard from "../components/UpcomingSpraysCard";
import Footer from "../components/Footer";
import { ArrowRight, Calendar, Droplets, ShieldAlert } from "lucide-react";

const SpraySchedulerPage = () => {
  const [token] = useState(() => localStorage.getItem("token") || "");

  return (
    <div className="space-y-8">
      <header className="rounded-3xl border border-[#dce3d5] bg-white p-6 shadow-xs sm:p-8">
        <div className="flex items-center gap-2">
          <Droplets size={18} className="text-[#597b44]" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#59685b]">Saved treatment schedule</span>
        </div>
        <h1 className="mt-1.5 font-serif text-2xl font-bold text-[#234b36] sm:text-4xl">Care planner</h1>
        <p className="mt-1 max-w-2xl text-xs leading-relaxed text-[#59685b] sm:text-sm">
          Review upcoming applications and mark each one complete after treatment.
        </p>
      </header>

      <div className="grid min-w-0 items-start gap-6 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          <UpcomingSpraysCard token={token} refreshKey={0} onTreatmentDone={() => {}} />
          <Link to="/history-reports" className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#234b36] hover:text-[#597b44]">
            View completed and past applications <ArrowRight size={14} />
          </Link>
        </div>

        <div className="space-y-6">
          <section className="space-y-3 rounded-3xl border border-[#dce3d5] bg-white p-6 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#234b36]">
              <Calendar size={16} className="text-[#597b44]" />
              <span>Application timing</span>
            </div>
            <p className="text-xs leading-relaxed text-[#59685b]">
              Follow the interval shown with the saved scan recommendation and the current product label. Timing can depend on the crop and local conditions.
            </p>
          </section>

          <section className="space-y-3 rounded-3xl border border-[#dce3d5] bg-[#fbfcf8] p-6 shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#234b36]">
              <ShieldAlert size={16} className="text-[#9c7422]" />
              <span>Product safety</span>
            </div>
            <p className="text-xs leading-relaxed text-[#59685b]">
              Use the protective equipment and re-entry interval stated on the product label. Store products away from children and livestock.
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SpraySchedulerPage;
