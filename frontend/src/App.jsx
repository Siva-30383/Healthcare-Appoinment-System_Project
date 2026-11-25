import { useEffect, useState } from "react";
import Header from "./components/Header.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import PatientDashboard from "./pages/PatientDashboard.jsx";
import DoctorDashboard from "./pages/DoctorDashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import { apiRequest } from "./api.js";

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("healthcareUser") || "null"); } catch { return null; }
  });
  const [notice, setNotice] = useState(null);
  const [checking, setChecking] = useState(Boolean(localStorage.getItem("healthcareToken")));

  // Validate a saved token when the app opens, so an expired session is not trusted.
  useEffect(() => {
    if (!localStorage.getItem("healthcareToken")) { setChecking(false); return; }
    apiRequest("/appointments").catch(() => logout()).finally(() => setChecking(false));
  }, []);

  function notify(message, type = "success") {
    setNotice({ message, type });
    window.setTimeout(() => setNotice(null), 3500);
  }
  async function login(credentials) {
    const result = await apiRequest("/auth/login", { method: "POST", body: JSON.stringify(credentials) });
    saveSession(result); return result;
  }
  async function signup(details) {
    const result = await apiRequest("/auth/signup", { method: "POST", body: JSON.stringify(details) });
    saveSession(result); return result;
  }
  function saveSession(result) {
    localStorage.setItem("healthcareToken", result.token);
    localStorage.setItem("healthcareUser", JSON.stringify(result.user));
    setUser(result.user);
  }
  function logout() {
    localStorage.removeItem("healthcareToken");
    localStorage.removeItem("healthcareUser");
    setUser(null);
  }
  async function api(path, options) { return apiRequest(path, options); }

  if (checking) return <div className="loading-screen">Checking your secure session...</div>;
  let page = !user ? <AuthPage onLogin={login} onSignup={signup}/> :
    user.role === "patient" ? <PatientDashboard user={user} api={api} notify={notify}/> :
    user.role === "doctor" ? <DoctorDashboard user={user} api={api} notify={notify}/> :
    user.role === "admin" ? <AdminDashboard api={api} notify={notify}/> :
    <AuthPage onLogin={login} onSignup={signup}/>;

  return <><Header user={user} onLogout={logout}/>{notice && <div className={`toast ${notice.type}`} role="status">{notice.message}</div>}{page}<footer>HealthCare+ · Your care, organized.</footer></>;
}
