import { Request, Response } from 'express';
import { BaseController } from '../common/BaseController';
import { InvoiceService } from '../services/InvoiceService';

export class InvoiceController extends BaseController {
  private service: InvoiceService;

  constructor() {
    super();
    this.service = new InvoiceService();
  }

  getAll = this.asyncHandler(async (req: Request, res: Response) => {
    const filters = req.query;
    const result = await this.service.getAll(filters);
    return this.handleSuccess(res, result);
  });

  getById = this.asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const invoice = await this.findInvoiceOrFail(id, res);
    if (!invoice) return;
    return this.handleSuccess(res, invoice);
  });

  create = this.asyncHandler(async (req: Request, res: Response) => {
    if (!this.validateRequest(req, res)) return;
    const invoice = await this.service.create(req.body);
    return this.handleSuccess(res, invoice, 201);
  });

  update = this.asyncHandler(async (req: Request, res: Response) => {
    if (!this.validateRequest(req, res)) return;
    const { id } = req.params;
    const invoice = await this.service.update(id, req.body);
    
    if (!invoice) {
      return this.handleError(res, { message: 'Invoice not found' }, 404);
    }
    
    return this.handleSuccess(res, invoice);
  });

  delete = this.asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const deleted = await this.service.delete(id);
    
    if (!deleted) {
      return this.handleError(res, { message: 'Invoice not found' }, 404);
    }
    
    return this.handleSuccess(res, { message: 'Invoice deleted successfully' });
  });

  updateStatus = this.asyncHandler(async (req: Request, res: Response) => {
    if (!this.validateRequest(req, res)) return;
    const { id } = req.params;
    const { status } = req.body;
    
    const invoice = await this.service.updateStatus(id, status);
    
    if (!invoice) {
      return this.handleError(res, { message: 'Invoice not found' }, 404);
    }
    
    return this.handleSuccess(res, invoice);
  });

  recordPayment = this.asyncHandler(async (req: Request, res: Response) => {
    if (!this.validateRequest(req, res)) return;
    const { id } = req.params;
    
    const invoice = await this.service.recordPayment(id, req.body);
    
    if (!invoice) {
      return this.handleError(res, { message: 'Invoice not found' }, 404);
    }
    
    return this.handleSuccess(res, invoice);
  });

  markAsSent = this.asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const invoice = await this.service.markAsSent(id);
    
    if (!invoice) {
      return this.handleError(res, { message: 'Invoice not found' }, 404);
    }
    
    return this.handleSuccess(res, invoice);
  });

  markAsPaid = this.asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const invoice = await this.service.markAsPaid(id);
    
    if (!invoice) {
      return this.handleError(res, { message: 'Invoice not found' }, 404);
    }
    
    return this.handleSuccess(res, invoice);
  });

  generatePDF = this.asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const invoice = await this.findInvoiceOrFail(id, res);
    if (!invoice) return;
    
    const pdfBuffer = await this.service.generatePDF(id);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice.invoice_number}.pdf`);
    return res.send(pdfBuffer);
  });

  sendEmail = this.asyncHandler(async (req: Request, res: Response) => {
    if (!this.validateRequest(req, res)) return;
    const { id } = req.params;
    const invoice = await this.findInvoiceOrFail(id, res);
    if (!invoice) return;
    
    const sent = await this.service.sendEmail(id, req.body);
    
    if (!sent) {
      return this.handleError(res, { message: 'Failed to send email' }, 500);
    }
    
    return this.handleSuccess(res, { message: 'Invoice sent successfully' });
  });

  getStats = this.asyncHandler(async (req: Request, res: Response) => {
    const filters = req.query;
    const stats = await this.service.getStats(filters);
    return this.handleSuccess(res, stats);
  });

  getByStatus = this.asyncHandler(async (req: Request, res: Response) => {
    const filters = req.query;
    const result = await this.service.getByStatus(filters);
    return this.handleSuccess(res, result);
  });

  checkOverdue = this.asyncHandler(async (req: Request, res: Response) => {
    await this.service.checkOverdue();
    return this.handleSuccess(res, { message: 'Overdue check completed' });
  });

  private async findInvoiceOrFail(id: string, res: Response) {
    const invoice = await this.service.getById(id);
    if (!invoice) {
      this.handleError(res, { message: 'Invoice not found' }, 404);
      return null;
    }
    return invoice;
  }
}
