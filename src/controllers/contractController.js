const contractService = require('../services/contractService');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');

const createContract = asyncHandler(async (req, res) => {
  const contract = await contractService.createContract(req.app.locals.db, req.body);
  success(res, contract, 'Contract created', 201);
});

const listContracts = asyncHandler(async (req, res) => {
  const contracts = await contractService.listContracts(req.app.locals.db);
  success(res, contracts, 'Contracts retrieved');
});

const getContract = asyncHandler(async (req, res) => {
  const contract = await contractService.getContractById(req.app.locals.db, req.params.id);
  success(res, contract, 'Contract retrieved');
});

const updateContract = asyncHandler(async (req, res) => {
  const contract = await contractService.updateContract(req.app.locals.db, req.params.id, req.body);
  success(res, contract, 'Contract updated');
});

const endContract = asyncHandler(async (req, res) => {
  const contract = await contractService.endContract(req.app.locals.db, req.params.id);
  success(res, contract, 'Contract ended');
});

module.exports = {
  createContract,
  endContract,
  getContract,
  listContracts,
  updateContract,
};
