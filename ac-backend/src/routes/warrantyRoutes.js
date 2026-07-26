const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/warrantyController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/my',       restrictTo('customer'), ctrl.getMyWarranties);
router.post('/claim',   restrictTo('customer'), ctrl.claimWarranty);

router.get('/',         restrictTo('admin'), ctrl.getAllWarranties);
router.post('/',        restrictTo('admin'), ctrl.createWarranty);
router.put('/:id',      restrictTo('admin'), ctrl.updateWarranty);

module.exports = router;
