import { Router } from "express"; import db from "../database.js"; import { requireAuth } from "../middleware/auth.js";
const router=Router();
router.get("/",requireAuth,(req,res)=>{const search=String(req.query.search||"").trim();const doctors=db.prepare(`SELECT id,name,specialty,fee,experience,working_days AS workingDays,start_time AS startTime,end_time AS endTime,about,image FROM doctors WHERE name LIKE ? OR specialty LIKE ? ORDER BY id`).all(`%${search}%`,`%${search}%`).map(d=>({...d,workingDays:JSON.parse(d.workingDays)}));res.json({doctors});});
export default router;
