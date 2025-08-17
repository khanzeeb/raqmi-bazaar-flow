import express from 'express';

const router = express.Router();

// Customer routes
router.get('/', (req, res) => {
  res.json({ message: 'Get customers endpoint - Customer Service' });
});

router.post('/', (req, res) => {
  res.json({ message: 'Create customer endpoint - Customer Service' });
});

router.get('/:id', (req, res) => {
  res.json({ message: `Get customer ${req.params.id} - Customer Service` });
});

router.put('/:id', (req, res) => {
  res.json({ message: `Update customer ${req.params.id} - Customer Service` });
});

router.delete('/:id', (req, res) => {
  res.json({ message: `Delete customer ${req.params.id} - Customer Service` });
});

export default router;