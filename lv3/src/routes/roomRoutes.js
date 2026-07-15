const express = require('express');

const roomController = require('../controllers/roomController');
const { authenticate, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authenticate);

router.post('/', authorize('admin', 'staff'), roomController.createRoom);
router.get('/', authorize('admin', 'staff'), roomController.listRooms);
router.get('/available', authorize('tenant'), roomController.listAvailableRooms);
router.post('/rental-requests', authorize('tenant'), roomController.createRentalRequest);
router.get('/rental-requests', authorize('admin'), roomController.listRentalRequests);
router.patch('/rental-requests/:id', authorize('admin'), roomController.updateRentalRequestStatus);
router.get('/:id', authorize('admin', 'staff'), roomController.getRoom);
router.put('/:id', authorize('admin', 'staff'), roomController.updateRoom);
router.delete('/:id', authorize('admin', 'staff'), roomController.deleteRoom);

module.exports = router;
