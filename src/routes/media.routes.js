const express = require('express');
const controller = require('../controllers/media.controller');
const auth = require('../middlewares/auth.middleware');
const asyncHandler = require('../middlewares/asyncHandler');

const router = express.Router();

router.post('/upload/image', auth, asyncHandler(controller.uploadImage));
router.post('/upload/video', auth, asyncHandler(controller.uploadVideo));
router.post('/attach', auth, asyncHandler(controller.attach));
router.get('/', asyncHandler(controller.list));
router.delete('/:id', auth, asyncHandler(controller.remove));

module.exports = router;
