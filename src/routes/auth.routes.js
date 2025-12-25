const express = require('express');
const controller = require('../controllers/auth.controller');
const auth = require('../middlewares/auth.middleware');
const asyncHandler = require('../middlewares/asyncHandler');

const router = express.Router();

router.post('/register', asyncHandler(controller.register));
router.post('/login', asyncHandler(controller.login));
router.get('/me', auth, asyncHandler(controller.me));

module.exports = router;
