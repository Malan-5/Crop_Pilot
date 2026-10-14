import { BookOpen, ShieldCheck, Droplets, Leaf, Sun } from "lucide-react";
import Footer from "../components/Footer";

const articles = [
  {
    icon: Leaf,
    title: "Regular crop inspection",
    category: "Field practice",
    content: "Inspect plants regularly and compare changes over time. A clear photo of affected leaves can help document symptoms for a local agricultural adviser.",
  },
  {
    icon: Droplets,
    title: "Weather and crop health",
    category: "Monitoring",
    content: "Humidity, leaf wetness, and rainfall can affect crop health. Their effects vary by crop and disease, so use local guidance when deciding what action to take.",
  },
  {
    icon: ShieldCheck,
    title: "Responsible treatment use",
    category: "Product safety",
    content: "Use only products approved for the crop and issue in your area. Follow the current product label for rate, protective equipment, timing, and re-entry instructions.",
  },
  {
    icon: Sun,
    title: "Check conditions before spraying",
    category: "Weather",
    content: "Wind, temperature, and rain can affect an application. Check the product label and current field conditions before spraying.",
  },
];

const KnowledgeBasePage = () => (
  <div className="space-y-8">
    <header className="rounded-3xl border border-[#dce3d5] bg-white p-6 shadow-xs sm:p-8">
      <div className="flex items-center gap-2">
        <BookOpen size={18} className="text-[#597b44]" />
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#59685b]">General crop-care notes</span>
      </div>
      <h1 className="mt-1.5 font-serif text-2xl font-bold text-[#234b36] sm:text-4xl">Growing guide</h1>
      <p className="mt-1 max-w-2xl text-xs leading-relaxed text-[#59685b] sm:text-sm">
        General information for the project. Use product labels and local agricultural guidance for treatment decisions.
      </p>
    </header>

    <div className="grid gap-6 md:grid-cols-2">
      {articles.map(({ icon: Icon, title, category, content }) => (
        <article key={title} className="flex flex-col justify-between rounded-3xl border border-[#dce3d5] bg-white p-6 shadow-xs sm:p-7">
          <div>
            <div className="mb-4 flex items-center justify-between gap-3 border-b border-[#dce3d5] pb-3.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#597b44]">{category}</span>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#dce3d5] bg-[#f7f8f2] text-[#234b36]">
                <Icon size={18} />
              </div>
            </div>
            <h2 className="mb-2 font-serif text-lg font-bold text-[#234b36]">{title}</h2>
            <p className="text-xs leading-relaxed text-[#59685b] sm:text-sm">{content}</p>
          </div>
          <div className="mt-5 flex items-center gap-1.5 border-t border-[#dce3d5] pt-4 text-xs font-semibold text-[#59685b]">
            <ShieldCheck size={14} className="text-[#597b44]" />
            <span>General reference information</span>
          </div>
        </article>
      ))}
    </div>

    <Footer />
  </div>
);

export default KnowledgeBasePage;
