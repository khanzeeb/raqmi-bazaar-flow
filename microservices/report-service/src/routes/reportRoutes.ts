import express from 'express';

const router = express.Router();

router.get('/', (req, res) => res.json({ message: 'Get reports' }));
router.post('/', (req, res) => res.json({ message: 'Create report' }));
router.get('/sales', (req, res) => res.json({ message: 'Sales reports' }));
router.get('/inventory', (req, res) => res.json({ message: 'Inventory reports' }));
router.get('/financial', (req, res) => res.json({ message: 'Financial reports' }));
router.get('/:id', (req, res) => res.json({ message: `Get report ${req.params.id}` }));
router.put('/:id', (req, res) => res.json({ message: `Update report ${req.params.id}` }));
router.delete('/:id', (req, res) => res.json({ message: `Delete report ${req.params.id}` }));

export default router;
