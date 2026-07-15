const express = require('express');

const invoiceController = require('../controllers/invoiceController');

const router = express.Router();

router.post('/', invoiceController.createInvoice);
router.get('/', invoiceController.listInvoices);
router.get('/:id', invoiceController.getInvoice);
router.put('/:id', invoiceController.updateInvoice);
router.patch('/:id/payment-status', invoiceController.updatePaymentStatus);

module.exports = router;
