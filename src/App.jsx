import { Component, lazy, Suspense, useEffect, useState } from "react";
import { BriefcaseBusiness, LoaderCircle } from "lucide-react";
import Navbar from "./Components/Navbar";
import Sidebar from "./Components/Sidebar";

const Login = lazy(() => import("./Pages/Login"));
const Dashboard = lazy(() => import("./Pages/Dashboard"));
const SchemeMatcher = lazy(() => import("./Pages/SchemeMatcher"));
const Calculator = lazy(() => import("./Pages/Calculator"));
const Partners = lazy(() => import("./Pages/Partners"));
const Profile = lazy(() => import("./Pages/Profile"));
const Applications = lazy(() => import("./Pages/Applications"));
const SchemeDetails = lazy(() => import("./Pages/SchemeDetails"));
const authModulePromise = import("./firebase/auth");

const PageLoader = () => <div className="app-loader"><LoaderCircle size={28} /><p>Loading workspace</p></div>;
const AuthLoadingScreen = () => <div className="auth-loading-screen"><BriefcaseBusiness size={30} /><h1>Scheme Sathi</h1><p>Preparing your workspace</p></div>;

class SectionErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { failed: false, errorMessage: "" }; }
  static getDerivedStateFromError(error) { return { failed: true, errorMessage: error?.message || "Unknown page error" }; }
  componentDidCatch(error) { console.error("Section render error:", error); }
  render() {
    if (this.state.failed) return <section className="section-error"><p className="eyebrow">Temporary issue</p><h2>This section could not load.</h2><p>Use the navigation to continue, or refresh this page.</p><details><summary>Technical details</summary><code>{this.state.errorMessage}</code></details><button className="primary-button" onClick={() => window.location.reload()}>Refresh page</button></section>;
    return this.props.children;
  }
}

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activePage, setActivePage] = useState("Dashboard");
  const [selectedScheme, setSelectedScheme] = useState(null);
  useEffect(() => {
    const cachedAuth = localStorage.getItem("scheme_sathi_auth_cache");
    if (cachedAuth) try { const parsed = JSON.parse(cachedAuth); if (parsed?.uid) setUser(parsed); } catch { localStorage.removeItem("scheme_sathi_auth_cache"); }
    setAuthLoading(false);
    let unsubscribe = () => {};
    let isActive = true;
    authModulePromise.then(({ onAuthStateChanged }) => {
      if (!isActive) return;
      unsubscribe = onAuthStateChanged((currentUser) => { setUser(currentUser); if (currentUser) localStorage.setItem("scheme_sathi_auth_cache", JSON.stringify({ uid: currentUser.uid, email: currentUser.email, displayName: currentUser.displayName, photoURL: currentUser.photoURL })); else localStorage.removeItem("scheme_sathi_auth_cache"); setAuthLoading(false); });
    });
    return () => { isActive = false; unsubscribe(); };
  }, []);

  const navigate = (page) => { setActivePage(page); setSelectedScheme(null); };
  if (authLoading) return <AuthLoadingScreen />;
  if (!user) return <SectionErrorBoundary><Suspense fallback={<PageLoader />}><Login onLogin={setUser} splineSceneUrl={import.meta.env.VITE_SPLINE_SCENE_URL || ""} /></Suspense></SectionErrorBoundary>;
  const content = selectedScheme ? <SchemeDetails scheme={selectedScheme} onBack={() => setSelectedScheme(null)} user={user} /> : activePage === "Dashboard" ? <Dashboard user={user} onViewScheme={setSelectedScheme} onNavigate={navigate} /> : activePage === "Scheme Matcher" ? <SchemeMatcher user={user} /> : activePage === "Financial Calculator" ? <Calculator /> : activePage === "Channel Partners" ? <Partners user={user} /> : activePage === "Applications" ? <Applications user={user} /> : <Profile user={user} />;

  return <div className="app"><Sidebar activePage={activePage} setActivePage={navigate} /><div className="main-area"><Navbar user={user} onLogout={async () => { const { logoutUser } = await authModulePromise; await logoutUser(); setUser(null); }} /><main className="content"><SectionErrorBoundary><Suspense fallback={<PageLoader />}>{content}</Suspense></SectionErrorBoundary></main></div></div>;
}

export default App;
