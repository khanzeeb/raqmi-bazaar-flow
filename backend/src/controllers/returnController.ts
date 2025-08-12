import { Request, Response } from 'express';
import ReturnService from '../services/returnService';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

class ReturnController {
  
  static async createReturn(req: Request, res: Response): Promise<void> {
    try {
      const { items, ...returnData } = req.body;
      const returnRecord = await ReturnService.createReturn(returnData, items);
      
      res.status(201).json({
        success: true,
        message: 'Return created successfully',
        data: returnRecord
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  static async getReturn(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const returnRecord = await ReturnService.getReturnById(parseInt(id));
      
      res.json({
        success: true,
        data: returnRecord
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  static async getReturns(req: Request, res: Response): Promise<void> {
    try {
      const filters = req.query;
      const returns = await ReturnService.getReturns(filters);
      
      res.json({
        success: true,
        data: returns
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  static async getSaleReturns(req: Request, res: Response): Promise<void> {
    try {
      const { saleId } = req.params;
      const returns = await ReturnService.getSaleReturns(parseInt(saleId));
      
      res.json({
        success: true,
        data: returns
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  static async updateReturn(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const returnRecord = await ReturnService.updateReturn(parseInt(id), req.body);
      
      res.json({
        success: true,
        message: 'Return updated successfully',
        data: returnRecord
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  static async deleteReturn(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await ReturnService.deleteReturn(parseInt(id));
      
      res.json({
        success: true,
        message: 'Return deleted successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  static async processReturn(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const processedBy = req.user?.id; // From auth middleware
      const returnRecord = await ReturnService.processReturn(parseInt(id), req.body, processedBy);
      
      res.json({
        success: true,
        message: 'Return processed successfully',
        data: returnRecord
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  static async getSaleStateBeforeReturn(req: Request, res: Response): Promise<void> {
    try {
      const { saleId, returnId } = req.params;
      const saleState = await ReturnService.getSaleStateBeforeReturn(
        parseInt(saleId), 
        returnId ? parseInt(returnId) : null
      );
      
      res.json({
        success: true,
        data: saleState
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  static async getSaleStateAfterReturn(req: Request, res: Response): Promise<void> {
    try {
      const { saleId, returnId } = req.params;
      const saleState = await ReturnService.getSaleStateAfterReturn(
        parseInt(saleId), 
        parseInt(returnId)
      );
      
      res.json({
        success: true,
        data: saleState
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  static async getReturnStats(req: Request, res: Response): Promise<void> {
    try {
      const filters = req.query;
      const stats = await ReturnService.getReturnStats(filters);
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  static async getReturnReport(req: Request, res: Response): Promise<void> {
    try {
      const filters = req.query;
      const report = await ReturnService.generateReturnReport(filters);
      
      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export default ReturnController;