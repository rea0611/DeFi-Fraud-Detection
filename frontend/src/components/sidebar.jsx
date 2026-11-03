
import {
  LayoutDashboard, Wallet, ArrowLeftRight,
  ShieldAlert, ChartNoAxesCombined, Bell, Settings,
  ShieldCheck
} from "lucide-react";

const menu = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Wallet Search", icon: Wallet },
  { name: "Transactions", icon: ArrowLeftRight },
  { name: "Risk Analysis", icon: ShieldAlert },
  { name: "Analytics", icon: ChartNoAxesCombined },
  { name: "Alerts", icon: Bell }
];

export default function Sidebar({ active, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon"><ShieldCheck /></div>
        <div>
          <h2>DeFi<span>Guard</span></h2>
          <small>BLOCKCHAIN INTELLIGENCE</small>
        </div>
      </div>

      <p className="menu-label">MAIN MENU</p>

      <nav className="nav-menu">
        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.name}
              className={`nav-item ${active === item.name ? "active" : ""}`}
              onClick={() => onNavigate(item.name)}
            >
              <Icon size={19} />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        <button className="nav-item" onClick={() => onNavigate("Settings")}>
          <Settings size={19} />
          <span>Settings</span>
        </button>

        <div className="sidebar-status">
          <span className="status-dot"></span>
          System Operational
        </div>
      </div>
    </aside>
  );
}
