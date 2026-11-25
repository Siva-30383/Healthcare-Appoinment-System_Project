export default function Welcome({ eyebrow, title, description, icon }) {
  return <section className="welcome">
    <div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p></div>
    <div className="welcome-icon" aria-hidden="true">{icon}</div>
  </section>;
}
