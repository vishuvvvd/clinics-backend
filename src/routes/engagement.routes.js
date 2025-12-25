const express = require('express');
const controller = require('../controllers/engagement.controller');
const auth = require('../middlewares/auth.middleware');
const asyncHandler = require('../middlewares/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(controller.getEngagement));
router.post('/like', auth, asyncHandler(controller.like));
router.post('/view', asyncHandler(controller.view));
router.post('/rate', auth, asyncHandler(controller.rate));

module.exports = router;
