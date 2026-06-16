const express = require('express');
const router = express.Router();
const { getPlayerStats, getSessionBreakdown, getWeeklyProgress, getAchievements } = require('./stats.controller');
const { authenticate } = require('../../middleware/auth');

router.use(authenticate);

router.get('/', getPlayerStats);
router.get('/breakdown', getSessionBreakdown);
router.get('/weekly', getWeeklyProgress);
router.get('/achievements', getAchievements);

module.exports = router;