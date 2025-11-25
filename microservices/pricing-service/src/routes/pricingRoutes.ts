import express from 'express';

const router = express.Router();

router.get('/', (req, res) => res.json({ message: 'Get pricing rules' }));
router.post('/', (req, res) => res.json({ message: 'Create pricing rule' }));
router.get('/calculate', (req, res) => res.json({ message: 'Calculate price' }));
router.get('/stats', (req, res) => res.json({ message: 'Get pricing stats' }));
router.get('/:id', (req, res) => res.json({ message: `Get pricing rule ${req.params.id}` }));
router.put('/:id', (req, res) => res.json({ message: `Update pricing rule ${req.params.id}` }));
router.delete('/:id', (req, res) => res.json({ message: `Delete pricing rule ${req.params.id}` }));
router.post('/:id/activate', (req, res) => res.json({ message: `Activate pricing rule ${req.params.id}` }));
router.post('/:id/deactivate', (req, res) => res.json({ message: `Deactivate pricing rule ${req.params.id}` }));

export default router;
