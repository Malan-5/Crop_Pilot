import { Sprout, Bug, Calendar, ShieldCheck } from "lucide-react";

const MetricCard = ({ title, value, subtitle, source, icon: Icon, accentColor, loading }) => (
  <div className="bg-white border border-[#dce3d5] rounded-2xl p-4 sm:p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm hover:border-[#a7bb8b] flex flex-col justify-between">
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0 flex-1">
        <p className="font-serif text-3xl sm:text-4xl font-bold text-[#234b36] tracking-tight leading-none">
          {loading ? "…" : value ?? "—"}
        </p>
        <p className="font-sans text-xs sm:text-sm font-bold text-[#283b2c] mt-2 truncate">
          {title}
        </p>
        <p className="font-sans text-[11px] text-[#59685b] mt-0.5 truncate">
          {subtitle}
        </p>
      </div>

      <div
        className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 ${accentColor.bg} ${accentColor.text} border ${accentColor.border}`}
      >
        <Icon size={20} />
      </div>
    </div>

    <div className="mt-4 pt-3 border-t border-[#dce3d5]/60 flex items-center justify-between text-[11px] text-[#59685b]">
      <span className="truncate">{source}</span>
      <span className="w-1.5 h-1.5 rounded-full bg-[#597b44]" />
    </div>
  </div>
);

const DashboardMetrics = ({ stats, loading = false }) => {
  const {
    cropsScanned,
    diseasesFound,
    upcomingSprays,
    treatmentsDone,
  } = stats || {};

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
      <MetricCard
        title="Crops Scanned"
        value={cropsScanned}
        subtitle="All recorded scans"
        source="Scan records"
        loading={loading}
        icon={Sprout}
        accentColor={{
          bg: "bg-[#f7f8f2]",
          text: "text-[#234b36]",
          border: "border-[#dce3d5]",
        }}
      />
      <MetricCard
        title="Diseases Found"
        value={diseasesFound}
        subtitle="From scan records"
        source="Scan records"
        loading={loading}
        icon={Bug}
        accentColor={{
          bg: "bg-amber-50/70",
          text: "text-[#9c7422]",
          border: "border-amber-200/60",
        }}
      />
      <MetricCard
        title="Upcoming Sprays"
        value={upcomingSprays}
        subtitle="Next 7 days"
        source="Treatment schedule"
        loading={loading}
        icon={Calendar}
        accentColor={{
          bg: "bg-[#f7f8f2]",
          text: "text-[#597b44]",
          border: "border-[#dce3d5]",
        }}
      />
      <MetricCard
        title="Treatments Done"
        value={treatmentsDone}
        subtitle="Completed applications"
        source="Treatment schedule"
        loading={loading}
        icon={ShieldCheck}
        accentColor={{
          bg: "bg-[#f0f4e9]",
          text: "text-[#234b36]",
          border: "border-[#dce3d5]",
        }}
      />
    </div>
  );
};

export default DashboardMetrics;
