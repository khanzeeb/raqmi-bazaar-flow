import express from 'express';
import { InventoryController } from '../controllers/InventoryController';

const router = express.Router();
const inventoryController = new InventoryController();

// Stock check endpoints for pre-sale validation
router.post('/check-stock', inventoryController.checkStock);
router.get('/check-stock/:productId', inventoryController.checkSingleProductStock);

export default router;
