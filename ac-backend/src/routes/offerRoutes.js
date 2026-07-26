const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/offerController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.get('/',        ctrl.getActiveOffers);                              // public
router.get('/all',     protect, restrictTo('admin'), ctrl.getAllOffers);   // admin
router.post('/validate', protect, ctrl.validateOffer);                     // any logged-in user

router.post('/',      protect, restrictTo('admin'), ctrl.createOffer);
router.put('/:id',    protect, restrictTo('admin'), ctrl.updateOffer);
router.delete('/:id', protect, restrictTo('admin'), ctrl.deleteOffer);

module.exports = router;
