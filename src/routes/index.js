const express = require('express');

const authRoutes = require('./authRoutes');
const contractRoutes = require('./contractRoutes');
const invoiceRoutes = require('./invoiceRoutes');
const meRoutes = require('./meRoutes');
const reportRoutes = require('./reportRoutes');
const roomRoutes = require('./roomRoutes');
const tenantRoutes = require('./tenantRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/me', meRoutes);
router.use('/reports', reportRoutes);
router.use('/rooms', roomRoutes);
router.use('/tenants', tenantRoutes);
router.use('/contracts', contractRoutes);
router.use('/invoices', invoiceRoutes);

module.exports = router;
