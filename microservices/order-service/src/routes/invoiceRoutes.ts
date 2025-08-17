import express from 'express';

const router = express.Router();

// Invoice routes
router.get('/', (req, res) => {
  res.json({ message: 'Get invoices endpoint - Order Service' });
});

router.post('/', (req, res) => {
  res.json({ message: 'Create invoice endpoint - Order Service' });
});

router.get('/:id', (req, res) => {
  res.json({ message: `Get invoice ${req.params.id} - Order Service` });
});

export default router;