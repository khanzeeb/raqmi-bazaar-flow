import express from 'express';

const router = express.Router();

// Payment routes
router.get('/', (req, res) => {
  res.json({ message: 'Get payments endpoint - Order Service' });
});

router.post('/', (req, res) => {
  res.json({ message: 'Create payment endpoint - Order Service' });
});

router.get('/:id', (req, res) => {
  res.json({ message: `Get payment ${req.params.id} - Order Service` });
});

export default router;