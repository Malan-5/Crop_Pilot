import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Calendar, LogOut, ShieldCheck, UserCircle2 } from "lucide-react";
import Footer from "../components/Footer";

import { API_URL } from "../services/api.js";

const formatDate = (value) => {
  const date = new Date(value);
  return value && !Number.isNaN(date.getTime())
    ? date.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : "Not available";
};

const ProfilePage = () => {
  const [user, setUser] = useState(null);
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

    axios
      .get(`${API_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => {
        if (!ignore) setUser(response.data);
      })
      .catch((requestError) => {
        if (!ignore) {
          if (requestError.response?.status === 401 || requestError.response?.status === 404) {
            localStorage.removeItem("token");
            navigate("/login", { replace: true });
          } else {
            setError(requestError.response?.data?.error || "Could not load your profile.");
          }
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => { ignore = true; };
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("agro_stats");
    localStorage.removeItem("agro_last_scan");
    navigate("/login", { replace: true });
  };

  return (
    <div className="space-y-8" aria-busy={loading}>
      <header className="rounded-3xl border border-[#dce3d5] bg-white p-6 shadow-xs sm:p-8">
        <div className="flex items-center gap-2">
          <UserCircle2 size={18} className="text-[#597b44]" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#59685b]">Account details</span>
        </div>
        <h1 className="mt-1.5 font-serif text-2xl font-bold text-[#234b36] sm:text-4xl">My account</h1>
        <p className="mt-1 max-w-2xl text-xs leading-relaxed text-[#59685b] sm:text-sm">
          Your personal workspace and account details.
        </p>
      </header>

      {error && <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</div>}

      {loading ? (
        <div className="rounded-3xl border border-[#dce3d5] bg-white p-10 text-center text-sm text-[#59685b]">Loading profile…</div>
      ) : user && (
        <div className="grid min-w-0 gap-6 lg:grid-cols-3">
          <section className="rounded-3xl border border-[#dce3d5] bg-white p-6 shadow-xs sm:p-8">
            <div className="flex min-w-0 items-center gap-4 border-b border-[#dce3d5] pb-6">
              {user.picture ? (
                <img src={user.picture} alt="Farmer profile" referrerPolicy="no-referrer" className="h-16 w-16 shrink-0 rounded-2xl border border-[#dce3d5] object-cover" />
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#234b36] font-serif text-2xl font-bold text-white">
                  {(user.username || "F").charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <h2 className="truncate font-serif text-xl font-bold text-[#234b36]">{user.username || "Farmer"}</h2>
                <p className="mt-1 text-xs text-[#59685b]">CropPilot member</p>
              </div>
            </div>

            <dl className="space-y-4 py-6 text-sm">
              <div className="flex items-start gap-3">
                <Calendar size={17} className="mt-0.5 shrink-0 text-[#597b44]" />
                <div>
                  <dt className="text-xs text-[#59685b]">Account created</dt>
                  <dd className="font-semibold text-[#283b2c]">{formatDate(user.createdAt)}</dd>
                </div>
              </div>
            </dl>

            <button type="button" onClick={logout} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 py-3 text-xs font-bold text-rose-800 transition-colors hover:bg-rose-100">
              <LogOut size={15} /> Sign out
            </button>
          </section>

          <section className="space-y-6 lg:col-span-2">
            <div className="rounded-3xl border border-[#dce3d5] bg-white p-6 shadow-xs sm:p-8">
              <h2 className="font-serif text-lg font-bold text-[#234b36]">Your workspace</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#dce3d5] bg-[#fbfcf8] p-4">
                  <div className="flex items-center gap-2 text-[#597b44]"><ShieldCheck size={17} /><span className="text-[11px] font-bold uppercase tracking-wider">Authentication</span></div>
                  <p className="mt-2 text-sm font-semibold text-[#283b2c]">Username and password</p>
                  <p className="mt-1 text-xs leading-relaxed text-[#59685b]">Use your username and password to access your workspace.</p>
                </div>
                <div className="rounded-2xl border border-[#dce3d5] bg-[#fbfcf8] p-4">
                  <div className="flex items-center gap-2 text-[#597b44]"><Calendar size={17} /><span className="text-[11px] font-bold uppercase tracking-wider">Project data</span></div>
                  <p className="mt-2 text-sm font-semibold text-[#283b2c]">Your crop care records</p>
                  <p className="mt-1 text-xs leading-relaxed text-[#59685b]">Saved crop scans and treatment schedules are linked to this account.</p>
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-[#dce3d5] bg-[#f0f4e9] p-6 text-sm leading-relaxed text-[#283b2c]">
              Your scans and care plans are linked to your account. Sign out when using a shared device.
            </div>
          </section>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ProfilePage;
