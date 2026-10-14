import { useEffect, useState, useCallback } from "react";
import { Calendar, CheckCircle2, Loader2, Clock, AlertCircle } from "lucide-react";

import { API_URL } from "../services/api.js";

const CROP_ICON = {
  tomato: "🍅",
  potato: "🥔",
  chilli: "🌶️",
  chili: "🌶️",
  pepper: "🌶️",
  wheat: "🌾",
  rice: "🌾",
  cotton: "☁️",
  corn: "🌽",
  maize: "🌽",
  onion: "🧅",
  brinjal: "🍆",
  eggplant: "🍆",
  cucumber: "🥒",
  cabbage: "🥬",
  grape: "🍇",
  apple: "🍎",
  banana: "🍌",
  mango: "🥭",
  sugarcane: "🎋",
};

const getCropIcon = (cropName = "") => {
  const key = cropName.toLowerCase();
  const match = Object.keys(CROP_ICON).find((k) => key.includes(k));
  return match ? CROP_ICON[match] : "🌱";
};

const daysUntil = (dateStr) => {
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target - today) / (1000 * 60 * 60 * 24));
};

const StatusPill = ({ days }) => {
  if (days <= 2) {
    return (
      <span className="bg-[#9c7422]/15 text-[#234b36] border border-[#9c7422]/30 text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap">
        Due Soon
      </span>
    );
  }
  return (
    <span className="bg-[#f0f4e9] text-[#597b44] border border-[#a7bb8b]/40 text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap">
      Scheduled
    </span>
  );
};

const SprayRow = ({ item, onMarkDone, isMarking }) => {
  const days = daysUntil(item.date);
  const dateLabel = new Date(item.date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const daysLabel =
    days <= 0 ? "Today" : days === 1 ? "Tomorrow" : `In ${days} Days`;

  return (
    <div className="flex items-start gap-3 py-3.5 border-b border-[#dce3d5] last:border-b-0">
      <div className="w-11 h-11 rounded-2xl bg-[#f7f8f2] border border-[#dce3d5] flex items-center justify-center text-xl shrink-0">
        {getCropIcon(item.cropName)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="font-bold text-[#283b2c] text-sm truncate leading-tight">
            {item.cropName} {item.disease ? `– ${item.disease}` : ""}
          </p>
          <StatusPill days={days} />
        </div>

        {item.pesticide && (
          <p className="text-xs text-[#234b36] font-semibold truncate mt-1">
            {item.pesticide}
          </p>
        )}

        <div className="flex items-center gap-1.5 text-[11px] text-[#59685b] mt-1 font-medium">
          <Calendar size={13} className="text-[#597b44] shrink-0" />
          <span className="truncate">
            {daysLabel} &nbsp;·&nbsp; {dateLabel}
          </span>
        </div>

        <div className="mt-2.5">
          <button
            onClick={() => onMarkDone(item)}
            disabled={isMarking}
            title="Mark this spray as completed in field"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-[#597b44] text-[#234b36] hover:bg-[#f0f4e9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-2xs"
          >
            {isMarking ? (
              <Loader2 size={13} className="animate-spin text-[#597b44]" />
            ) : (
              <CheckCircle2 size={13} className="text-[#597b44]" />
            )}
            <span>Mark Treatment Done</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const UpcomingSpraysCard = ({ token, refreshKey, onTreatmentDone }) => {
  const [items, setItems] = useState([]);
  const [totalPending, setTotalPending] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [markingIds, setMarkingIds] = useState(() => new Set());

  useEffect(() => {
    let ignore = false;
    if (!token) {
      return;
    }

    const loadData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/treatment/upcoming?limit=20`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!ignore) {
          if (!data.success)
            throw new Error(data.error || "Failed to load upcoming sprays");
          setItems(data.upcoming || []);
          setTotalPending(data.total ?? data.upcoming?.length ?? 0);
          setError("");
        }
      } catch (e) {
        if (!ignore) {
          setError(e.message || "Failed to load upcoming sprays");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadData();
    return () => {
      ignore = true;
    };
  }, [token, refreshKey]);

  const handleMarkDone = useCallback(
    async (item) => {
      const key = `${item.treatmentId}-${item.sprayId}`;
      if (markingIds.has(key)) return;

      setMarkingIds((prev) => new Set(prev).add(key));
      try {
        const res = await fetch(
          `${API_URL}/api/treatment/${item.treatmentId}/spray/${item.sprayId}`,
          {
            method: "PATCH",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        if (!data.success) throw new Error(data.error || "Failed to update spray status");

        setItems((prev) =>
          prev.filter((i) => `${i.treatmentId}-${i.sprayId}` !== key)
        );
        setTotalPending((total) => Math.max(0, total - 1));
        if (onTreatmentDone) onTreatmentDone();
      } catch (e) {
        alert(e.message || "Failed to mark treatment as done. Please try again.");
      } finally {
        setMarkingIds((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      }
    },
    [token, markingIds, onTreatmentDone]
  );

  const displayedItems = showAll ? items : items.slice(0, 4);

  return (
    <div className="bg-white rounded-3xl border border-[#dce3d5] shadow-xs p-5 sm:p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-[#dce3d5] mb-2">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-[#597b44]" />
            <h3 className="font-serif text-lg font-bold text-[#234b36]">
              Upcoming Sprays
            </h3>
          </div>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#f7f8f2] border border-[#dce3d5] text-[#234b36]">
            {totalPending} Pending
          </span>
        </div>

        {loading && (
          <div className="py-10 flex flex-col items-center justify-center gap-2 text-[#59685b]">
            <Loader2 className="animate-spin text-[#597b44]" size={24} />
            <span className="text-xs font-medium">Checking spray calendar...</span>
          </div>
        )}

        {error && !loading && (
          <div className="my-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="py-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#f7f8f2] border border-[#dce3d5] flex items-center justify-center mx-auto mb-2 text-[#597b44]">
              <CheckCircle2 size={24} />
            </div>
            <p className="font-bold text-sm text-[#283b2c]">No Sprays Scheduled</p>
            <p className="text-xs text-[#59685b] mt-1 max-w-[200px] mx-auto">
              Scan a crop to add recommended pesticide treatments to your calendar.
            </p>
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="divide-y divide-[#dce3d5]">
            {displayedItems.map((item) => (
              <SprayRow
                key={`${item.treatmentId}-${item.sprayId}`}
                item={item}
                onMarkDone={handleMarkDone}
                isMarking={markingIds.has(`${item.treatmentId}-${item.sprayId}`)}
              />
            ))}
          </div>
        )}
      </div>

      {items.length > 4 && (
        <div className="pt-4 border-t border-[#dce3d5] mt-2">
          <button
            onClick={() => setShowAll((v) => !v)}
            className="w-full text-center text-xs font-bold text-[#234b36] hover:text-[#597b44] transition-colors py-1"
          >
            {showAll ? "Show Less" : `View All (${totalPending}) Sprays`}
          </button>
        </div>
      )}
    </div>
  );
};

export default UpcomingSpraysCard;
