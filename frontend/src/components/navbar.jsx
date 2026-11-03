
import { Search, Bell, ChevronDown } from "lucide-react";

export default function Navbar() {
  return (
    <header className="topbar">
      <div>
        <h3>Overview</h3>
        <p>Monitor your blockchain security</p>
      </div>

      <div className="topbar-right">
        <div className="search-box">
          <Search size={17} />
          <input placeholder="Search anything..." />
        </div>

        <button className="notification">
          <Bell size={20} />
          <span></span>
        </button>

        <div className="profile">
          <div className="avatar">DG</div>
          <div className="profile-info">
            <strong>Admin</strong>
            <small>Security Analyst</small>
          </div>
          <ChevronDown size={16} />
        </div>
      </div>
    </header>
  );
}
