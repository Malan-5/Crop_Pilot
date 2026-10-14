import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { ArrowRight, Bug, CheckCircle2, LoaderCircle, Sprout } from "lucide-react";
import Footer from "../components/Footer";
import UpcomingSpraysCard from "../components/UpcomingSpraysCard";

import { API_URL } from "../services/api.js";

const MyCropsPage = () => {
  const [token] = useState(() => localStorage.getItem("token") || "");
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    axios
      .get(`${API_URL}/api/scan/history?limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        if (!ignore) setScans(response.data.scans || []);
      })
      .catch((requestError) => {
        if (!ignore) setError(requestError.response?.data?.error || "Could not load crop scan records.");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => { ignore = true; };
  }, [token]);

  return (
    <div className="space-y-8">
      <header className="rounded-3xl border border-[#dce3d5] bg-white p-6 shadow-xs sm:p-8">
        <div className="flex items-center gap-2">
          <Sprout size={18} className="text-[#597b44]" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#59685b]">Your saved crop records</span>
        </div>
        <h1 className="mt-1.5 font-serif text-2xl font-bold text-[#234b36] sm:text-4xl">Crop records</h1>
        <p className="mt-1 max-w-2xl text-xs leading-relaxed text-[#59685b] sm:text-sm">
          Review crops identified in your saved scans and check their scheduled treatments.
        </p>
      </header>

      <div className="grid min-w-0 gap-6 lg:grid-cols-2">
        <section className="min-w-0 rounded-3xl border border-[#dce3d5] bg-white p-5 shadow-xs sm:p-7" aria-labelledby="crop-records-title">
          <div className="mb-4 flex items-center justify-between border-b border-[#dce3d5] pb-4">
            <h2 id="crop-records-title" className="font-serif text-lg font-bold text-[#234b36]">Recent Crop Scans</h2>
            <Link to="/history-reports" className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-[#234b36] hover:text-[#597b44]">
              All history <ArrowRight size={13} />
            </Link>
          </div>

          {loading ? (
            <div className="flex min-h-36 items-center justify-center gap-2 text-sm text-[#59685b]">
              <LoaderCircle size={18} className="animate-spin text-[#597b44]" /> Loading crop records…
            </div>
          ) : error ? (
            <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{error}</p>
          ) : scans.length ? (
            <ul className="divide-y divide-[#dce3d5]">
              {scans.map((scan) => {
                const healthy = scan.isHealthy || scan.diseaseDetected === "Healthy";
                return (
                  <li key={scan._id} className="flex min-w-0 items-start gap-3 py-4 first:pt-1">
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#dce3d5] bg-[#f7f8f2] text-[#597b44]">
                      {healthy ? <CheckCircle2 size={17} /> : <Bug size={17} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-[#283b2c]">{scan.cropName || "Crop"}</p>
                      <p className={`break-words text-xs ${healthy ? "text-[#234b36]" : "text-rose-800"}`}>
                        {healthy ? "No disease detected" : scan.diseaseDetected || "Disease result unavailable"}
                      </p>
                      {scan.pesticide && <p className="mt-1 truncate text-xs text-[#59685b]">{scan.pesticide}</p>}
                    </div>
                    <time className="shrink-0 text-right text-[11px] text-[#59685b]">
                      {new Date(scan.scannedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </time>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="py-10 text-center">
              <Sprout size={24} className="mx-auto mb-2 text-[#597b44]" />
              <p className="font-semibold text-[#283b2c]">No crop scans saved</p>
              <Link to="/disease-detection" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#234b36]">
                Start a scan <ArrowRight size={13} />
              </Link>
            </div>
          )}
        </section>

        <UpcomingSpraysCard token={token} refreshKey={0} onTreatmentDone={() => {}} />
      </div>

      <Footer />
    </div>
  );
};

export default MyCropsPage;
