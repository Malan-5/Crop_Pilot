import WeatherAdvisory from "../components/weather/WeatherAdvisory";
import Footer from "../components/Footer";
import { CloudSun } from "lucide-react";

const WeatherPage = () => {
  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-[#dce3d5] p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2">
          <CloudSun size={18} className="text-[#597b44]" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#59685b]">
            Agro-Meteorology
          </span>
        </div>
        <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#234b36] mt-1.5">
          Weather outlook &amp; Spray Safety Index
        </h1>
        <p className="font-sans text-xs sm:text-sm text-[#59685b] mt-1 max-w-2xl leading-relaxed">
          Check current conditions and forecast-based spray advice for your location.
        </p>
      </div>

      {/* Main Weather outlook Component */}
      <WeatherAdvisory />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default WeatherPage;
