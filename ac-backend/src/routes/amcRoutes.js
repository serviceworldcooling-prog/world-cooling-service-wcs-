const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { getPlans, getPlanById, subscribePlan, getMyPlan } = require('../controllers/amcController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Public — browse plans without login
router.get('/plans', getPlans);
router.get('/plans/:id', getPlanById);

// Auth required
router.get('/my-plan', protect, getMyPlan);

router.post(
  '/subscribe/:planId',
  protect,
  [
    body('paymentMethod')
      .optional()
      .isIn(['wallet', 'upi', 'card', 'cash'])
      .withMessage('Invalid payment method'),
  ],
  validate,
  subscribePlan
);

module.exports = router;
