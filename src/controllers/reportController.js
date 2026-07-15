const reportService = require('../services/reportService');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');

const getMonthlyRevenue = asyncHandler(async (req, res) => {
  const report = await reportService.getMonthlyRevenue(req.app.locals.db, req.query.month);
  success(res, report, 'Monthly revenue report retrieved');
});

const getUnpaidInvoices = asyncHandler(async (req, res) => {
  const invoices = await reportService.getUnpaidInvoices(req.app.locals.db);
  success(res, invoices, 'Unpaid invoices retrieved');
});

const getRoomOccupancy = asyncHandler(async (req, res) => {
  const report = await reportService.getRoomOccupancy(req.app.locals.db);
  success(res, report, 'Room occupancy report retrieved');
});

module.exports = {
  getMonthlyRevenue,
  getRoomOccupancy,
  getUnpaidInvoices,
};
