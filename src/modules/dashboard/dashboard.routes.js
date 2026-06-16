const express = require('express');
const router = express.Router();
const { getDashboard } = require('./dashboard.controller');
const { authenticate } = require('../../middleware/auth');

router.use(authenticate);

router.get('/', getDashboard);

module.exports = router;