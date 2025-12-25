const express = require('express');
const auth = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');
const pagination = require('../middlewares/pagination.middleware');
const controller = require('../controllers/specialty.controller');
const asyncHandler = require('../middlewares/asyncHandler');

const router = express.Router();

router.get('/', pagination, asyncHandler(controller.list));
router.post('/', auth, requireRole('ADMIN'), asyncHandler(controller.create));
router.get('/:id', asyncHandler(controller.getById));
router.patch('/:id', auth, requireRole('ADMIN'), asyncHandler(controller.update));
router.delete('/:id', auth, requireRole('ADMIN'), asyncHandler(controller.remove));

module.exports = router;
