import express from 'express';
// Import your existing ProductController from the monolith
// You'll need to copy it to this service

const router = express.Router();

// Product routes
router.get('/', (req, res) => {
  res.json({ message: 'Get products endpoint - Product Service' });
});

router.post('/', (req, res) => {
  res.json({ message: 'Create product endpoint - Product Service' });
});

router.get('/:id', (req, res) => {
  res.json({ message: `Get product ${req.params.id} - Product Service` });
});

router.put('/:id', (req, res) => {
  res.json({ message: `Update product ${req.params.id} - Product Service` });
});

router.delete('/:id', (req, res) => {
  res.json({ message: `Delete product ${req.params.id} - Product Service` });
});

export default router;