import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Translation from '../models/Translation';

class TranslationController {
  // Get all translations
  static async getAllTranslations(req: Request, res: Response): Promise<void> {
    try {
      const { category, search, language } = req.query as { 
        category?: string; 
        search?: string; 
        language?: string;
      };
      
      if (language) {
        const translations = await Translation.getByLanguage(language);
        res.json({
          success: true,
          data: translations
        });
        return;
      }
      
      const filters: any = {};
      if (category) filters.category = category;
      if (search) filters.search = search;
      
      const translations = await Translation.findAll(filters);
      
      res.json({
        success: true,
        data: translations
      });
    } catch (error) {
      console.error('Error fetching translations:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching translations',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get translations grouped by category
  static async getGroupedTranslations(req: Request, res: Response): Promise<void> {
    try {
      const grouped = await Translation.getGroupedByCategory();
      
      res.json({
        success: true,
        data: grouped
      });
    } catch (error) {
      console.error('Error fetching grouped translations:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching grouped translations',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get translation by key
  static async getTranslationByKey(req: Request, res: Response): Promise<void> {
    try {
      const { key } = req.params;
      const translation = await Translation.findByKey(key);
      
      if (!translation) {
        res.status(404).json({
          success: false,
          message: 'Translation not found'
        });
        return;
      }
      
      res.json({
        success: true,
        data: translation
      });
    } catch (error) {
      console.error('Error fetching translation:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching translation',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Create new translation
  static async createTranslation(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
        return;
      }

      const { key, en, ar, category = 'general', description } = req.body;
      
      // Check if key already exists
      const existing = await Translation.findByKey(key);
      if (existing) {
        res.status(409).json({
          success: false,
          message: 'Translation key already exists'
        });
        return;
      }

      const translation = await Translation.create({
        key,
        en,
        ar,
        category,
        description
      });

      res.status(201).json({
        success: true,
        message: 'Translation created successfully',
        data: translation
      });
    } catch (error) {
      console.error('Error creating translation:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating translation',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Update translation
  static async updateTranslation(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
        return;
      }

      const { id } = req.params;
      const { key, en, ar, category, description } = req.body;
      
      const existing = await Translation.findById(id);
      if (!existing) {
        res.status(404).json({
          success: false,
          message: 'Translation not found'
        });
        return;
      }

      // Check if key conflicts with another translation
      if (key && key !== existing.key) {
        const keyExists = await Translation.findByKey(key);
        if (keyExists) {
          res.status(409).json({
            success: false,
            message: 'Translation key already exists'
          });
          return;
        }
      }

      const translation = await Translation.update(id, {
        key,
        en,
        ar,
        category,
        description
      });

      res.json({
        success: true,
        message: 'Translation updated successfully',
        data: translation
      });
    } catch (error) {
      console.error('Error updating translation:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating translation',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Delete translation
  static async deleteTranslation(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const existing = await Translation.findById(id);
      if (!existing) {
        res.status(404).json({
          success: false,
          message: 'Translation not found'
        });
        return;
      }

      await Translation.delete(id);

      res.json({
        success: true,
        message: 'Translation deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting translation:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting translation',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Bulk import translations
  static async bulkImport(req: Request, res: Response): Promise<void> {
    try {
      const { translations } = req.body;
      
      if (!Array.isArray(translations)) {
        res.status(400).json({
          success: false,
          message: 'Translations must be an array'
        });
        return;
      }

      await Translation.bulkInsert(translations);

      res.json({
        success: true,
        message: `${translations.length} translations imported successfully`
      });
    } catch (error) {
      console.error('Error importing translations:', error);
      res.status(500).json({
        success: false,
        message: 'Error importing translations',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get categories
  static async getCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await Translation.getCategories();
      
      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching categories',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

export default TranslationController;