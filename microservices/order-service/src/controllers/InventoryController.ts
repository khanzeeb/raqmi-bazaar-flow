import { Request, Response } from 'express';
import { BaseController } from '../common/BaseController';
import { createInventorySaga, SaleItemInput } from '../events/InventorySaga';

interface CheckStockRequest {
  items: Array<{
    product_id: string;
    product_name?: string;
    quantity: number;
  }>;
}

export class InventoryController extends BaseController {
  constructor() {
    super();
  }

  /**
   * Check stock availability for items before creating a sale
   * POST /api/inventory/check-stock
   */
  checkStock = async (req: Request, res: Response): Promise<void> => {
    await this.executeOperation(
      req,
      res,
      async () => {
        const { items } = req.body as CheckStockRequest;

        if (!items || !Array.isArray(items) || items.length === 0) {
          throw new Error('Items array is required and must not be empty');
        }

        // Validate each item has required fields
        for (const item of items) {
          if (!item.product_id) {
            throw new Error('Each item must have a product_id');
          }
          if (typeof item.quantity !== 'number' || item.quantity <= 0) {
            throw new Error('Each item must have a valid quantity greater than 0');
          }
        }

        const saga = createInventorySaga();
        const saleItems: SaleItemInput[] = items.map(item => ({
          product_id: item.product_id,
          product_name: item.product_name || '',
          quantity: item.quantity,
          unit_price: 0, // Not needed for stock check
        }));

        const result = await saga.checkOnly(saleItems);

        return {
          available: result.available,
          items: result.items,
          checked_at: new Date().toISOString(),
        };
      },
      'Stock check completed',
      'Failed to check stock'
    );
  };

  /**
   * Check stock for a single product
   * GET /api/inventory/check-stock/:productId
   */
  checkSingleProductStock = async (req: Request, res: Response): Promise<void> => {
    await this.executeOperation(
      req,
      res,
      async () => {
        const { productId } = req.params;
        const quantity = parseInt(req.query.quantity as string) || 1;

        if (!productId) {
          throw new Error('Product ID is required');
        }

        const saga = createInventorySaga();
        const saleItems: SaleItemInput[] = [{
          product_id: productId,
          product_name: '',
          quantity,
          unit_price: 0,
        }];

        const result = await saga.checkOnly(saleItems);
        const itemResult = result.items[0];

        return {
          product_id: productId,
          requested_quantity: quantity,
          available_quantity: itemResult?.available_quantity || 0,
          is_available: itemResult?.is_available || false,
          checked_at: new Date().toISOString(),
        };
      },
      'Stock check completed',
      'Failed to check stock'
    );
  };
}
