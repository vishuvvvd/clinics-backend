const express = require('express');
const controller = require('../controllers/comment.controller');
const auth = require('../middlewares/auth.middleware');
const asyncHandler = require('../middlewares/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(controller.list));
router.post('/', auth, asyncHandler(controller.create));
router.delete('/:id', auth, asyncHandler(controller.remove));

module.exports = router;
