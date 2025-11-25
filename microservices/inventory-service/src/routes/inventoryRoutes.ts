import express from 'express';

const router = express.Router();

router.get('/', (req, res) => res.json({ message: 'Get inventory' }));
router.post('/', (req, res) => res.json({ message: 'Create inventory record' }));
router.get('/low-stock', (req, res) => res.json({ message: 'Get low stock items' }));
router.get('/movements', (req, res) => res.json({ message: 'Get stock movements' }));
router.get('/stats', (req, res) => res.json({ message: 'Get inventory stats' }));
router.get('/:id', (req, res) => res.json({ message: `Get inventory ${req.params.id}` }));
router.put('/:id', (req, res) => res.json({ message: `Update inventory ${req.params.id}` }));
router.delete('/:id', (req, res) => res.json({ message: `Delete inventory ${req.params.id}` }));
router.post('/:id/adjust', (req, res) => res.json({ message: `Adjust stock ${req.params.id}` }));
router.post('/:id/transfer', (req, res) => res.json({ message: `Transfer stock ${req.params.id}` }));

export default router;
