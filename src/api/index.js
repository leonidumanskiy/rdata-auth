const Router = require('express').Router;
const auth = require('./auth');

const router = new Router();
router.use('/auth', auth);

module.exports = router;
