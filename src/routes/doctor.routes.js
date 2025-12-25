const express = require('express');
const auth = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');
const pagination = require('../middlewares/pagination.middleware');
const controller = require('../controllers/doctor.controller');
const asyncHandler = require('../middlewares/asyncHandler');

const router = express.Router();

router.get('/top', asyncHandler(controller.topDoctors));
router.get('/', pagination, asyncHandler(controller.listDoctors));
router.post('/', auth, requireRole('ADMIN'), asyncHandler(controller.createDoctor));
router.get('/:id', asyncHandler(controller.getDoctorById));
router.patch('/:id', auth, requireRole('ADMIN'), asyncHandler(controller.updateDoctor));
router.delete('/:id', auth, requireRole('ADMIN'), asyncHandler(controller.deleteDoctor));

module.exports = router;
