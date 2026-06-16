const dashboardService = require('./dashboard.service');

const getDashboard = async (req, res, next) => {
  try {
    const dashboard = await dashboardService.getDashboard(req.user.id);

    res.status(200).json({
      success: true,
      data: dashboard,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard };