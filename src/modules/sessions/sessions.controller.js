const sessionsService = require('./sessions.service');

const createSession = async (req, res, next) => {
  try {
    const session = await sessionsService.createSession(req.user.id, req.body);

    res.status(201).json({
      success: true,
      message: 'Training session logged successfully.',
      data: session,
    });
  } catch (err) {
    next(err);
  }
};

const getSessions = async (req, res, next) => {
  try {
    const { page, limit, session_type } = req.query;
    const result = await sessionsService.getSessions(req.user.id, { page, limit, session_type });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const getSessionById = async (req, res, next) => {
  try {
    const session = await sessionsService.getSessionById(req.user.id, req.params.id);

    res.status(200).json({
      success: true,
      data: session,
    });
  } catch (err) {
    next(err);
  }
};

const updateSession = async (req, res, next) => {
  try {
    const session = await sessionsService.updateSession(req.user.id, req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: 'Session updated successfully.',
      data: session,
    });
  } catch (err) {
    next(err);
  }
};

const deleteSession = async (req, res, next) => {
  try {
    await sessionsService.deleteSession(req.user.id, req.params.id);

    res.status(200).json({
      success: true,
      message: 'Session deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { createSession, getSessions, getSessionById, updateSession, deleteSession };