const express = require('express');

const roomController = require('../controllers/roomController');

const router = express.Router();

router.post('/', roomController.createRoom);
router.get('/', roomController.listRooms);
router.get('/:id', roomController.getRoom);
router.put('/:id', roomController.updateRoom);
router.delete('/:id', roomController.deleteRoom);

module.exports = router;
