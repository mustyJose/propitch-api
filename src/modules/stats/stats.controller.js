const statsService = require('./stats.service');

const getPlayerStats = async (req, res, next) => {
  try {
    const stats = await statsService.getPlayerStats(req.user.id);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (err) {
    next(err);
  }
};

const getSessionBreakdown = async (req, res, next) => {
  try {
    const breakdown = await statsService.getSessionBreakdown(req.user.id);

    res.status(200).json({
      success: true,
      data: breakdown,
    });
  } catch (err) {
    next(err);
  }
};

const getWeeklyProgress = async (req, res, next) => {
  try {
    const progress = await statsService.getWeeklyProgress(req.user.id);

    res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (err) {
    next(err);
  }
};

const getAchievements = async (req, res, next) => {
  try {
    const achievements = await statsService.getAchievements(req.user.id);

    res.status(200).json({
      success: true,
      data: achievements,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getPlayerStats, getSessionBreakdown, getWeeklyProgress, getAchievements };