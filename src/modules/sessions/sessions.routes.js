const express = require('express');
const router = express.Router();
const { createSession, getSessions, getSessionById, updateSession, deleteSession } = require('./sessions.controller');
const { authenticate } = require('../../middleware/auth');

router.use(authenticate);

router.post('/', createSession);
router.get('/', getSessions);
router.get('/:id', getSessionById);
router.put('/:id', updateSession);
router.delete('/:id', deleteSession);

module.exports = router;