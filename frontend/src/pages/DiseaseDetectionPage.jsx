import { useState } from "react";
import PlantScanPanel from "../components/PlantScanPanel";
import Footer from "../components/Footer";
import { Bug } from "lucide-react";

const DiseaseDetectionPage = () => {
  const [token] = useState(() => localStorage.getItem("token") || "");

  return (
    <div className="space-y-8">
      <header className="rounded-3xl border border-[#dce3d5] bg-white p-6 shadow-xs sm:p-8">
        <div className="flex items-center gap-2">
          <Bug size={18} className="text-[#597b44]" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#59685b]">Kindwise crop assessment</span>
        </div>
        <h1 className="mt-1.5 font-serif text-2xl font-bold text-[#234b36] sm:text-4xl">Crop health</h1>
        <p className="mt-1 max-w-2xl text-xs leading-relaxed text-[#59685b] sm:text-sm">
          Upload a clear plant photo to request a crop and disease assessment from Kindwise and review any treatment information returned with the scan.
        </p>
      </header>

      <PlantScanPanel token={token} onScanComplete={() => {}} onSprayScheduled={() => {}} />
      <Footer />
    </div>
  );
};

export default DiseaseDetectionPage;
