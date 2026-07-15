const express = require('express');

const meController = require('../controllers/meController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authenticate, authorize('tenant'));

router.get('/room', meController.getMyRoom);
router.get('/contracts', meController.getMyContracts);
router.get('/invoices', meController.getMyInvoices);
router.patch('/invoices/:id/pay', meController.payMyInvoice);

module.exports = router;
