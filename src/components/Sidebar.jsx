import { Building2, Calculator, CircleHelp, Handshake, LayoutDashboard, ScanSearch, UserRound, Workflow } from "lucide-react";

function Sidebar({ activePage, setActivePage }) {
  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Scheme Matcher", icon: ScanSearch },
    { name: "Financial Calculator", icon: Calculator },
    { name: "Channel Partners", icon: Handshake },
    { name: "Applications", icon: Building2 },
    { name: "Profile", icon: UserRound },
  ];

  return <aside className="sidebar">
    <div className="logo"><div className="logo-icon">S</div><div><h2>Scheme Sathi</h2><span>Entrepreneur finance</span></div></div>
    <nav className="menu" aria-label="Main navigation"><p className="menu-title">Workspace</p>{menuItems.map(({ name, icon: Icon }) => <button key={name} className={`menu-item ${activePage === name ? "active" : ""}`} onClick={() => setActivePage(name)}><span className="menu-icon"><Icon size={18} strokeWidth={1.8} /></span>{name}</button>)}</nav>
    <div className="sidebar-bottom"><div className="help-card"><div className="help-icon"><CircleHelp size={16} /></div><strong>Need assistance?</strong><p>Get help understanding your financing options.</p><button>Contact support</button></div></div>
  </aside>;
}

export default Sidebar;
