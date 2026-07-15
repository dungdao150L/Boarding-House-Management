const invoiceService = require('../services/invoiceService');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');

const createInvoice = asyncHandler(async (req, res) => {
  const invoice = await invoiceService.createInvoice(req.app.locals.db, req.body);
  success(res, invoice, 'Invoice created', 201);
});

const listInvoices = asyncHandler(async (req, res) => {
  const invoices = await invoiceService.listInvoices(req.app.locals.db);
  success(res, invoices, 'Invoices retrieved');
});

const getInvoice = asyncHandler(async (req, res) => {
  const invoice = await invoiceService.getInvoiceById(req.app.locals.db, req.params.id);
  success(res, invoice, 'Invoice retrieved');
});

const updateInvoice = asyncHandler(async (req, res) => {
  const invoice = await invoiceService.updateInvoice(req.app.locals.db, req.params.id, req.body);
  success(res, invoice, 'Invoice updated');
});

const updatePaymentStatus = asyncHandler(async (req, res) => {
  const invoice = await invoiceService.updatePaymentStatus(req.app.locals.db, req.params.id, req.body.paymentStatus);
  success(res, invoice, 'Payment status updated');
});

module.exports = {
  createInvoice,
  getInvoice,
  listInvoices,
  updateInvoice,
  updatePaymentStatus,
};
