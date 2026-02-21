import { Router, Request, Response, NextFunction } from 'express';
import { QuotationService } from '../services/quotation.service';

const router = Router();

// Async handler wrapper
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);

// POST /api/quotations
router.post('/', asyncHandler(async (req, res) => {
  const quotation = await QuotationService.create(req.body);
  res.status(201).json({ success: true, data: QuotationService.mapToResponse(quotation), message: 'Quotation created successfully' });
}));

// GET /api/quotations
router.get('/', asyncHandler(async (req, res) => {
  const result = await QuotationService.findAll({
    page: req.query.page ? Number(req.query.page) : undefined,
    limit: req.query.limit ? Number(req.query.limit) : undefined,
    search: req.query.search as string,
    status: req.query.status as any,
    customer_id: req.query.customer_id as string,
    date_from: req.query.date_from as string,
    date_to: req.query.date_to as string,
    sort_by: req.query.sort_by as string,
    sort_order: req.query.sort_order as 'asc' | 'desc',
  });
  res.json({ success: true, data: result });
}));

// GET /api/quotations/stats
router.get('/stats', asyncHandler(async (req, res) => {
  const stats = await QuotationService.getStats({
    dateFrom: req.query.date_from as string,
    dateTo: req.query.date_to as string,
  });
  res.json({ success: true, data: stats });
}));

// GET /api/quotations/expired
router.get('/expired', asyncHandler(async (req, res) => {
  const quotations = await QuotationService.getExpired();
  res.json({ success: true, data: quotations });
}));

// GET /api/quotations/report
router.get('/report', asyncHandler(async (req, res) => {
  const report = await QuotationService.getReport({
    date_from: req.query.date_from as string,
    date_to: req.query.date_to as string,
    status: req.query.status as any,
  });
  res.json({ success: true, data: report });
}));

// POST /api/quotations/process-expired
router.post('/process-expired', asyncHandler(async (req, res) => {
  const count = await QuotationService.processExpired();
  res.json({ success: true, data: { processed_count: count }, message: `${count} expired quotations processed` });
}));

// GET /api/quotations/:id
router.get('/:id', asyncHandler(async (req, res) => {
  const quotation = await QuotationService.findOne(req.params.id);
  res.json({ success: true, data: QuotationService.mapToResponse(quotation) });
}));

// PUT /api/quotations/:id
router.put('/:id', asyncHandler(async (req, res) => {
  const quotation = await QuotationService.update(req.params.id, req.body);
  res.json({ success: true, data: QuotationService.mapToResponse(quotation), message: 'Quotation updated successfully' });
}));

// DELETE /api/quotations/:id
router.delete('/:id', asyncHandler(async (req, res) => {
  await QuotationService.remove(req.params.id);
  res.json({ success: true, message: 'Quotation deleted successfully' });
}));

// POST /api/quotations/:id/send
router.post('/:id/send', asyncHandler(async (req, res) => {
  const quotation = await QuotationService.send(req.params.id);
  res.json({ success: true, data: QuotationService.mapToResponse(quotation), message: 'Quotation sent successfully' });
}));

// POST /api/quotations/:id/accept
router.post('/:id/accept', asyncHandler(async (req, res) => {
  const quotation = await QuotationService.accept(req.params.id);
  res.json({ success: true, data: QuotationService.mapToResponse(quotation), message: 'Quotation accepted successfully' });
}));

// POST /api/quotations/:id/decline
router.post('/:id/decline', asyncHandler(async (req, res) => {
  const quotation = await QuotationService.decline(req.params.id, req.body.reason);
  res.json({ success: true, data: QuotationService.mapToResponse(quotation), message: 'Quotation declined successfully' });
}));

// POST /api/quotations/:id/convert-to-sale
router.post('/:id/convert-to-sale', asyncHandler(async (req, res) => {
  const result = await QuotationService.convertToSale(req.params.id);
  res.json({ success: true, data: result, message: 'Quotation converted to sale successfully' });
}));

// PATCH /api/quotations/:id/status
router.patch('/:id/status', asyncHandler(async (req, res) => {
  const quotation = await QuotationService.updateStatus(req.params.id, req.body.status);
  res.json({ success: true, data: QuotationService.mapToResponse(quotation), message: 'Status updated successfully' });
}));

export default router;
