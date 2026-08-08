const express = require('express');
const router = express.Router();
const {
  getPublicChecklist,
  getAllChecklistAdmin,
  createChecklistAdmin,
  updateChecklistAdmin,
  deleteChecklistAdmin,
} = require('../controllers/workChecklistController');

// Public / Serviceman Route: GET /api/v1/work-checklist
router.get('/', getPublicChecklist);

// Admin Management Routes: /api/v1/work-checklist/admin
router.get('/admin', getAllChecklistAdmin);
router.post('/admin', createChecklistAdmin);
router.put('/admin/:id', updateChecklistAdmin);
router.delete('/admin/:id', deleteChecklistAdmin);

module.exports = router;
