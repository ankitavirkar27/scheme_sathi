import { useEffect, useMemo, useState } from "react";

function StatCard({
  title,
  value,
  subtitle,
  icon
}) {
  const numericValue = useMemo(() => {
    const match = String(value).match(/[\d,.]+/);
    return match ? Number(match[0].replace(/,/g, "")) : null;
  }, [value]);
  const [displayValue, setDisplayValue] = useState(numericValue === null ? value : "0");

  useEffect(() => {
    if (numericValue === null) {
      return undefined;
    }

    const startedAt = performance.now();
    const duration = 850;
    let frame;
    const tick = (now) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(numericValue * eased);
      const rendered = String(value).replace(/[\d,.]+/, current.toLocaleString("en-IN"));
      setDisplayValue(rendered);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [numericValue, value]);

  return (
    <div className="stat-card animate-in">

      <div className="stat-top">

        <div>
          <p>{title}</p>
          <h2>{numericValue === null ? value : displayValue}</h2>
        </div>

        <div className="stat-icon">
          {icon}
        </div>

      </div>

      <span className="stat-subtitle">
        {subtitle}
      </span>
      <div className="stat-sparkline" aria-hidden="true">
        <i /><i /><i /><i /><i /><i /><i />
      </div>

    </div>
  );
}

export default StatCard;
