const express = require('express');

const contractRoutes = require('./contractRoutes');
const invoiceRoutes = require('./invoiceRoutes');
const roomRoutes = require('./roomRoutes');
const tenantRoutes = require('./tenantRoutes');

const router = express.Router();

router.use('/rooms', roomRoutes);
router.use('/tenants', tenantRoutes);
router.use('/contracts', contractRoutes);
router.use('/invoices', invoiceRoutes);

module.exports = router;
