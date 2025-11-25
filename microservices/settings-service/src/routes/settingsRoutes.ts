import express from 'express';

const router = express.Router();

router.get('/', (req, res) => res.json({ message: 'Get all settings' }));
router.get('/company', (req, res) => res.json({ message: 'Get company settings' }));
router.get('/system', (req, res) => res.json({ message: 'Get system settings' }));
router.get('/tax', (req, res) => res.json({ message: 'Get tax settings' }));
router.get('/payment', (req, res) => res.json({ message: 'Get payment settings' }));
router.get('/:key', (req, res) => res.json({ message: `Get setting ${req.params.key}` }));
router.put('/:key', (req, res) => res.json({ message: `Update setting ${req.params.key}` }));
router.post('/bulk', (req, res) => res.json({ message: 'Bulk update settings' }));

export default router;
