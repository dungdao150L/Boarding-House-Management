const express = require('express');

const tenantController = require('../controllers/tenantController');

const router = express.Router();

router.post('/', tenantController.createTenant);
router.get('/', tenantController.listTenants);
router.get('/:id', tenantController.getTenant);
router.put('/:id', tenantController.updateTenant);
router.delete('/:id', tenantController.deleteTenant);

module.exports = router;
