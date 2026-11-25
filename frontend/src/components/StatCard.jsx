export default function StatCard({ label, value }) {
  return <article className="stat"><span>{label}</span><b>{value}</b></article>;
}
