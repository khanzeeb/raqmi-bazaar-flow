const ReturnService = require('../services/returnService');

class ReturnController {
  
  static async createReturn(req, res) {
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
        message: error.message
      });
    }
  }
  
  static async getReturn(req, res) {
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
        message: error.message
      });
    }
  }
  
  static async getReturns(req, res) {
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
        message: error.message
      });
    }
  }
  
  static async getSaleReturns(req, res) {
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
        message: error.message
      });
    }
  }
  
  static async updateReturn(req, res) {
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
        message: error.message
      });
    }
  }
  
  static async deleteReturn(req, res) {
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
        message: error.message
      });
    }
  }
  
  static async processReturn(req, res) {
    try {
      const { id } = req.params;
      const processedBy = req.user.id; // From auth middleware
      const returnRecord = await ReturnService.processReturn(parseInt(id), req.body, processedBy);
      
      res.json({
        success: true,
        message: 'Return processed successfully',
        data: returnRecord
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
  
  static async getSaleStateBeforeReturn(req, res) {
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
        message: error.message
      });
    }
  }
  
  static async getSaleStateAfterReturn(req, res) {
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
        message: error.message
      });
    }
  }
  
  static async getReturnStats(req, res) {
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
        message: error.message
      });
    }
  }
  
  static async getReturnReport(req, res) {
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
        message: error.message
      });
    }
  }
}

module.exports = ReturnController;