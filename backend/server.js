const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { Pool } = require('pg');
const crypto = require('crypto');

dotenv.config();

const nodemailer = require('nodemailer');

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || null,
    pass: process.env.SMTP_PASS || null
  }
});

async function sendOtpEmail(toEmail, otpCode, type = 'signup') {
  const fs = require('fs');
  const path = require('path');

  const subject = type === 'signup' 
    ? 'Verify Your SYG ESPORTS Account' 
    : 'Verify Your SYG ESPORTS Tournament Slot';
    
  const titleText = type === 'signup'
    ? 'Welcome to SYG ESPORTS!'
    : 'Confirm Your Tournament Slot';
    
  const descText = type === 'signup'
    ? 'Please use the verification OTP code below to activate your player profile account.'
    : 'Please use the verification OTP code below to confirm your team roster slot in the tournament.';

  const logoPath = path.join(__dirname, '..', 'frontend', 'public', 'syg_logo.jpg');
  const hasLogo = fs.existsSync(logoPath);
  const attachments = [];
  let logoImgHtml = '';

  if (hasLogo) {
    attachments.push({
      filename: 'syg_logo.jpg',
      path: logoPath,
      cid: 'syglogo'
    });
    logoImgHtml = `<img src="cid:syglogo" alt="SYG ESPORTS" style="height: 50px; border-radius: 6px; margin-bottom: 10px;" />`;
  } else {
    logoImgHtml = `<h2 style="color: #ff4e50; font-family: 'Rajdhani', sans-serif; text-transform: uppercase; margin: 0; font-size: 28px; letter-spacing: 1.5px;">SYG ESPORTS</h2>`;
  }

  const htmlContent = `
    <div style="font-family: 'Inter', sans-serif; background: #0b0c10; color: #c5c6c7; padding: 30px; border-radius: 12px; max-width: 500px; margin: auto; border: 1px solid #1f2833;">
      <div style="text-align: center; margin-bottom: 20px;">
        ${logoImgHtml}
        <div style="font-size: 11px; color: #66fcf1; text-transform: uppercase; font-weight: 700; letter-spacing: 2px; margin-top: 4px;">Lobby Verification System</div>
      </div>
      <div style="background: #1f2833; padding: 24px; border-radius: 8px; border-left: 4px solid #ff4e50;">
        <h4 style="color: #ffffff; margin-top: 0; font-size: 16px;">${titleText}</h4>
        <p style="font-size: 13.5px; line-height: 1.5; color: #c5c6c7;">${descText}</p>
        <div style="text-align: center; margin: 24px 0 10px;">
          <span style="font-size: 32px; font-weight: 700; color: #ff4e50; font-family: 'JetBrains Mono', monospace; letter-spacing: 4px; border: 2px dashed #ff4e50; padding: 8px 24px; border-radius: 6px; background: #0b0c10; display: inline-block;">
            ${otpCode}
          </span>
        </div>
        <p style="font-size: 11px; color: #45f3ff; text-align: center; margin-top: 14px;">This code will expire shortly. Do not share this OTP with anyone.</p>
      </div>
      <div style="text-align: center; margin-top: 24px; font-size: 11px; color: #888888;">
        © ${new Date().getFullYear()} SYG ESPORTS. All rights reserved.
      </div>
    </div>
  `;

  const isSmtpConfigured = process.env.SMTP_USER && process.env.SMTP_PASS;

  if (isSmtpConfigured) {
    try {
      await transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME || 'SYG ESPORTS'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
        to: toEmail,
        subject: subject,
        html: htmlContent,
        attachments: attachments
      });
      console.log(`[SMTP] Verification email sent to: ${toEmail}`);
    } catch (err) {
      console.error('[SMTP] Failed to send email via SMTP, falling back to console log:', err.message);
      logConsoleEmail(toEmail, otpCode, subject);
    }
  } else {
    logConsoleEmail(toEmail, otpCode, subject);
  }
}

function logConsoleEmail(toEmail, otpCode, subject) {
  console.log('\n┌────────────────────────────────────────────────────────┐');
  console.log(`│ 📧 SIMULATED EMAIL SENT TO: \x1b[36m${toEmail.padEnd(27)}\x1b[0m │`);
  console.log(`│ SUBJECT: \x1b[32m${subject.padEnd(45)}\x1b[0m │`);
  console.log(`│ OTP CODE: \x1b[31m\x1b[1m${otpCode}\x1b[0m (Check this code to verify!)            │`);
  console.log('└────────────────────────────────────────────────────────┘\n');
}

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize PostgreSQL Connection Pool
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("FATAL ERROR: DATABASE_URL is not set in environment variables!");
}

const pool = new Pool({
  connectionString: connectionString,
  ssl: connectionString && (connectionString.includes('localhost') || connectionString.includes('127.0.0.1')) ? false : {
    rejectUnauthorized: false
  }
});

// Convert SQLite "?" placeholders to PostgreSQL "$1", "$2" etc.
function convertSql(sql) {
  let index = 1;
  return sql.replace(/\?/g, () => `$${index++}`);
}

// better-sqlite3 compatibility layer mapping to PostgreSQL
const db = {
  prepare(sql) {
    const pgSql = convertSql(sql);
    return {
      async get(...params) {
        const flattened = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
        const res = await pool.query(pgSql, flattened);
        return res.rows[0] || null;
      },
      async all(...params) {
        const flattened = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
        const res = await pool.query(pgSql, flattened);
        return res.rows;
      },
      async run(...params) {
        const flattened = params.length === 1 && Array.isArray(params[0]) ? params[0] : params;
        const res = await pool.query(pgSql, flattened);
        return {
          lastInsertRowid: res.rows[0] ? (res.rows[0].id || res.rows[0].lastinsertrowid) : null,
          rowCount: res.rowCount
        };
      }
    };
  },
  async exec(sql) {
    return await pool.query(sql);
  }
};

app.use(cors());
app.use(express.json());

function getCookie(req, name) {
  const cookieHeader = req.headers.cookie || '';
  const cookie = cookieHeader.split(';').map(c => c.trim()).find(c => c.startsWith(`${name}=`));
  return cookie ? decodeURIComponent(cookie.slice(name.length + 1)) : null;
}

async function getUserIdFromSession(req) {
  const token = getCookie(req, 'ghostline-session');
  if (!token) return null;
  
  try {
    const session = await db.prepare('SELECT user_id, expires_at FROM sessions WHERE token = ?').get(token);
    if (!session) return null;
    if (new Date(session.expires_at) < new Date()) {
      await db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
      return null;
    }
    return session.user_id;
  } catch (err) {
    console.error('Session lookup failed', err);
    return null;
  }
}

async function getLoggedInUser(req) {
  const userId = await getUserIdFromSession(req);
  if (!userId) return null;
  return await db.prepare('SELECT id, email, role, ign, uid, phone, discord, avatar FROM users WHERE id = ?').get(userId);
}

async function isAdminAuthed(req) {
  const user = await getLoggedInUser(req);
  return user && user.role === 'admin';
}

const frontendBuildPath = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendBuildPath));

const adminUsername = process.env.ADMIN_USERNAME || 'ghostline';
const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

async function initDb() {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS tournaments (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      mode TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      prize INTEGER NOT NULL DEFAULT 0,
      fee INTEGER NOT NULL DEFAULT 0,
      slots_total INTEGER NOT NULL DEFAULT 0,
      slots_filled INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'Open',
      deadline TEXT NOT NULL DEFAULT '',
      room_id TEXT DEFAULT '',
      room_pass TEXT DEFAULT '',
      room_notes TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      ign TEXT DEFAULT '',
      uid TEXT,
      phone TEXT DEFAULT '',
      discord TEXT DEFAULT '',
      avatar TEXT DEFAULT '',
      verified INTEGER DEFAULT 1,
      otp_code TEXT DEFAULT '',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS registrations (
      id SERIAL PRIMARY KEY,
      reg_id TEXT UNIQUE NOT NULL,
      tournament_id TEXT NOT NULL,
      tournament_title TEXT NOT NULL,
      mode TEXT NOT NULL,
      team_name TEXT NOT NULL,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      discord TEXT,
      players_json TEXT NOT NULL,
      otp TEXT,
      verified INTEGER NOT NULL DEFAULT 0,
      user_id INTEGER,
      slot_number INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS match_results (
      id SERIAL PRIMARY KEY,
      tournament_id TEXT NOT NULL,
      player_uid TEXT NOT NULL,
      player_ign TEXT NOT NULL,
      team_name TEXT,
      placement INTEGER NOT NULL,
      kills INTEGER NOT NULL DEFAULT 0,
      points INTEGER NOT NULL DEFAULT 0,
      prize_won INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS contacts (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      resolved INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Migrations for existing DB tables:
  const alterStatements = [
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS ign TEXT DEFAULT ''",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS uid TEXT",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT DEFAULT ''",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS discord TEXT DEFAULT ''",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT DEFAULT ''",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS verified INTEGER DEFAULT 1",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_code TEXT DEFAULT ''",
    "ALTER TABLE registrations ADD COLUMN IF NOT EXISTS user_id INTEGER",
    "ALTER TABLE registrations ADD COLUMN IF NOT EXISTS slot_number INTEGER DEFAULT 0",
    "ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS room_id TEXT DEFAULT ''",
    "ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS room_pass TEXT DEFAULT ''",
    "ALTER TABLE tournaments ADD COLUMN IF NOT EXISTS room_notes TEXT DEFAULT ''"
  ];
  for (const statement of alterStatements) {
    try { await db.exec(statement); } catch (e) {}
  }

  const existingAdmin = await db.prepare('SELECT id FROM users WHERE role = ?').get('admin');
  if (!existingAdmin) {
    await db.prepare('INSERT INTO users (email, password, role) VALUES (?, ?, ?)').run(adminUsername, adminPassword, 'admin');
  }
}

app.get('/api/health', (req, res) => res.json({ ok: true }));

// ================= AUTHENTICATION APIs =================

// Auth API - Sign Up
app.post('/api/auth/signup', async (req, res) => {
  const { email, password, ign, uid, phone, discord } = req.body;
  if (!email || !password || !ign || !uid) {
    return res.status(400).json({ error: 'Email, Password, IGN, and UID are required' });
  }

  try {
    // Check if email already exists
    const emailExists = await db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (emailExists) return res.status(400).json({ error: 'Email is already registered' });

    // Check if FF UID already exists
    const uidExists = await db.prepare('SELECT id FROM users WHERE uid = ?').get(uid);
    if (uidExists) return res.status(400).json({ error: 'Free Fire UID is already registered' });

    // Insert user (verified immediately)
    const info = await db.prepare(`
      INSERT INTO users (email, password, role, ign, uid, phone, discord, verified, otp_code)
      VALUES (?, ?, 'user', ?, ?, ?, ?, 1, '')
      RETURNING id
    `).run(email, password, ign, uid, phone || '', discord || '');

    const userId = info.lastInsertRowid;

    // Create session immediately
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    await db.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)').run(token, userId, expiresAt);

    res.setHeader('Set-Cookie', [
      `ghostline-session=${token}; Path=/; Max-Age=604800; SameSite=Lax; HttpOnly`,
      `ghostline-admin=false; Path=/; Max-Age=604800; SameSite=Lax`
    ]);

    res.json({
      success: true,
      verified: true,
      user: {
        id: userId,
        email: email,
        role: 'user',
        ign: ign,
        uid: uid,
        phone: phone || '',
        discord: discord || '',
        avatar: ''
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during signup' });
  }
});

// Auth API - Login (Supports Email, Email Prefix, or Username/IGN)
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email/Username and password are required' });
  }

  const identifier = email.trim();
  const user = await db.prepare(`
    SELECT * FROM users 
    WHERE (LOWER(email) = LOWER(?) OR LOWER(ign) = LOWER(?) OR LOWER(email) LIKE LOWER(?)) 
      AND password = ?
  `).get(identifier, identifier, `${identifier}@%`, password);

  if (!user) {
    return res.status(401).json({ error: 'Invalid username/email or password' });
  }

  // Create session
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  await db.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)').run(token, user.id, expiresAt);

  const isAdmin = user.role === 'admin';
  res.setHeader('Set-Cookie', [
    `ghostline-session=${token}; Path=/; Max-Age=604800; SameSite=Lax; HttpOnly`,
    `ghostline-admin=${isAdmin ? 'true' : 'false'}; Path=/; Max-Age=604800; SameSite=Lax`
  ]);

  res.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      ign: user.ign || '',
      uid: user.uid || '',
      phone: user.phone || '',
      discord: user.discord || '',
      avatar: user.avatar || ''
    }
  });
});

// Auth API - Logout
app.post('/api/auth/logout', async (req, res) => {
  const token = getCookie(req, 'ghostline-session');
  if (token) {
    await db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
  }

  res.setHeader('Set-Cookie', [
    `ghostline-session=; Path=/; Max-Age=0; SameSite=Lax`,
    `ghostline-admin=; Path=/; Max-Age=0; SameSite=Lax`
  ]);

  res.json({ success: true, message: 'Logged out successfully' });
});

// Auth API - Me (fetch profile and stats)
app.get('/api/auth/me', async (req, res) => {
  const user = await getLoggedInUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  // Aggregate user statistics
  const regCountRow = await db.prepare('SELECT COUNT(*) as c FROM registrations WHERE user_id = ?').get(user.id);
  const regCount = regCountRow ? Number(regCountRow.c) : 0;

  let matchStats = { matches: 0, wins: 0, top3: 0, kills: 0, points: 0, prize: 0, rank: '—' };
  
  if (user.uid) {
    const statsRow = await db.prepare(`
      SELECT 
        COUNT(*) as matches,
        SUM(CASE WHEN placement = 1 THEN 1 ELSE 0 END) as wins,
        SUM(CASE WHEN placement <= 3 THEN 1 ELSE 0 END) as top3,
        SUM(kills) as kills,
        SUM(points) as points,
        SUM(prize_won) as prize
      FROM match_results 
      WHERE player_uid = ?
    `).get(user.uid);

    if (statsRow && Number(statsRow.matches) > 0) {
      matchStats = {
        matches: Number(statsRow.matches),
        wins: Number(statsRow.wins || 0),
        top3: Number(statsRow.top3 || 0),
        kills: Number(statsRow.kills || 0),
        points: Number(statsRow.points || 0),
        prize: Number(statsRow.prize || 0),
        rank: '—'
      };

      // Calculate their current rank dynamically
      const rankQuery = await db.prepare(`
        SELECT player_uid, SUM(points) as total_points
        FROM match_results
        GROUP BY player_uid
        ORDER BY total_points DESC
      `).all();

      const rankIndex = rankQuery.findIndex(r => r.player_uid === user.uid);
      if (rankIndex !== -1) {
        matchStats.rank = `#${rankIndex + 1}`;
      }
    }
  }

  let prevMatches = [];
  if (user.uid) {
    try {
      prevMatches = await db.prepare(`
        SELECT 
          tournaments.title as tournament_title,
          tournaments.mode,
          match_results.placement,
          match_results.kills,
          match_results.points
        FROM match_results
        JOIN tournaments ON tournaments.id = match_results.tournament_id
        WHERE match_results.player_uid = ?
        ORDER BY match_results.created_at DESC
      `).all(user.uid);
    } catch (e) {
      console.error('Failed to load user match history', e);
    }
  }

  res.json({
    success: true,
    user,
    stats: {
      registrationsCount: regCount,
      ...matchStats
    },
    history: prevMatches
  });
});

// Auth API - Update Profile
app.post('/api/auth/profile', async (req, res) => {
  const user = await getLoggedInUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { ign, phone, discord, avatar } = req.body;
  if (!ign) {
    return res.status(400).json({ error: 'In-Game Name (IGN) is required' });
  }

  try {
    await db.prepare(`
      UPDATE users 
      SET ign = ?, phone = ?, discord = ?, avatar = ?
      WHERE id = ?
    `).run(ign, phone || '', discord || '', avatar || '', user.id);

    const updatedUser = await db.prepare('SELECT id, email, role, ign, uid, phone, discord, avatar FROM users WHERE id = ?').get(user.id);
    res.json({
      success: true,
      user: updatedUser
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Auth API - Verify Signup (Keep for legacy route compatibility)
app.post('/api/auth/verify-signup', async (req, res) => {
  const { userId, otp } = req.body;
  if (!userId || !otp) {
    return res.status(400).json({ error: 'User ID and OTP are required' });
  }

  const user = await db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (user.otp_code !== otp) {
    return res.status(400).json({ error: 'Invalid OTP verification code' });
  }

  try {
    await db.prepare("UPDATE users SET verified = 1, otp_code = '' WHERE id = ?").run(userId);
    
    // Create session
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    await db.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)').run(token, user.id, expiresAt);

    res.setHeader('Set-Cookie', [
      `ghostline-session=${token}; Path=/; Max-Age=604800; SameSite=Lax; HttpOnly`,
      `ghostline-admin=false; Path=/; Max-Age=604800; SameSite=Lax`
    ]);

    res.json({
      success: true,
      verified: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        ign: user.ign || '',
        uid: user.uid || '',
        phone: user.phone || '',
        discord: user.discord || '',
        avatar: user.avatar || ''
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Verification failed' });
  }
});


app.get('/api/tournaments', async (req, res) => {
  const rows = await db.prepare(`
    SELECT id, title, mode, date, time, prize, fee, slots_total, slots_filled, status, deadline
    FROM tournaments
    ORDER BY date ASC
  `).all();
  res.json(rows);
});

app.post('/api/register', async (req, res) => {
  const { tournamentId, fullName, email, phone, discord, teamName, players } = req.body;
  const tournament = await db.prepare('SELECT * FROM tournaments WHERE id = ?').get(tournamentId);
  if (!tournament) return res.status(404).json({ error: 'Tournament not found' });
  if (tournament.slots_filled >= tournament.slots_total) return res.status(400).json({ error: 'Tournament is full' });

  // Validate player slots depending on mode
  const reqPlayers = players || [];
  if (tournament.mode.includes('Squad') && reqPlayers.length < 4) {
    return res.status(400).json({ error: 'Squad registrations require details for 4 players' });
  }
  if (tournament.mode.includes('Duo') && reqPlayers.length < 2) {
    return res.status(400).json({ error: 'Duo registrations require details for 2 players' });
  }
  if ((tournament.mode.includes('Solo') || tournament.mode.includes('Wolf')) && reqPlayers.length < 1) {
    return res.status(400).json({ error: 'Solo registrations require details for 1 player' });
  }

  // Validate player igns and uids
  for (let i = 0; i < reqPlayers.length; i++) {
    if (!reqPlayers[i].ign || !reqPlayers[i].uid) {
      return res.status(400).json({ error: `Player ${i + 1} IGN and UID are required` });
    }
  }

  const userId = await getUserIdFromSession(req);
  const regId = `GL-${Date.now()}-${Math.floor(Math.random()*900+100)}`;
  const playersJson = JSON.stringify(reqPlayers);

  // Dynamically calculate slot number for this tournament (starting from 1)
  const existingCountRow = await db.prepare('SELECT COUNT(*) as count FROM registrations WHERE tournament_id = ?').get(tournament.id);
  const slotNumber = (existingCountRow ? Number(existingCountRow.count) : 0) + 1;

  // Insert registration (verified immediately)
  await db.prepare(`
    INSERT INTO registrations (reg_id, tournament_id, tournament_title, mode, team_name, full_name, email, phone, discord, players_json, otp, verified, user_id, slot_number)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '', 1, ?, ?)
  `).run(regId, tournament.id, tournament.title, tournament.mode, teamName || fullName, fullName, email, phone, discord || '', playersJson, userId, slotNumber);

  const updatedFilled = tournament.slots_filled + 1;
  let nextStatus = tournament.status;
  if (updatedFilled >= tournament.slots_total) nextStatus = 'Full';
  else if (updatedFilled / tournament.slots_total >= 0.85 && tournament.status === 'Open') nextStatus = 'Filling Fast';
  await db.prepare('UPDATE tournaments SET slots_filled = ?, status = ? WHERE id = ?').run(updatedFilled, nextStatus, tournament.id);

  res.json({ success: true, regId, slotNumber, message: 'Registration successful! Your slot is verified.' });
});

app.post('/api/verify-otp', (req, res) => {
  res.json({ success: true, message: 'Registration verified successfully' });
});

app.get('/api/registrations', async (req, res) => {
  const user = await getLoggedInUser(req);
  if (!user) {
    return res.json([]);
  }

  if (user.role === 'admin') {
    const rows = await db.prepare('SELECT * FROM registrations ORDER BY id DESC').all();
    res.json(rows);
  } else {
    const rows = await db.prepare('SELECT * FROM registrations WHERE user_id = ? OR email = ? ORDER BY id DESC').all(user.id, user.email);
    res.json(rows);
  }
});

// ================= ADMIN TOURNAMENT CRUD =================

app.post('/api/admin/tournaments', async (req, res) => {
  if (!(await isAdminAuthed(req))) return res.status(401).json({ error: 'Admin access required' });

  const { title, mode, status, date, time, prize, fee, slotsTotal } = req.body;
  if (!title || !mode) return res.status(400).json({ error: 'Title and mode are required' });

  const id = `t-${Date.now()}`;
  const deadline = date ? `${date}, 2 hours before start` : 'TBA';

  try {
    await db.prepare(`
      INSERT INTO tournaments (id, title, mode, date, time, prize, fee, slots_total, slots_filled, status, deadline)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
    `).run(id, title, mode, date || 'TBA', time || 'TBA', Number(prize) || 0, Number(fee) || 0, Number(slotsTotal) || 32, status || 'Open', deadline);

    res.json({ success: true, tournament: { id, title, mode, date, time, prize, fee, slotsTotal, status } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create tournament' });
  }
});

app.delete('/api/admin/tournaments/:id', async (req, res) => {
  if (!(await isAdminAuthed(req))) return res.status(401).json({ error: 'Admin access required' });

  try {
    await db.prepare('DELETE FROM tournaments WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Tournament deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete tournament' });
  }
});

app.patch('/api/admin/tournaments/:id/status', async (req, res) => {
  if (!(await isAdminAuthed(req))) return res.status(401).json({ error: 'Admin access required' });

  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Status is required' });

  try {
    await db.prepare('UPDATE tournaments SET status = ? WHERE id = ?').run(status, req.params.id);
    res.json({ success: true, message: 'Status updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update tournament status' });
  }
});

// ================= MATCH RESULTS & LEADERBOARD =================

// Standard placement points helper (Free Fire style)
function calculatePlacementPoints(place) {
  const pts = [0, 12, 9, 8, 7, 6, 5, 4, 3, 2, 1];
  return pts[place] || 0;
}

// Admin Match Results Submission
app.post('/api/admin/match-results', async (req, res) => {
  if (!(await isAdminAuthed(req))) return res.status(401).json({ error: 'Admin access required' });

  const { tournamentId, results } = req.body;
  if (!tournamentId || !Array.isArray(results)) {
    return res.status(400).json({ error: 'Tournament ID and results array are required' });
  }

  try {
    const tournament = await db.prepare('SELECT * FROM tournaments WHERE id = ?').get(tournamentId);
    if (!tournament) return res.status(404).json({ error: 'Tournament not found' });

    // Begin PostgreSQL Transaction
    await db.exec('BEGIN');

    await db.prepare('DELETE FROM match_results WHERE tournament_id = ?').run(tournamentId);
    
    for (const row of results) {
      const placement = Number(row.placement) || 0;
      const kills = Number(row.kills) || 0;
      const prizeWon = Number(row.prizeWon) || 0;
      const points = Number(row.points) || (calculatePlacementPoints(placement) + kills);

      await db.prepare(`
        INSERT INTO match_results (tournament_id, player_uid, player_ign, team_name, placement, kills, points, prize_won)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        tournamentId,
        row.playerUid,
        row.playerIgn,
        row.teamName || '',
        placement,
        kills,
        points,
        prizeWon
      );
    }
    
    await db.prepare("UPDATE tournaments SET status = 'Completed' WHERE id = ?").run(tournamentId);

    // Commit PostgreSQL Transaction
    await db.exec('COMMIT');

    res.json({ success: true, message: 'Match results submitted and leaderboard updated' });
  } catch (err) {
    try { await db.exec('ROLLBACK'); } catch (e) {}
    console.error(err);
    res.status(500).json({ error: 'Failed to save match results' });
  }
});

// Fetch Leaderboard (Weekly, Monthly, Season/All-Time)
app.get('/api/leaderboard', async (req, res) => {
  const { period, mode } = req.query;
  let sql = `
    SELECT 
      player_uid as uid,
      MAX(player_ign) as name,
      COUNT(DISTINCT tournament_id) as matches,
      SUM(CASE WHEN placement = 1 THEN 1 ELSE 0 END) as wins,
      SUM(CASE WHEN placement <= 3 THEN 1 ELSE 0 END) as top3,
      SUM(kills) as kills,
      SUM(points) as points,
      SUM(prize_won) as prize
    FROM match_results
    JOIN tournaments ON tournaments.id = match_results.tournament_id
    WHERE 1=1
  `;
  const params = [];

  if (mode && mode !== 'all') {
    sql += ` AND tournaments.mode = ?`;
    params.push(mode);
  }

  // PostgreSQL datetime calculations
  if (period === 'weekly') {
    sql += ` AND match_results.created_at >= NOW() - INTERVAL '7 days'`;
  } else if (period === 'monthly') {
    sql += ` AND match_results.created_at >= NOW() - INTERVAL '30 days'`;
  }

  sql += ` GROUP BY player_uid ORDER BY points DESC, kills DESC, wins DESC`;

  try {
    const rows = await db.prepare(sql).all(params);
    const rankedRows = rows.map((row, index) => ({
      rank: index + 1,
      name: row.name,
      uid: row.uid,
      mode: mode === 'all' || !mode ? 'Mixed' : mode,
      matches: Number(row.matches),
      wins: Number(row.wins),
      top3: Number(row.top3),
      kills: Number(row.kills),
      points: Number(row.points),
      prize: Number(row.prize)
    }));
    res.json(rankedRows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await db.prepare('SELECT * FROM users WHERE email = ? AND password = ?').get(username, password);
  if (!user || user.role !== 'admin') return res.status(401).json({ error: 'Unauthorized' });
  res.json({ success: true, role: 'admin' });
});

// Contact Form API - Public Submit
app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    await db.prepare(`
      INSERT INTO contacts (name, email, subject, message)
      VALUES (?, ?, ?, ?)
    `).run(name, email, subject, message);

    // Email notification to admin (if SMTP configured)
    const adminEmail = process.env.SMTP_FROM_EMAIL || 'iamkrishpz@gmail.com';
    const emailBody = `
      <div style="font-family: 'Inter', sans-serif; background: #0b0c10; color: #c5c6c7; padding: 30px; border-radius: 12px; max-width: 500px; margin: auto; border: 1px solid #1f2833;">
        <h3 style="color: #ff4e50; border-bottom: 1px solid #1f2833; padding-bottom: 10px; margin-top: 0;">New Contact Form Submission</h3>
        <p style="font-size: 14px; margin-bottom: 8px;"><b>Name:</b> ${name}</p>
        <p style="font-size: 14px; margin-bottom: 8px;"><b>Email:</b> ${email}</p>
        <p style="font-size: 14px; margin-bottom: 8px;"><b>Subject:</b> ${subject}</p>
        <div style="background: #1f2833; padding: 16px; border-radius: 8px; font-size: 13.5px; line-height: 1.5; color: #ffffff; margin-top: 14px;">
          ${message.replace(/\n/g, '<br />')}
        </div>
      </div>
    `;

    const isSmtpConfigured = process.env.SMTP_USER && process.env.SMTP_PASS;
    if (isSmtpConfigured) {
      transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME || 'SYG ESPORTS'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
        to: adminEmail,
        subject: `📬 New Contact Message: ${subject}`,
        html: emailBody
      }).catch(err => console.error('[SMTP] Failed to send contact notification:', err.message));
    }

    res.json({ success: true, message: 'Your message has been sent successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit contact form' });
  }
});

// Contact Form API - Admin List
app.get('/api/contacts', async (req, res) => {
  const user = await getLoggedInUser(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  try {
    const rows = await db.prepare('SELECT * FROM contacts ORDER BY id DESC').all();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch contact submissions' });
  }
});

// Contact Form API - Admin Resolve
app.post('/api/contacts/:id/resolve', async (req, res) => {
  const user = await getLoggedInUser(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { id } = req.params;
  try {
    await db.prepare('UPDATE contacts SET resolved = 1 WHERE id = ?').run(id);
    res.json({ success: true, message: 'Message marked as resolved' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to resolve message' });
  }
});

// Contact Form API - Admin Delete
app.delete('/api/contacts/:id', async (req, res) => {
  const user = await getLoggedInUser(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { id } = req.params;
  try {
    await db.prepare('DELETE FROM contacts WHERE id = ?').run(id);
    res.json({ success: true, message: 'Message deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete message' });
  }
});

// Tournament Lobbies - Set Room Credentials (Admin only)
app.post('/api/admin/tournaments/:id/room', async (req, res) => {
  const user = await getLoggedInUser(req);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const { id } = req.params;
  const { roomId, roomPass, roomNotes } = req.body;
  try {
    await db.prepare(`
      UPDATE tournaments
      SET room_id = ?, room_pass = ?, room_notes = ?
      WHERE id = ?
    `).run(roomId || '', roomPass || '', roomNotes || '', id);
    res.json({ success: true, message: 'Lobby credentials updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update lobby details' });
  }
});

// Tournament Lobbies - Get Room Credentials (Registered Users only)
app.get('/api/tournaments/:id/room', async (req, res) => {
  const user = await getLoggedInUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const { id } = req.params;
  try {
    // Check if the user is registered and verified for this tournament
    const registration = await db.prepare(`
      SELECT id FROM registrations
      WHERE tournament_id = ? AND user_id = ? AND verified = 1
    `).get(id, user.id);

    // Allow viewing if the user has a verified slot, OR if they are the admin
    if (!registration && user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied: You must be a registered participant to view lobby credentials.' });
    }

    const tournament = await db.prepare('SELECT room_id, room_pass, room_notes FROM tournaments WHERE id = ?').get(id);
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    res.json({
      roomId: tournament.room_id || '',
      roomPass: tournament.room_pass || '',
      roomNotes: tournament.room_notes || ''
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch lobby details' });
  }
});


app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(frontendBuildPath, 'index.html'), (err) => {
    if (err) {
      res.status(404).send('Frontend build not found. Please run npm run build in the frontend directory.');
    }
  });
});

// Bootstrap Database first, then spin up Web Server
initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Database bootstrap failed', err);
    process.exit(1);
  });
