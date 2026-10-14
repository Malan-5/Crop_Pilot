import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowRight, Bug, CalendarCheck2, CheckCircle2, Clock3, FileText, Leaf, LoaderCircle } from "lucide-react";
import Footer from "../components/Footer";

import { API_URL } from "../services/api.js";

const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const HistoryReportsPage = () => {
  const [scans, setScans] = useState([]);
  const [scanTotal, setScanTotal] = useState(0);
  const [applications, setApplications] = useState([]);
  const [applicationTotal, setApplicationTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let ignore = false;
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return () => { ignore = true; };
    }

    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      axios.get(`${API_URL}/api/scan/history?limit=50`, { headers }),
      axios.get(`${API_URL}/api/treatment/history?limit=100`, { headers }),
    ])
      .then(([scanResponse, treatmentResponse]) => {
        if (ignore) return;
        setScans(scanResponse.data.scans || []);
        setScanTotal(scanResponse.data.total || 0);
        setApplications(treatmentResponse.data.applications || []);
        setApplicationTotal(treatmentResponse.data.total || 0);
      })
      .catch((requestError) => {
        if (!ignore) {
          setError(requestError.response?.data?.error || "Could not load your saved history. Please try again.");
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => { ignore = true; };
  }, [navigate]);

  return (
    <div className="space-y-8">
      <header className="rounded-3xl border border-[#dce3d5] bg-white p-6 shadow-xs sm:p-8">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-[#597b44]" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#59685b]">Saved farmer records</span>
        </div>
        <h1 className="mt-1.5 font-serif text-2xl font-bold text-[#234b36] sm:text-4xl">Scan journal</h1>
        <p className="mt-1 max-w-2xl text-xs leading-relaxed text-[#59685b] sm:text-sm">
          Diagnoses and spray applications saved to your farmer account.
        </p>
      </header>

      {error && (
        <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          {error}
        </div>
      )}

      <div className="grid min-w-0 gap-6 lg:grid-cols-2">
        <section className="min-w-0 rounded-3xl border border-[#dce3d5] bg-white p-5 shadow-xs sm:p-7" aria-labelledby="scan-history-title">
          <div className="mb-4 flex items-center justify-between gap-3 border-b border-[#dce3d5] pb-4">
            <div className="flex min-w-0 items-center gap-2">
              <Bug size={18} className="shrink-0 text-[#597b44]" />
              <h2 id="scan-history-title" className="font-serif text-lg font-bold text-[#234b36]">Crop Scans</h2>
            </div>
            <span className="shrink-0 rounded-full border border-[#dce3d5] bg-[#f7f8f2] px-2.5 py-1 text-xs font-semibold text-[#234b36]">
              {loading ? "…" : scanTotal}
            </span>
          </div>

          {loading ? (
            <div className="flex min-h-40 items-center justify-center gap-2 text-sm text-[#59685b]">
              <LoaderCircle size={18} className="animate-spin text-[#597b44]" /> Loading saved scans…
            </div>
          ) : scans.length ? (
            <ul className="divide-y divide-[#dce3d5]">
              {scans.map((scan) => {
                const healthy = scan.isHealthy || scan.diseaseDetected === "Healthy";
                return (
                  <li key={scan._id} className="min-w-0 py-4 first:pt-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-[#283b2c]">{scan.cropName || "Crop"}</p>
                        <p className={`mt-0.5 flex items-center gap-1.5 text-sm font-medium ${healthy ? "text-[#234b36]" : "text-rose-800"}`}>
                          {healthy ? <CheckCircle2 size={15} className="shrink-0" /> : <Bug size={15} className="shrink-0" />}
                          <span className="break-words">{healthy ? "No disease detected" : scan.diseaseDetected || "Disease result unavailable"}</span>
                        </p>
                      </div>
                      <time className="shrink-0 text-right text-xs text-[#59685b]">{formatDate(scan.scannedAt)}</time>
                    </div>
                    {(scan.recommendation || scan.pesticide) && (
                      <p className="mt-2 break-words rounded-xl bg-[#f7f8f2] p-3 text-xs leading-relaxed text-[#59685b]">
                        {scan.recommendation || scan.pesticide}
                      </p>
                    )}
                    {Number.isFinite(scan.confidence) && (
                      <p className="mt-2 text-[11px] text-[#59685b]">Kindwise model confidence: {scan.confidence}%</p>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : !error ? (
            <div className="py-10 text-center">
              <Leaf size={24} className="mx-auto mb-2 text-[#597b44]" />
              <p className="font-semibold text-[#283b2c]">No scan records yet</p>
              <p className="mx-auto mt-1 max-w-xs text-xs text-[#59685b]">Run a crop scan to save the diagnosis to your account.</p>
              <Link to="/disease-detection" className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#234b36] hover:text-[#597b44]">
                Start a scan <ArrowRight size={14} />
              </Link>
            </div>
          ) : null}
          {!loading && scanTotal > scans.length && (
            <p className="mt-3 border-t border-[#dce3d5] pt-3 text-xs text-[#59685b]">Showing the latest {scans.length} of {scanTotal} scans.</p>
          )}
        </section>

        <section className="min-w-0 rounded-3xl border border-[#dce3d5] bg-white p-5 shadow-xs sm:p-7" aria-labelledby="treatment-history-title">
          <div className="mb-4 flex items-center justify-between gap-3 border-b border-[#dce3d5] pb-4">
            <div className="flex min-w-0 items-center gap-2">
              <CalendarCheck2 size={18} className="shrink-0 text-[#597b44]" />
              <h2 id="treatment-history-title" className="font-serif text-lg font-bold text-[#234b36]">Spray Applications</h2>
            </div>
            <span className="shrink-0 rounded-full border border-[#dce3d5] bg-[#f7f8f2] px-2.5 py-1 text-xs font-semibold text-[#234b36]">
              {loading ? "…" : applicationTotal}
            </span>
          </div>

          {loading ? (
            <div className="flex min-h-40 items-center justify-center gap-2 text-sm text-[#59685b]">
              <LoaderCircle size={18} className="animate-spin text-[#597b44]" /> Loading spray records…
            </div>
          ) : applications.length ? (
            <ul className="divide-y divide-[#dce3d5]">
              {applications.map((application) => (
                <li key={`${application.treatmentId}-${application.sprayId}`} className="min-w-0 py-4 first:pt-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[#283b2c]">{application.cropName}</p>
                      <p className="mt-0.5 break-words text-sm text-[#59685b]">{application.pesticide || application.disease || "Treatment scheduled"}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <time className="block text-xs text-[#59685b]">{formatDate(application.date)}</time>
                      <span className={`mt-1 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${application.status === "done" ? "border-[#a7bb8b] bg-[#f0f4e9] text-[#234b36]" : "border-amber-200 bg-amber-50 text-amber-900"}`}>
                        {application.status === "done" ? "Completed" : "Pending"}
                      </span>
                    </div>
                  </div>
                  {(application.dosage || application.disease) && (
                    <p className="mt-2 text-xs text-[#59685b]">
                      {[application.disease, application.dosage].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          ) : !error ? (
            <div className="py-10 text-center">
              <Clock3 size={24} className="mx-auto mb-2 text-[#597b44]" />
              <p className="font-semibold text-[#283b2c]">No spray applications yet</p>
              <p className="mx-auto mt-1 max-w-xs text-xs text-[#59685b]">Schedule a treatment from a saved disease scan.</p>
              <Link to="/spray-scheduler" className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#234b36] hover:text-[#597b44]">
                View treatment schedule <ArrowRight size={14} />
              </Link>
            </div>
          ) : null}
          {!loading && applicationTotal > applications.length && (
            <p className="mt-3 border-t border-[#dce3d5] pt-3 text-xs text-[#59685b]">Showing the latest {applications.length} of {applicationTotal} applications.</p>
          )}
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default HistoryReportsPage;
