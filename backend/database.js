import dotenv from "dotenv";
dotenv.config({ path: "../.env" });
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url));
const dbFile = process.env.DB_FILE || path.join(here, "../database/healthcare.sqlite");
fs.mkdirSync(path.dirname(dbFile), { recursive: true });
const db = new Database(dbFile); db.pragma("journal_mode = WAL"); db.pragma("foreign_keys = ON");
db.exec(fs.readFileSync(path.join(here, "../database/schema.sql"), "utf8"));
// Migrate databases created by earlier HealthCare+ versions without deleting existing records.
const columns = table => db.prepare(`PRAGMA table_info(${table})`).all().map(c => c.name);
if (!columns("users").includes("phone")) db.exec("ALTER TABLE users ADD COLUMN phone TEXT");
for (const [name, definition] of [["experience","INTEGER NOT NULL DEFAULT 5"],["working_days","TEXT NOT NULL DEFAULT '[1,2,3,4,5]'"],["start_time","TEXT NOT NULL DEFAULT '09:00'"],["end_time","TEXT NOT NULL DEFAULT '17:00'"],["about","TEXT NOT NULL DEFAULT ''"],["image","TEXT NOT NULL DEFAULT ''"]]) if (!columns("doctors").includes(name)) db.exec(`ALTER TABLE doctors ADD COLUMN ${name} ${definition}`);
for (const [name, definition] of [["time","TEXT NOT NULL DEFAULT '09:00'"],["rejection_reason","TEXT"]]) if (!columns("appointments").includes(name)) db.exec(`ALTER TABLE appointments ADD COLUMN ${name} ${definition}`);
const appointmentSql = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='appointments'").get()?.sql || "";
if (!appointmentSql.includes("Approved")) { db.pragma("foreign_keys = OFF"); db.exec(`CREATE TABLE appointments_new (id INTEGER PRIMARY KEY AUTOINCREMENT,patient_id INTEGER NOT NULL,doctor_id INTEGER NOT NULL,date TEXT NOT NULL,time TEXT NOT NULL DEFAULT '09:00',fee INTEGER NOT NULL,status TEXT NOT NULL DEFAULT 'Pending' CHECK(status IN ('Pending','Approved','Rejected','Completed','Cancelled')),rejection_reason TEXT,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,FOREIGN KEY(patient_id) REFERENCES users(id),FOREIGN KEY(doctor_id) REFERENCES doctors(id)); INSERT INTO appointments_new(id,patient_id,doctor_id,date,time,fee,status,rejection_reason,created_at) SELECT id,patient_id,doctor_id,date,time,fee,CASE WHEN status='Confirmed' THEN 'Approved' ELSE status END,rejection_reason,created_at FROM appointments; DROP TABLE appointments; ALTER TABLE appointments_new RENAME TO appointments;`); db.pragma("foreign_keys = ON"); }
const profiles = [
[1,"Dr. Anil Kumar","Cardiologist",800,14,[1,2,3,4,5],"09:00","13:00","Treats heart disease, hypertension, chest pain and rhythm disorders. Provides ECG review, cardiac risk assessment and long-term heart-health guidance."],
[2,"Dr. Priya Sharma","Dermatologist",600,10,[1,2,3,4,5],"13:00","17:00","Specializes in acne, eczema, psoriasis, allergies and hair or nail concerns. Offers skin examinations, treatment planning and preventive skin-care advice."],
[3,"Dr. Rahul Reddy","Pediatrician",500,12,[1,2,3,4,5,6],"09:00","14:00","Provides child healthcare including vaccinations, growth monitoring, infections, nutrition advice and routine developmental assessments."],
[4,"Dr. Sneha Rao","General Physician",400,9,[1,2,3,4,5,6],"10:00","16:00","Manages fever, infections, diabetes, blood pressure and common illnesses. Provides routine check-ups, screening and referrals when specialist care is needed."],
[5,"Dr. Vikram Mehta","Neurologist",900,16,[1,2,3,4,5],"10:00","14:00","Evaluates migraine, epilepsy, stroke-related concerns, nerve pain and movement disorders. Provides neurological assessment and ongoing care plans."],
[6,"Dr. Aisha Khan","Orthopedic Specialist",750,11,[1,2,3,4,5,6],"09:00","13:00","Treats joint pain, fractures, sports injuries, arthritis and back problems. Provides musculoskeletal evaluations, rehabilitation guidance and injury prevention advice."],
[7,"Dr. Meera Iyer","Dentist",450,8,[1,2,3,4,5,6],"14:00","18:00","Provides dental check-ups, cavity care, gum treatment, cleaning and oral hygiene guidance, with a focus on preventive dentistry."],
[8,"Dr. Kavya Nair","Gynecologist",700,13,[1,2,3,4,5],"11:00","16:00","Supports menstrual health, pregnancy-related care, PCOS, menopause and reproductive health through consultations, screening and patient education."],
[9,"Dr. Arjun Patel","Ophthalmologist",650,10,[1,2,3,4,5],"09:00","13:00","Evaluates vision changes, eye infections, dry eyes and common eye conditions. Provides eye examinations, vision assessments and treatment guidance."],
[10,"Dr. Neha Verma","ENT Specialist",600,9,[1,2,3,4,5,6],"14:00","18:00","Treats sinus problems, ear infections, hearing concerns, tonsil and throat conditions. Provides ENT examinations and care recommendations."]
];
const upsert = db.prepare(`INSERT INTO doctors(id,name,specialty,fee,experience,working_days,start_time,end_time,about,image) VALUES(?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,specialty=excluded.specialty,fee=excluded.fee,experience=excluded.experience,working_days=excluded.working_days,start_time=excluded.start_time,end_time=excluded.end_time,about=excluded.about,image=excluded.image`);
for (const p of profiles) upsert.run(p[0],p[1],p[2],p[3],p[4],JSON.stringify(p[5]),p[6],p[7],p[8],`https://i.pravatar.cc/300?img=${p[0]+10}`);
const insertUser = db.prepare("INSERT OR IGNORE INTO users (name,email,password,role,doctor_id) VALUES (?,?,?,?,?)");
insertUser.run("Admin","admin@healthcare.com",bcrypt.hashSync("admin123",10),"admin",null);

for (const p of profiles) {
    insertUser.run(
        p[1],
        p[1].toLowerCase().replace(/[^a-z0-9]/g, "") + "@healthcare.com",
        bcrypt.hashSync("doctor123", 10),
        "doctor",
        p[0]
    );
}

db.exec("CREATE INDEX IF NOT EXISTS idx_appointments_doctor_date ON appointments(doctor_id,date,time)");
try { db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_doctor_slot ON appointments(doctor_id,date,time) WHERE status IN ('Pending','Approved')"); } catch (e) { console.warn("Could not add unique slot index; existing duplicate active bookings need review."); }
export default db;
