import express from 'express';

const router = express.Router();

router.get('/', (req, res) => res.json({ message: 'Get returns' }));
router.post('/', (req, res) => res.json({ message: 'Create return' }));
router.get('/stats', (req, res) => res.json({ message: 'Get return stats' }));
router.get('/:id', (req, res) => res.json({ message: `Get return ${req.params.id}` }));
router.put('/:id', (req, res) => res.json({ message: `Update return ${req.params.id}` }));
router.delete('/:id', (req, res) => res.json({ message: `Delete return ${req.params.id}` }));
router.post('/:id/process', (req, res) => res.json({ message: `Process return ${req.params.id}` }));
router.post('/:id/approve', (req, res) => res.json({ message: `Approve return ${req.params.id}` }));
router.post('/:id/reject', (req, res) => res.json({ message: `Reject return ${req.params.id}` }));

export default router;
