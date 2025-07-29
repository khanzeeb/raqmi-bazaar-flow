const Translation = require('../models/Translation');
const { validationResult } = require('express-validator');

class TranslationController {
  // Get all translations
  static async getAllTranslations(req, res) {
    try {
      const { category, search, language } = req.query;
      
      if (language) {
        const translations = await Translation.getByLanguage(language);
        return res.json({
          success: true,
          data: translations
        });
      }
      
      const filters = {};
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
        error: error.message
      });
    }
  }

  // Get translations grouped by category
  static async getGroupedTranslations(req, res) {
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
        error: error.message
      });
    }
  }

  // Get translation by key
  static async getTranslationByKey(req, res) {
    try {
      const { key } = req.params;
      const translation = await Translation.findByKey(key);
      
      if (!translation) {
        return res.status(404).json({
          success: false,
          message: 'Translation not found'
        });
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
        error: error.message
      });
    }
  }

  // Create new translation
  static async createTranslation(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { key, en, ar, category = 'general', description } = req.body;
      
      // Check if key already exists
      const existing = await Translation.findByKey(key);
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'Translation key already exists'
        });
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
        error: error.message
      });
    }
  }

  // Update translation
  static async updateTranslation(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const { key, en, ar, category, description } = req.body;
      
      const existing = await Translation.findById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Translation not found'
        });
      }

      // Check if key conflicts with another translation
      if (key && key !== existing.key) {
        const keyExists = await Translation.findByKey(key);
        if (keyExists) {
          return res.status(409).json({
            success: false,
            message: 'Translation key already exists'
          });
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
        error: error.message
      });
    }
  }

  // Delete translation
  static async deleteTranslation(req, res) {
    try {
      const { id } = req.params;
      
      const existing = await Translation.findById(id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Translation not found'
        });
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
        error: error.message
      });
    }
  }

  // Bulk import translations
  static async bulkImport(req, res) {
    try {
      const { translations } = req.body;
      
      if (!Array.isArray(translations)) {
        return res.status(400).json({
          success: false,
          message: 'Translations must be an array'
        });
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
        error: error.message
      });
    }
  }

  // Get categories
  static async getCategories(req, res) {
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
        error: error.message
      });
    }
  }
}

module.exports = TranslationController;