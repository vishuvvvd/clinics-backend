const express = require('express');
const controller = require('../controllers/home.controller');
const asyncHandler = require('../middlewares/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(controller.home));

module.exports = router;
