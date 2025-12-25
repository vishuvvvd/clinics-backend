const express = require('express');
const { body } = require('express-validator');

const auth = require('../middlewares/auth.middleware');
const requireRole = require('../middlewares/role.middleware');
const pagination = require('../middlewares/pagination.middleware');
const { clinicAccess } = require('../middlewares/clinicAccess.middleware');
const controller = require('../controllers/clinic.controller');
const asyncHandler = require('../middlewares/asyncHandler');

const router = express.Router();

router.get('/popular', asyncHandler(controller.popularClinics));
router.get('/', pagination, asyncHandler(controller.listClinics));
router.post('/', auth, requireRole('ADMIN'), body('resourceType').equals('Organization'), body('name').notEmpty(), asyncHandler(controller.createClinic));
router.get('/:id', asyncHandler(controller.getClinicById));
router.patch('/:id', auth, clinicAccess('CLINIC_EDITOR'), asyncHandler(controller.updateClinic));
router.delete('/:id', auth, requireRole('ADMIN'), asyncHandler(controller.deleteClinic));

module.exports = router;
