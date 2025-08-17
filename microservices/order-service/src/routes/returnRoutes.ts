import express from 'express';

const router = express.Router();

// Return routes
router.get('/', (req, res) => {
  res.json({ message: 'Get returns endpoint - Order Service' });
});

router.post('/', (req, res) => {
  res.json({ message: 'Create return endpoint - Order Service' });
});

router.get('/:id', (req, res) => {
  res.json({ message: `Get return ${req.params.id} - Order Service` });
});

export default router;