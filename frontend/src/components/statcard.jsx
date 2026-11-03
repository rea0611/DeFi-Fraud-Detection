
import { ArrowUpRight } from "lucide-react";

export default function StatCard({
  title, value, change, icon: Icon, color
}) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <div className={`stat-icon ${color}`}>
          <Icon size={22} />
        </div>
        <span className="stat-change">
          <ArrowUpRight size={14} />
          {change}
        </span>
      </div>

      <p>{title}</p>
      <h2>{value}</h2>
      <small>Compared to previous period</small>
    </div>
  );
}
