const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/quoteController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.use(protect);
router.post('/',          restrictTo('customer'), ctrl.createQuote);
router.get('/my',         restrictTo('customer'), ctrl.getMyQuotes);
router.put('/:id/accept', restrictTo('customer'), ctrl.acceptQuote);

router.get('/',    restrictTo('admin'), ctrl.getAllQuotes);
router.put('/:id', restrictTo('admin'), ctrl.respondToQuote);

module.exports = router;
