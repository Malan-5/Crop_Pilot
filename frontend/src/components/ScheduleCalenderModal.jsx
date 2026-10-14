// components/ScheduleCalendarModal.jsx
import { useMemo, useState } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { API_URL } from "../services/api.js";
const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const toDateKey = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const ScheduleCalendarModal = ({
  result,
  scanId,
  token,
  onClose,
  onScheduled,
}) => {
  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  const [viewMonth, setViewMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDates, setSelectedDates] = useState(() => new Set());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const monthLabel = viewMonth.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const calendarCells = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const startWeekday = firstOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let day = 1; day <= daysInMonth; day++)
      cells.push(new Date(year, month, day));
    return cells;
  }, [viewMonth]);

  const goPrevMonth = () =>
    setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  const goNextMonth = () =>
    setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));

  const isPast = (date) => date < today;

  const toggleDate = (date) => {
    if (!date || isPast(date)) return;
    const key = toDateKey(date);
    setSelectedDates((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const sortedSelected = Array.from(selectedDates).sort();

  const handleSave = async () => {
    if (sortedSelected.length === 0) {
      setError("Please pick at least one date on the calendar.");
      return;
    }
    if (!scanId) {
      setError("This scan cannot be scheduled (missing scan reference).");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/treatment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ scanId, dates: sortedSelected }),
      });
      const data = await res.json();
      if (!data.success)
        throw new Error(data.error || "Failed to schedule sprays");

      if (onScheduled) onScheduled(data.treatment);
      onClose();
    } catch (e) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs transition-opacity"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col border border-[#dce3d5]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-[#dce3d5] bg-[#f7f8f2] shrink-0">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#234b36]">
              Add Spray to Field Schedule
            </h3>
            <p className="text-xs text-[#59685b] mt-0.5">
              {result?.cropName || "Crop"} &nbsp;·&nbsp;
              <span className="font-semibold text-rose-800">
                {result?.diseaseDetected || "Disease Condition"}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#59685b] hover:text-[#283b2c] hover:bg-white p-2 rounded-xl transition shrink-0 border border-transparent hover:border-[#dce3d5]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {result?.pesticide && (
            <div className="bg-[#fbfcf8] border border-[#dce3d5] rounded-xl px-4 py-3">
              <p className="text-[10px] font-bold text-[#59685b] uppercase tracking-wider mb-0.5">
                Target Treatment
              </p>
              <p className="text-xs sm:text-sm font-bold text-[#234b36]">
                {result.pesticide}
              </p>
            </div>
          )}

          <p className="text-xs text-[#59685b] leading-relaxed">
            Select the dates on the calendar below for your spray applications.
            You can pick single or multiple treatment days.
          </p>

          {/* Calendar View */}
          <div className="border border-[#dce3d5] rounded-2xl p-4 bg-white">
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={goPrevMonth}
                className="p-1.5 rounded-lg hover:bg-[#f7f8f2] text-[#283b2c] border border-transparent hover:border-[#dce3d5] transition"
                aria-label="Previous month"
              >
                <ChevronLeft size={18} />
              </button>
              <p className="font-serif text-base font-bold text-[#234b36]">
                {monthLabel}
              </p>
              <button
                type="button"
                onClick={goNextMonth}
                className="p-1.5 rounded-lg hover:bg-[#f7f8f2] text-[#283b2c] border border-transparent hover:border-[#dce3d5] transition"
                aria-label="Next month"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Weekday Row */}
            <div className="grid grid-cols-7 gap-1 mb-2 text-center">
              {WEEKDAY_LABELS.map((d, i) => (
                <div
                  key={i}
                  className="text-[11px] font-bold text-[#59685b] uppercase"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarCells.map((date, idx) => {
                if (!date) {
                  return <div key={`empty-${idx}`} className="h-9" />;
                }

                const key = toDateKey(date);
                const isSelected = selectedDates.has(key);
                const disabled = isPast(date);
                const isCurrentToday = toDateKey(today) === key;

                return (
                  <button
                    key={key}
                    type="button"
                    disabled={disabled}
                    onClick={() => toggleDate(date)}
                    className={`h-9 w-full rounded-xl text-xs font-semibold flex items-center justify-center transition-all
                      ${
                        isSelected
                          ? "bg-[#234b36] text-white shadow-xs"
                          : disabled
                          ? "text-[#dce3d5] cursor-not-allowed"
                          : isCurrentToday
                          ? "border border-[#234b36] text-[#234b36] hover:bg-[#f7f8f2]"
                          : "text-[#283b2c] hover:bg-[#f7f8f2]"
                      }`}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Count Indicator */}
          <div className="flex items-center justify-between text-xs px-1">
            <span className="text-[#59685b]">
              Selected Days: <strong>{sortedSelected.length}</strong>
            </span>
            {sortedSelected.length > 0 && (
              <span className="text-[#234b36] font-semibold">
                First: {sortedSelected[0]}
              </span>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-[#dce3d5] bg-[#fbfcf8] flex gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 border border-[#dce3d5] hover:bg-white text-[#283b2c] rounded-xl text-xs sm:text-sm font-semibold transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || sortedSelected.length === 0}
            className="flex-1 bg-[#234b36] hover:bg-[#597b44] text-white py-3 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Scheduling...</span>
              </>
            ) : (
              <span>Confirm Schedule</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleCalendarModal;
