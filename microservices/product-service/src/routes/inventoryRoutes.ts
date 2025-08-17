import express from 'express';

const router = express.Router();

// Inventory routes
router.get('/', (req, res) => {
  res.json({ message: 'Get inventory endpoint - Product Service' });
});

router.patch('/:id/stock', (req, res) => {
  res.json({ message: `Update stock for product ${req.params.id} - Product Service` });
});

router.get('/low-stock', (req, res) => {
  res.json({ message: 'Get low stock products - Product Service' });
});

export default router;