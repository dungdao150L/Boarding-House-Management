const express = require('express');

const reportController = require('../controllers/reportController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authenticate, authorize('admin', 'staff'));

router.get('/revenue', reportController.getMonthlyRevenue);
router.get('/unpaid-invoices', reportController.getUnpaidInvoices);
router.get('/room-occupancy', reportController.getRoomOccupancy);

module.exports = router;
