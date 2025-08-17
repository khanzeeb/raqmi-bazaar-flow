import express from 'express';
import { auth } from '../middleware/auth';

const router = express.Router();

// Placeholder routes for reports
router.get('/', auth, (req, res) => {
  res.json({ message: 'Report routes not implemented yet' });
});

router.get('/sales', auth, (req, res) => {
  res.json({ message: 'Sales reports not implemented yet' });
});

router.get('/inventory', auth, (req, res) => {
  res.json({ message: 'Inventory reports not implemented yet' });
});

router.get('/financial', auth, (req, res) => {
  res.json({ message: 'Financial reports not implemented yet' });
});

export default router;