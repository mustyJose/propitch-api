const pool = require('../../config/db');

const getPlayerStats = async (userId) => {
  const statsResult = await pool.query(
    'SELECT * FROM player_stats WHERE user_id = $1',
    [userId]
  );

  if (statsResult.rows.length === 0) {
    const error = new Error('Stats not found.');
    error.statusCode = 404;
    error.code = 'STATS_NOT_FOUND';
    throw error;
  }

  const stats = statsResult.rows[0];
  const totalHours = (stats.total_minutes / 60).toFixed(1);

  return { ...stats, total_hours: totalHours };
};

const getSessionBreakdown = async (userId) => {
  const result = await pool.query(
    `SELECT session_type, COUNT(*) as total_sessions,
     SUM(duration_minutes) as total_minutes,
     ROUND(AVG(duration_minutes), 1) as avg_duration
     FROM training_sessions
     WHERE user_id = $1
     GROUP BY session_type
     ORDER BY total_sessions DESC`,
    [userId]
  );

  return result.rows;
};

const getWeeklyProgress = async (userId) => {
  const result = await pool.query(
    `SELECT
       DATE_TRUNC('week', session_date) as week,
       COUNT(*) as total_sessions,
       SUM(duration_minutes) as total_minutes
     FROM training_sessions
     WHERE user_id = $1
       AND session_date >= NOW() - INTERVAL '8 weeks'
     GROUP BY week
     ORDER BY week ASC`,
    [userId]
  );

  return result.rows;
};

const getAchievements = async (userId) => {
  const result = await pool.query(
    'SELECT * FROM achievements WHERE user_id = $1 ORDER BY earned_at DESC',
    [userId]
  );

  return result.rows;
};

module.exports = { getPlayerStats, getSessionBreakdown, getWeeklyProgress, getAchievements };