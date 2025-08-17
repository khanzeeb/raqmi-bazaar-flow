import express from 'express';

const router = express.Router();

// Supplier routes
router.get('/', (req, res) => {
  res.json({ message: 'Get suppliers endpoint - Customer Service' });
});

router.post('/', (req, res) => {
  res.json({ message: 'Create supplier endpoint - Customer Service' });
});

router.get('/:id', (req, res) => {
  res.json({ message: `Get supplier ${req.params.id} - Customer Service` });
});

router.put('/:id', (req, res) => {
  res.json({ message: `Update supplier ${req.params.id} - Customer Service` });
});

router.delete('/:id', (req, res) => {
  res.json({ message: `Delete supplier ${req.params.id} - Customer Service` });
});

export default router;