const tenantService = require('../services/tenantService');
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');

const createTenant = asyncHandler(async (req, res) => {
  const tenant = await tenantService.createTenant(req.app.locals.db, req.body);
  success(res, tenant, 'Tenant created', 201);
});

const listTenants = asyncHandler(async (req, res) => {
  const tenants = await tenantService.listTenants(req.app.locals.db);
  success(res, tenants, 'Tenants retrieved');
});

const getTenant = asyncHandler(async (req, res) => {
  const tenant = await tenantService.getTenantById(req.app.locals.db, req.params.id);
  success(res, tenant, 'Tenant retrieved');
});

const updateTenant = asyncHandler(async (req, res) => {
  const tenant = await tenantService.updateTenant(req.app.locals.db, req.params.id, req.body);
  success(res, tenant, 'Tenant updated');
});

const deleteTenant = asyncHandler(async (req, res) => {
  const result = await tenantService.deleteTenant(req.app.locals.db, req.params.id);
  success(res, result, 'Tenant deleted');
});

module.exports = {
  createTenant,
  deleteTenant,
  getTenant,
  listTenants,
  updateTenant,
};
