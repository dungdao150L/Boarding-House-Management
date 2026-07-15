const express = require('express');

const invoiceController = require('../controllers/invoiceController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authenticate, authorize('admin', 'staff'));

router.post('/', invoiceController.createInvoice);
router.get('/', invoiceController.listInvoices);
router.get('/:id', invoiceController.getInvoice);
router.put('/:id', invoiceController.updateInvoice);
router.patch('/:id/payment-status', invoiceController.updatePaymentStatus);

module.exports = router;
