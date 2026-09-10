import { Bell, Languages, LogOut, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

function Navbar({ user, onLogout }) {
  const userName = user.displayName || user.email?.split("@")[0] || "User";
  const [dark, setDark] = useState(() => localStorage.getItem("scheme-sathi-theme") === "dark");
  useEffect(() => { document.documentElement.dataset.theme = dark ? "dark" : "light"; localStorage.setItem("scheme-sathi-theme", dark ? "dark" : "light"); }, [dark]);

  return <header className="navbar">
    <div><p className="navbar-kicker">Workspace</p><h2>Scheme Sathi</h2></div>
    <div className="navbar-right">
      <button className="icon-button" onClick={() => setDark((current) => !current)} aria-label="Toggle colour theme">{dark ? <Sun size={17} /> : <Moon size={17} />}</button>
      <button className="language-btn"><Languages size={15} /> हिंदी / English</button>
      <button className="icon-button notification" aria-label="Notifications"><Bell size={18} /></button>
      <div className="user-mini"><div className="avatar">{userName.charAt(0).toUpperCase()}</div><div><strong>{userName}</strong></div></div>
      <button className="logout-btn" onClick={onLogout}><LogOut size={15} /> <span>Logout</span></button>
    </div>
  </header>;
}

export default Navbar;
