import { DatabaseSync } from 'node:sqlite';
import { randomBytes, randomUUID, scryptSync } from 'node:crypto';
import { existsSync } from 'node:fs';
import { scoreFas, validateLog, validateProfile, localDate } from '../shared/domain.ts';

// Explicitly fictional local demonstration accounts; never overwrite existing users.
if (!existsSync('.local/faro.sqlite')) throw new Error('Start the local FARO server first.');
const db = new DatabaseSync('.local/faro.sqlite');
db.exec('PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;');
const cases = [
  { name: 'Clyde', answers: [2,2,1,4,2,2,1,2,2,4], sleep:8, work:4, stress:3, energy:8 },
  { name: 'Russel', answers: [3,3,2,3,3,3,2,3,3,3], sleep:6.5, work:5, stress:6, energy:5 },
  { name: 'Sebastian', answers: [4,4,3,2,4,4,3,4,4,2], sleep:5.5, work:6, stress:8, energy:3 },
];
const created = [];
try {
  db.exec('BEGIN IMMEDIATE');
  for (const [index, sample] of cases.entries()) {
    const email = `${sample.name.toLowerCase()}.test@faro.local`;
    const id = `local-email:${email}`;
    if (db.prepare('SELECT user_id FROM local_accounts WHERE email=?').get(email)) {
      console.log(`Skipped existing account: ${email}`);
      continue;
    }
    if (db.prepare('SELECT user_id FROM profiles WHERE user_id=?').get(id)) throw new Error(`Existing profile: ${email}`);
    const now = new Date().toISOString();
    const password = randomBytes(15).toString('base64url');
    const salt = randomBytes(16).toString('hex');
    const hash = `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
    const profile = { name:`${sample.name} (Test)`, studentNumber:`TEST-00${index+1}`, college:'CCIT', course:'BS Information Technology', yearLevel:'3', employment:'Part-time (fictional)', sleepGoal:8, studyGoal:2, reminders:false };
    const error = validateProfile(profile);
    if (error) throw new Error(error);
    db.prepare('INSERT INTO local_accounts VALUES (?,?,?,?,?,?)').run(id,email,hash,'student',1,now);
    db.prepare('INSERT INTO profiles VALUES (?,?,?)').run(id,JSON.stringify(profile),now);
    const score = scoreFas(sample.answers);
    if (score === null) throw new Error('Invalid sample FAS answers.');
    db.prepare('INSERT INTO fas_assessments VALUES (?,?,?,?,?)').run(id,randomUUID(),JSON.stringify(sample.answers),score,now);
    for (let day=6; day>=0; day--) {
      const date = new Date(); date.setDate(date.getDate()-day);
      const log = { date:localDate(date), sleep:sample.sleep+(day%2 ? 0.5:0), sleepQ:sample.energy, study:1.5, work:sample.work-(day%3===0 ? 1:0), classes:3, brk:1, exercise:0.5, water:6+day%3, mood:index===0?3:index===1?2:1, stress:sample.stress-(day%2), energy:sample.energy, productivity:7-index, notes:'FICTIONAL TEST DATA for the doctor-panel demonstration. Not a research participant or clinical finding.', updatedAt:now };
      const error = validateLog(log);
      if (error) throw new Error(error);
      db.prepare('INSERT INTO daily_logs VALUES (?,?,?,?)').run(id,log.date,JSON.stringify(log),now);
    }
    db.prepare('INSERT INTO care_consent VALUES (?,?,?)').run(id,1,now);
    db.prepare('INSERT INTO care_audit VALUES (?,?,?,?,?)').run(randomUUID(),'local-test-seeder','fictional-demo-sharing-enabled',id,now);
    created.push({name:profile.name,email,password,fas:score,logs:7});
  }
  db.exec('COMMIT');
  console.log(JSON.stringify(created,null,2));
} catch (error) {
  db.exec('ROLLBACK');
  throw error;
} finally { db.close(); }
