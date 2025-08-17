import express from 'express';

const router = express.Router();

// Quotation routes
router.get('/', (req, res) => {
  res.json({ message: 'Get quotations endpoint - Order Service' });
});

router.post('/', (req, res) => {
  res.json({ message: 'Create quotation endpoint - Order Service' });
});

router.get('/:id', (req, res) => {
  res.json({ message: `Get quotation ${req.params.id} - Order Service` });
});

export default router;