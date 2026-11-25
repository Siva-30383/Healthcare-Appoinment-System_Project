export default function Header({ user, onLogout }) {
  return <header className="topbar">
    <div className="brand">✚ HealthCare<span>+</span></div>
    <nav>
      {user ? <>
        <span className="user-label">{user.name} · {user.role}</span>
        <button className="button light" onClick={onLogout}>Logout</button>
      </> : <span>Simple care, made easier</span>}
    </nav>
  </header>;
}
