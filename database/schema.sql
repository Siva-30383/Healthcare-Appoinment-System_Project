CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('admin','doctor','patient')), doctor_id INTEGER, phone TEXT
);
CREATE TABLE IF NOT EXISTS doctors (
  id INTEGER PRIMARY KEY, name TEXT NOT NULL, specialty TEXT NOT NULL, fee INTEGER NOT NULL,
  experience INTEGER NOT NULL DEFAULT 5, working_days TEXT NOT NULL DEFAULT '[1,2,3,4,5]',
  start_time TEXT NOT NULL DEFAULT '09:00', end_time TEXT NOT NULL DEFAULT '17:00',
  about TEXT NOT NULL DEFAULT '', image TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS appointments (
  id INTEGER PRIMARY KEY AUTOINCREMENT, patient_id INTEGER NOT NULL, doctor_id INTEGER NOT NULL,
  date TEXT NOT NULL, time TEXT NOT NULL DEFAULT '09:00', fee INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK(status IN ('Pending','Approved','Rejected','Completed','Cancelled')),
  rejection_reason TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(patient_id) REFERENCES users(id), FOREIGN KEY(doctor_id) REFERENCES doctors(id)
);
