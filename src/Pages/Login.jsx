import { Component, lazy, Suspense, useEffect, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, LockKeyhole, Mail, UserRound } from "lucide-react";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { loginUser, registerUser, sendResetLink } from "../firebase/auth";

const Spline = lazy(() => import("@splinetool/react-spline"));

class SplineErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error) { console.warn("Spline scene disabled after a loading error:", error); }
  render() { return this.state.hasError ? this.props.fallback : this.props.children; }
}

function SplineFallback() {
  return <div className="spline-fallback" aria-hidden="true"><div className="spline-fallback-orb" /></div>;
}

function Login({ onLogin, splineSceneUrl = "" }) {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const splineRef = useRef(null);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const isValidSplineScene = /^https:\/\/prod\.spline\.design\/.+\/scene\.splinecode(?:\?.*)?$/.test(splineSceneUrl);
  // Spline is deliberately opt-in: the authentication experience must never depend on 3D.
  const shouldEnableSpline = import.meta.env.VITE_ENABLE_SPLINE === "true";

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 751px)");
    const updateDesktop = () => setIsDesktop(desktopQuery.matches);
    updateDesktop(); desktopQuery.addEventListener("change", updateDesktop);
    return () => desktopQuery.removeEventListener("change", updateDesktop);
  }, []);
  useEffect(() => {
    if (!splineRef.current || !isDesktop) return undefined;
    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting), { rootMargin: "120px" });
    observer.observe(splineRef.current);
    return () => observer.disconnect();
  }, [isDesktop]);

  const handleChange = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const handleSubmit = async (event) => {
    event.preventDefault(); setError(""); setMessage("");
    if (!form.email || !form.password) return setError("Please fill in all required fields.");
    if (isRegister && !form.name) return setError("Please enter your name.");
    setLoading(true);
    try { const result = isRegister ? await registerUser({ name: form.name, email: form.email, password: form.password }) : await loginUser({ email: form.email, password: form.password }); onLogin(result); }
    catch (authError) { setError(authError.message || getAuthErrorMessage("auth/unknown")); } finally { setLoading(false); }
  };
  const handleGoogleLogin = async () => {
    setError(""); setMessage(""); setLoading(true);
    try { const provider = new GoogleAuthProvider(); provider.setCustomParameters({ prompt: "select_account" }); const result = await signInWithPopup(auth, provider); onLogin(result.user); }
    catch (authError) { setError(getAuthErrorMessage(authError?.code) || authError?.message || "Google sign-in failed."); } finally { setLoading(false); }
  };
  const handlePasswordReset = async (event) => { event.preventDefault(); setError(""); setMessage(""); if (!form.email) return setError("Enter your email address first."); try { await sendResetLink(form.email); setMessage("Password reset email sent. Check your inbox."); } catch (authError) { setError(authError.message || getAuthErrorMessage("auth/unknown")); } };

  const canMountSpline = shouldEnableSpline && isDesktop && isVisible && isValidSplineScene;
  return <div className="auth-page">
    <section className="auth-aside" ref={splineRef} aria-hidden="true">
      <SplineFallback />
      {canMountSpline && <SplineErrorBoundary fallback={<SplineFallback />}><Suspense fallback={<SplineFallback />}><Spline scene={splineSceneUrl} className="auth-spline" renderOnDemand /></Suspense></SplineErrorBoundary>}
      <div className="auth-aside-copy"><span className="auth-overline">Scheme Sathi</span><h1>Financing, made more navigable.</h1><p>Understand relevant support options and move forward with clarity.</p></div>
    </section>
    <main className="auth-panel"><div className="auth-card">
      <div className="auth-logo"><div className="logo-icon">S</div><div><h2>Scheme Sathi</h2><span>Entrepreneur finance</span></div></div>
      <div className="auth-heading"><p className="eyebrow">Secure access</p><h1>{isRegister ? "Create your account" : "Welcome back"}</h1><p>{isRegister ? "Set up your profile to explore relevant financing options." : "Sign in to continue where you left off."}</p></div>
      <form onSubmit={handleSubmit}>
        {isRegister && <div className="form-group"><label>Full name</label><div className="field-with-icon"><UserRound size={16} /><input type="text" name="name" placeholder="Enter your name" value={form.name} onChange={handleChange} /></div></div>}
        <div className="form-group"><label>Email address</label><div className="field-with-icon"><Mail size={16} /><input type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} /></div></div>
        <div className="form-group"><label>Password</label><div className="field-with-icon"><LockKeyhole size={16} /><input type="password" name="password" placeholder="Enter your password" value={form.password} onChange={handleChange} /></div></div>
        {!isRegister && <div className="auth-forgot"><a href="#forgot-password" onClick={handlePasswordReset}>Forgot password?</a></div>}
        {error && <p className="auth-message error">{error}</p>}{message && <p className="auth-message success">{message}</p>}
        <button type="submit" className="primary-button full" disabled={loading}>{loading ? "Please wait..." : <>{isRegister ? "Create account" : "Log in"}<ArrowRight size={16} /></>}</button>
      </form>
      {!isRegister && <><div className="auth-divider"><span>or continue with</span></div><button type="button" className="google-button" onClick={handleGoogleLogin} disabled={loading}><span className="google-icon">G</span>Continue with Google</button></>}
      <p className="auth-switch">{isRegister ? <>Already have an account? <button type="button" onClick={() => setIsRegister(false)}>Log in</button></> : <>New to Scheme Sathi? <button type="button" onClick={() => setIsRegister(true)}>Create an account</button></>}</p>
      <p className="auth-note"><CheckCircle2 size={14} /> Your information is used to improve relevance.</p>
    </div></main>
  </div>;
}

function getAuthErrorMessage(code) { const messages = { "auth/email-already-in-use": "An account with this email already exists.", "auth/invalid-credential": "Invalid email or password.", "auth/invalid-email": "Enter a valid email address.", "auth/weak-password": "Password must be at least 6 characters.", "auth/user-disabled": "This account has been disabled.", "auth/user-not-found": "No account was found with this email.", "auth/popup-blocked": "Google sign-in was blocked by the browser. Please allow popups and try again.", "auth/popup-closed-by-user": "Google sign-in was cancelled.", "auth/unauthorized-domain": "This domain is not authorized in Firebase. Add localhost as an authorized domain.", "auth/operation-not-allowed": "Google sign-in is not enabled in Firebase Authentication.", "auth/account-exists-with-different-credential": "An account already exists with a different sign-in method.", "auth/too-many-requests": "Too many sign-in attempts. Please wait a moment and try again.", "auth/network-request-failed": "Network connection failed. Check your internet and try again." }; return messages[code] || "Authentication failed. Please try again."; }

export default Login; 
