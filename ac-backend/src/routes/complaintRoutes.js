const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  getComplaintByTicket,
  getFaqs,
} = require('../controllers/complaintController');

const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Public — FAQs don't need auth
router.get('/faqs', getFaqs);

// Auth required
router.use(protect);

router.post(
  '/',
  [
    body('subject').trim().notEmpty().withMessage('Complaint subject is required'),
    body('description').trim().notEmpty().withMessage('Complaint details are required'),
    body('bookingId').optional().isMongoId().withMessage('Invalid booking ID'),
  ],
  validate,
  createComplaint
);

router.get('/', getMyComplaints);
router.get('/ticket/:ticketNumber', getComplaintByTicket);
router.get('/:id', getComplaintById);

module.exports = router;
