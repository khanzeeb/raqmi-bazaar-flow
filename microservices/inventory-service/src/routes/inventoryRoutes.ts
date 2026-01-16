import express, { Request, Response } from 'express';

const router = express.Router();

// In-memory reservation store (replace with database in production)
const reservations = new Map<string, { items: Array<{ product_id: string; quantity: number }>; created_at: Date }>();

// Mock inventory data (replace with database query in production)
const getInventoryStock = async (productId: string): Promise<number> => {
  // TODO: Replace with actual database query
  // For now, return a mock available quantity
  return Math.floor(Math.random() * 100) + 10;
};

// Check stock availability for multiple items
router.post('/check-stock', async (req: Request, res: Response) => {
  try {
    const { items } = req.body as { items: Array<{ product_id: string; quantity: number; product_name?: string }> };

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        error: 'Items array is required',
      });
    }

    const checkResults = await Promise.all(
      items.map(async (item) => {
        const availableQuantity = await getInventoryStock(item.product_id);
        return {
          product_id: item.product_id,
          product_name: item.product_name,
          requested_quantity: item.quantity,
          available_quantity: availableQuantity,
          is_available: availableQuantity >= item.quantity,
        };
      })
    );

    const allAvailable = checkResults.every((result) => result.is_available);

    return res.json({
      success: true,
      available: allAvailable,
      items: checkResults,
    });
  } catch (error) {
    console.error('Stock check error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to check stock',
    });
  }
});

// Reserve inventory for a sale
router.post('/reserve', async (req: Request, res: Response) => {
  try {
    const { sale_id, items } = req.body as {
      sale_id?: string;
      items: Array<{ product_id: string; quantity: number }>;
    };

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        error: 'Items array is required',
      });
    }

    // Check availability first
    const checkResults = await Promise.all(
      items.map(async (item) => {
        const availableQuantity = await getInventoryStock(item.product_id);
        return {
          product_id: item.product_id,
          quantity: item.quantity,
          available: availableQuantity >= item.quantity,
        };
      })
    );

    const unavailableItems = checkResults.filter((r) => !r.available);
    if (unavailableItems.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient stock for some items',
        unavailable_items: unavailableItems,
      });
    }

    // Create reservation
    const reservationId = `res-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    reservations.set(reservationId, {
      items,
      created_at: new Date(),
    });

    // TODO: Actually deduct from available stock in database

    return res.json({
      success: true,
      reservation_id: reservationId,
      sale_id,
      items: items.map((item) => ({
        product_id: item.product_id,
        reserved_quantity: item.quantity,
      })),
    });
  } catch (error) {
    console.error('Reserve inventory error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to reserve inventory',
    });
  }
});

// Release reserved inventory
router.post('/release', async (req: Request, res: Response) => {
  try {
    const { reservation_id, sale_id } = req.body as {
      reservation_id: string;
      sale_id?: string;
    };

    if (!reservation_id) {
      return res.status(400).json({
        success: false,
        error: 'Reservation ID is required',
      });
    }

    const reservation = reservations.get(reservation_id);
    if (!reservation) {
      // Reservation might have already been released or expired
      return res.json({
        success: true,
        message: 'Reservation not found or already released',
      });
    }

    // TODO: Add back to available stock in database
    reservations.delete(reservation_id);

    return res.json({
      success: true,
      reservation_id,
      sale_id,
      message: 'Inventory released successfully',
    });
  } catch (error) {
    console.error('Release inventory error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to release inventory',
    });
  }
});

// Existing routes
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
