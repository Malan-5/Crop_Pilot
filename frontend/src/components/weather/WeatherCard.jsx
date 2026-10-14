import { Thermometer, Droplets, Wind, CloudRain } from "lucide-react";

function humidityHint(humidity) {
  if (humidity > 90) return "Very humid";
  if (humidity >= 40 && humidity <= 80) return "Moderate humidity";
  return humidity < 40 ? "Low humidity" : "High humidity";
}

const WeatherCard = ({ weather }) => {
  if (!weather?.current) return null;
  const { current } = weather;

  const metrics = [
    {
      icon: Thermometer,
      label: "TEMPERATURE",
      value: `${current.temperature}°C`,
      sub: `Feels like ${current.feelsLike}°C`,
      iconColor: "text-amber-700",
      accentBg: "bg-amber-50/60",
    },
    {
      icon: Droplets,
      label: "HUMIDITY",
      value: `${current.humidity}%`,
      sub: humidityHint(current.humidity),
      iconColor: "text-[#597b44]",
      accentBg: "bg-[#f0f4e9]",
    },
    {
      icon: Wind,
      label: "WIND SPEED",
      value: `${current.windSpeedKmh} km/h`,
      sub: current.windSpeedKmh > 15 ? "Higher drift risk" : "Lower wind speed",
      iconColor: "text-[#283b2c]",
      accentBg: "bg-[#f7f8f2]",
    },
    {
      icon: CloudRain,
      label: "RAIN RISK",
      value: `${current.rainProbability}%`,
      sub: current.rainProbability > 40 ? "Elevated wash-off risk" : "Lower rain chance",
      iconColor: "text-sky-700",
      accentBg: "bg-sky-50/60",
    },
  ];

  return (
    <div className="w-full">
      {/* Current Condition Summary Bar */}
      <div className="mb-6 flex items-start justify-between gap-3 px-1">
        <div className="min-w-0 flex-1">
          <span className="text-[11px] font-bold text-[#597b44] uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#597b44] animate-pulse" />
            Live Field Conditions
          </span>
          <p className="break-words font-serif text-xl sm:text-2xl font-bold text-[#234b36] capitalize mt-0.5">
            {current.description || "Field Weather Station"}
          </p>
        </div>

        {current.icon && (
          <div className="flex shrink-0 items-center gap-1.5 rounded-2xl border border-[#dce3d5] bg-[#f7f8f2] px-2 sm:gap-2 sm:px-3.5 py-1.5">
            <img
              src={`https://openweathermap.org/img/wn/${current.icon}@2x.png`}
              alt={current.description}
              className="w-10 h-10 object-contain"
            />
            <span className="font-bold text-sm text-[#234b36]">
              {current.temperature}°C
            </span>
          </div>
        )}
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {metrics.map(({ icon: Icon, label, value, sub, iconColor, accentBg }) => (
          <div
            key={label}
            className="bg-white border border-[#dce3d5] rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-2xs hover:border-[#a7bb8b] transition-colors"
          >
            <div>
              <div
                className={`w-10 h-10 rounded-xl ${accentBg} border border-[#dce3d5]/80 flex items-center justify-center mb-3`}
              >
                <Icon className={iconColor} size={20} strokeWidth={2} />
              </div>
              <p className="text-[10px] font-bold text-[#59685b] uppercase tracking-wider">
                {label}
              </p>
            </div>

            <div className="mt-3">
              <p className="font-serif text-2xl sm:text-3xl font-bold text-[#234b36] leading-tight">
                {value}
              </p>
              <p className="text-xs text-[#59685b] font-medium mt-1 truncate">
                {sub}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeatherCard;
