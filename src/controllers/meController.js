const meService = require('../services/meService');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');

const getMyRoom = asyncHandler(async (req, res) => {
  const room = await meService.getMyRoom(req.app.locals.db, req.user);
  success(res, room, 'Current rented room retrieved');
});

const getMyContracts = asyncHandler(async (req, res) => {
  const contracts = await meService.getMyContracts(req.app.locals.db, req.user);
  success(res, contracts, 'Current tenant contracts retrieved');
});

const getMyInvoices = asyncHandler(async (req, res) => {
  const invoices = await meService.getMyInvoices(req.app.locals.db, req.user);
  success(res, invoices, 'Current tenant invoices retrieved');
});

const payMyInvoice = asyncHandler(async (req, res) => {
  const invoice = await meService.payMyInvoice(req.app.locals.db, req.user, req.params.id);
  success(res, invoice, 'Invoice marked as paid');
});

module.exports = {
  getMyContracts,
  getMyInvoices,
  getMyRoom,
  payMyInvoice,
};
