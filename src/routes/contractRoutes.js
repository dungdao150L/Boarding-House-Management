const express = require('express');

const contractController = require('../controllers/contractController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authenticate, authorize('admin'));

router.post('/', contractController.createContract);
router.get('/', contractController.listContracts);
router.get('/:id', contractController.getContract);
router.put('/:id', contractController.updateContract);
router.patch('/:id/end', contractController.endContract);

module.exports = router;
