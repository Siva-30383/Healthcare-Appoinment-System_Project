export default function AppointmentCard({ appointment, children }) {
  const timeLabel = appointment.time ? new Date(`2000-01-01T${appointment.time}:00`).toLocaleTimeString("en-IN",{hour:"numeric",minute:"2-digit",hour12:true}) : "Time not set";
  const dateLabel = appointment.date ? appointment.date.split("-").reverse().join("-") : "";
  return <article className="appointment"><div><b>{appointment.doctor}</b><p>{appointment.patient || "You"} · {dateLabel} · {timeLabel} · ₹{appointment.fee}</p>{appointment.patientEmail && <p>{appointment.patientEmail}{appointment.patientPhone ? ` · ${appointment.patientPhone}` : ""}</p>}{appointment.rejectionReason && <p className="reason"><b>Rejection reason:</b> {appointment.rejectionReason}</p>}</div><div className="actions"><span className={`status ${appointment.status}`}>{appointment.status}</span>{children}</div></article>;
}
