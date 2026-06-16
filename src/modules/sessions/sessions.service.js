const pool = require('../../config/db');

const createSession = async (userId, { title, session_type, duration_minutes, intensity, notes, session_date }) => {
  const result = await pool.query(
    `INSERT INTO training_sessions (user_id, title, session_type, duration_minutes, intensity, notes, session_date)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [userId, title, session_type, duration_minutes, intensity, notes, session_date]
  );

  const session = result.rows[0];

  await updatePlayerStats(userId, duration_minutes, session_date);
  await checkAndAwardAchievements(userId);

  return session;
};

const updatePlayerStats = async (userId, duration_minutes, session_date) => {
  const statsResult = await pool.query(
    'SELECT * FROM player_stats WHERE user_id = $1',
    [userId]
  );

  const stats = statsResult.rows[0];
  const lastDate = stats.last_session_date ? new Date(stats.last_session_date) : null;
  const today = new Date(session_date);

  let newStreak = stats.current_streak;

  if (!lastDate) {
    newStreak = 1;
  } else {
    const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      newStreak += 1;
    } else if (diffDays > 1) {
      newStreak = 1;
    }
  }

  const longestStreak = Math.max(newStreak, stats.longest_streak);

  await pool.query(
    `UPDATE player_stats
     SET total_sessions = total_sessions + 1,
         total_minutes = total_minutes + $1,
         current_streak = $2,
         longest_streak = $3,
         last_session_date = $4,
         updated_at = NOW()
     WHERE user_id = $5`,
    [duration_minutes, newStreak, longestStreak, session_date, userId]
  );
};

const checkAndAwardAchievements = async (userId) => {
  const statsResult = await pool.query(
    'SELECT * FROM player_stats WHERE user_id = $1',
    [userId]
  );

  const stats = statsResult.rows[0];

  const achievementsResult = await pool.query(
    'SELECT badge_code FROM achievements WHERE user_id = $1',
    [userId]
  );

  const earned = achievementsResult.rows.map((a) => a.badge_code);

  const toAward = [];

  if (stats.total_sessions === 1 && !earned.includes('FIRST_SESSION')) {
    toAward.push({ title: 'First Whistle', description: 'Logged your first training session.', badge_code: 'FIRST_SESSION' });
  }

  if (stats.total_sessions >= 10 && !earned.includes('TEN_SESSIONS')) {
    toAward.push({ title: 'Ten Down', description: 'Completed 10 training sessions.', badge_code: 'TEN_SESSIONS' });
  }

  if (stats.current_streak >= 7 && !earned.includes('SEVEN_DAY_STREAK')) {
    toAward.push({ title: 'Week Warrior', description: 'Trained 7 days in a row.', badge_code: 'SEVEN_DAY_STREAK' });
  }

  if (stats.total_minutes >= 600 && !earned.includes('TEN_HOURS')) {
    toAward.push({ title: 'Ten Hours In', description: 'Logged 10 hours of training.', badge_code: 'TEN_HOURS' });
  }

  for (const achievement of toAward) {
    await pool.query(
      `INSERT INTO achievements (user_id, title, description, badge_code)
       VALUES ($1, $2, $3, $4)`,
      [userId, achievement.title, achievement.description, achievement.badge_code]
    );
  }
};

const getSessions = async (userId, { page = 1, limit = 10, session_type }) => {
  const offset = (page - 1) * limit;
  let query = 'SELECT * FROM training_sessions WHERE user_id = $1';
  const params = [userId];

  if (session_type) {
    params.push(session_type);
    query += ` AND session_type = $${params.length}`;
  }

  query += ` ORDER BY session_date DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);

  const result = await pool.query(query, params);

  const countResult = await pool.query(
    'SELECT COUNT(*) FROM training_sessions WHERE user_id = $1',
    [userId]
  );

  return {
    sessions: result.rows,
    total: parseInt(countResult.rows[0].count),
    page: parseInt(page),
    limit: parseInt(limit),
  };
};

const getSessionById = async (userId, sessionId) => {
  const result = await pool.query(
    'SELECT * FROM training_sessions WHERE id = $1 AND user_id = $2',
    [sessionId, userId]
  );

  if (result.rows.length === 0) {
    const error = new Error('Session not found.');
    error.statusCode = 404;
    error.code = 'SESSION_NOT_FOUND';
    throw error;
  }

  return result.rows[0];
};

const updateSession = async (userId, sessionId, updates) => {
  const { title, session_type, duration_minutes, intensity, notes, session_date } = updates;

  const result = await pool.query(
    `UPDATE training_sessions
     SET title = $1, session_type = $2, duration_minutes = $3,
         intensity = $4, notes = $5, session_date = $6, updated_at = NOW()
     WHERE id = $7 AND user_id = $8
     RETURNING *`,
    [title, session_type, duration_minutes, intensity, notes, session_date, sessionId, userId]
  );

  if (result.rows.length === 0) {
    const error = new Error('Session not found.');
    error.statusCode = 404;
    error.code = 'SESSION_NOT_FOUND';
    throw error;
  }

  return result.rows[0];
};

const deleteSession = async (userId, sessionId) => {
  const result = await pool.query(
    'DELETE FROM training_sessions WHERE id = $1 AND user_id = $2 RETURNING id',
    [sessionId, userId]
  );

  if (result.rows.length === 0) {
    const error = new Error('Session not found.');
    error.statusCode = 404;
    error.code = 'SESSION_NOT_FOUND';
    throw error;
  }
};

module.exports = { createSession, getSessions, getSessionById, updateSession, deleteSession };