
import { useState } from "react";

import {
  Menu,
  X,
  ShieldCheck,
  Settings as SettingsIcon
} from "lucide-react";

// PAGE IMPORTS
import Dashboard from "./pages/dashboard.jsx";
import WalletSearch from "./pages/walletsearch.jsx";
import Transactions from "./pages/transactions.jsx";
import RiskAnalysis from "./pages/riskanalysis.jsx";
import Analytics from "./pages/analytics.jsx";
import Alerts from "./pages/alerts.jsx";
import Settings from "./pages/settings.jsx";

// COMPONENT IMPORTS
import Sidebar from "./components/sidebar.jsx";
import Navbar from "./components/navbar.jsx";

// CSS
import "./app.css";


export default function App() {

  const [active, setActive] = useState("Dashboard");
  const [mobileMenu, setMobileMenu] = useState(false);

  // NAVIGATION FUNCTION
  const navigateTo = (page) => {
    setActive(page);
    setMobileMenu(false);
  };

  // CLOSE MOBILE MENU
  const closeMobileMenu = () => {
    setMobileMenu(false);
  };

  // PAGE RENDERING
  const renderPage = () => {

    switch (active) {

      case "Dashboard":
        return <Dashboard />;

      case "Wallet Search":
        return <WalletSearch />;

      case "Transactions":
        return <Transactions />;

      case "Risk Analysis":
        return <RiskAnalysis />;

      case "Analytics":
        return <Analytics />;

      case "Alerts":
        return <Alerts />;

      case "Settings":
        return <Settings />;

      default:
        return <Dashboard />;
    }

  };


  return (

    <div className="app-layout">

      {/* MOBILE OVERLAY */}

      {mobileMenu && (
        <div
          className="mobile-overlay"
          onClick={closeMobileMenu}
        />
      )}


      {/* SIDEBAR */}

      <aside
        className={`sidebar-wrapper ${
          mobileMenu ? "mobile-open" : ""
        }`}
      >

        <Sidebar
          active={active}
          onNavigate={navigateTo}
        />

      </aside>


      {/* MAIN CONTENT */}

      <main className="main-area">


        {/* MOBILE HEADER */}

        <header className="mobile-header">

          <button
            className="mobile-menu-button"
            onClick={() => setMobileMenu(!mobileMenu)}
            aria-label="Toggle navigation"
          >

            {mobileMenu ? (
              <X size={23} />
            ) : (
              <Menu size={23} />
            )}

          </button>


          <div className="mobile-brand">

            <ShieldCheck size={22} />

            DeFi<span>Guard</span>

          </div>

        </header>


        {/* NAVBAR */}

        <Navbar />


        {/* DYNAMIC PAGE CONTENT */}

        <section className="page-content" key={active}>

          <div className="page-transition">

            {renderPage()}

          </div>

        </section>


      </main>

    </div>

  );

}


// REUSABLE COMING SOON COMPONENT

export function ComingSoon({
  title,
  description,
  icon: Icon = SettingsIcon
}) {

  return (

    <div className="coming-soon-page">

      <div className="coming-soon-icon">

        <Icon size={38} />

      </div>


      <span className="eyebrow">
        DEFIGUARD INTELLIGENCE
      </span>


      <h1>{title}</h1>


      <p>
        {description ||
          "This module is currently under development. Stay tuned for upcoming features!"}
      </p>


      <div className="coming-soon-badge">

        <span className="status-dot"></span>

        Module under development

      </div>

    </div>

  );

}


