import express from 'express';

const router = express.Router();

// Sales routes
router.get('/', (req, res) => {
  res.json({ message: 'Get sales endpoint - Order Service' });
});

router.post('/', (req, res) => {
  res.json({ message: 'Create sale endpoint - Order Service' });
});

router.get('/:id', (req, res) => {
  res.json({ message: `Get sale ${req.params.id} - Order Service` });
});

router.put('/:id', (req, res) => {
  res.json({ message: `Update sale ${req.params.id} - Order Service` });
});

router.delete('/:id', (req, res) => {
  res.json({ message: `Delete sale ${req.params.id} - Order Service` });
});

export default router;