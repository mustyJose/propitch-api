const pool = require('../../config/db');

const getDashboard = async (userId) => {
  const userResult = await pool.query(
    'SELECT id, full_name, email, role, position, age FROM users WHERE id = $1',
    [userId]
  );

  const statsResult = await pool.query(
    'SELECT * FROM player_stats WHERE user_id = $1',
    [userId]
  );

  const recentSessionsResult = await pool.query(
    `SELECT * FROM training_sessions
     WHERE user_id = $1
     ORDER BY session_date DESC
     LIMIT 5`,
    [userId]
  );

  const achievementsResult = await pool.query(
    `SELECT * FROM achievements
     WHERE user_id = $1
     ORDER BY earned_at DESC
     LIMIT 3`,
    [userId]
  );

  const weeklyResult = await pool.query(
    `SELECT
       DATE_TRUNC('week', session_date) as week,
       COUNT(*) as total_sessions,
       SUM(duration_minutes) as total_minutes
     FROM training_sessions
     WHERE user_id = $1
       AND session_date >= NOW() - INTERVAL '4 weeks'
     GROUP BY week
     ORDER BY week ASC`,
    [userId]
  );

  const stats = statsResult.rows[0];
  const totalHours = stats ? (stats.total_minutes / 60).toFixed(1) : 0;

  return {
    user: userResult.rows[0],
    stats: {
      ...stats,
      total_hours: totalHours,
    },
    recent_sessions: recentSessionsResult.rows,
    recent_achievements: achievementsResult.rows,
    weekly_progress: weeklyResult.rows,
  };
};

module.exports = { getDashboard };