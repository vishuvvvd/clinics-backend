const express = require('express');
const controller = require('../controllers/search.controller');
const asyncHandler = require('../middlewares/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(controller.search));

module.exports = router;
