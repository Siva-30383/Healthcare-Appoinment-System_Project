import { useState } from "react";

export default function AuthPage({ onLogin, onSignup }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault(); setMessage(""); setLoading(true);
    try {
      const result = mode === "login"
        ? await onLogin({ email: form.email, password: form.password })
        : await onSignup(form);
      if (mode === "signup") setMessage("Account created. You are now logged in.");
    } catch (error) { setMessage(error.message); }
    finally { setLoading(false); }
  }
  function switchMode(next) { setMode(next); setMessage(""); }

  return <main className="auth-layout">
    <section className="intro">
      <p className="eyebrow">YOUR HEALTH, ONE STEP CLOSER</p>
      <h1>Book care.<br/><span>Feel better.</span></h1>
      <p>Find a doctor, book appointments and manage your visits in one simple place.</p>
      <div className="feature-row"><span>✓ Find doctors</span><span>✓ Manage visits</span><span>✓ Secure accounts</span></div>
    </section>
    <section className="panel auth-panel">
      <div className="tabs">
        <button type="button" className={`tab ${mode === "login" ? "active" : ""}`} onClick={() => switchMode("login")}>Login</button>
        <button type="button" className={`tab ${mode === "signup" ? "active" : ""}`} onClick={() => switchMode("signup")}>Create account</button>
      </div>
      <form onSubmit={submit}>
        <h2>{mode === "login" ? "Welcome back" : "Create your account"}</h2>
        {mode === "signup" && <label>Full name<input required minLength="2" maxLength="80" placeholder="Your name" value={form.name} onChange={e => setForm({...form,name:e.target.value})}/></label>}
        {mode === "signup" && <label>Phone number<input type="tel" placeholder="Your phone number" value={form.phone} onChange={e => setForm({...form,phone:e.target.value})}/></label>}
        <label>Email<input type="email" required placeholder="you@example.com" value={form.email} onChange={e => setForm({...form,email:e.target.value})}/></label>
        <label>Password<input type="password" required minLength={mode === "signup" ? 6 : 1} placeholder={mode === "signup" ? "At least 6 characters" : "Your password"} value={form.password} onChange={e => setForm({...form,password:e.target.value})}/></label>
        <button className="button primary" type="submit" disabled={loading}>{loading ? "Please wait..." : mode === "login" ? "Login" : "Sign up"}</button>
      </form>
      <p className="message" role="status">{message}</p>
      <div className="demo"><b>Demo accounts</b><br/>Admin: admin@healthcare.com / admin123<br/>Doctor: doctor@healthcare.com / doctor123<br/><small>Patients can create an account above.</small></div>
    </section>
  </main>;
}
