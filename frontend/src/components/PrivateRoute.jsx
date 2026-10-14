import { useEffect, useState } from "react";
import { Link, Navigate, Outlet } from "react-router-dom";
import axios from "axios";

import { API_URL } from "../services/api.js";

const PrivateRoute = () => {
  const [status, setStatus] = useState(() =>
    localStorage.getItem("token") ? "checking" : "signed-out"
  );
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return undefined;

    let active = true;
    axios
      .get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        if (active) setStatus("authenticated");
      })
      .catch((error) => {
        if (!active) return;
        if ([401, 404].includes(error.response?.status)) {
          localStorage.removeItem("token");
          setStatus("signed-out");
          return;
        }
        setStatus("unavailable");
      });

    return () => {
      active = false;
    };
  }, [retry]);

  if (status === "signed-out") return <Navigate to="/login" replace />;
  if (status === "authenticated") return <Outlet />;

  if (status === "unavailable") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8f2] px-4 py-10">
        <section className="w-full max-w-md rounded-2xl border border-[#dce3d5] bg-white p-6 text-center shadow-sm">
          <h1 className="font-serif text-2xl font-bold text-[#234b36]">Unable to verify your session</h1>
          <p className="mt-2 text-sm text-[#59685b]">Check that the local server is running, then try again.</p>
          <button
            type="button"
            onClick={() => {
              setStatus("checking");
              setRetry((value) => value + 1);
            }}
            className="mt-5 rounded-xl bg-[#234b36] px-5 py-3 text-sm font-semibold text-white hover:bg-[#597b44]"
          >
            Try Again
          </button>
          <Link to="/login" className="ml-4 text-sm font-semibold text-[#234b36] underline underline-offset-4">
            Sign In
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8f2] px-4 text-sm text-[#59685b]" role="status">
      Checking your session…
    </main>
  );
};

export default PrivateRoute;
