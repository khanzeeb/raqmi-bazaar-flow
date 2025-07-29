const knex = require('../config/database');

class Translation {
  static get tableName() {
    return 'translations';
  }

  // Get all translations
  static async findAll(filters = {}) {
    let query = knex(this.tableName);
    
    if (filters.category) {
      query = query.where('category', filters.category);
    }
    
    if (filters.search) {
      query = query.where(function() {
        this.where('key', 'like', `%${filters.search}%`)
            .orWhere('en', 'like', `%${filters.search}%`)
            .orWhere('ar', 'like', `%${filters.search}%`);
      });
    }
    
    return await query.orderBy('category').orderBy('key');
  }

  // Get translation by key
  static async findByKey(key) {
    return await knex(this.tableName).where('key', key).first();
  }

  // Get translations by language
  static async getByLanguage(language = 'en') {
    const translations = await knex(this.tableName).select('key', language);
    const result = {};
    translations.forEach(t => {
      result[t.key] = t[language];
    });
    return result;
  }

  // Get translations grouped by category
  static async getGroupedByCategory() {
    const translations = await knex(this.tableName).orderBy('category').orderBy('key');
    const grouped = {};
    
    translations.forEach(t => {
      if (!grouped[t.category]) {
        grouped[t.category] = [];
      }
      grouped[t.category].push(t);
    });
    
    return grouped;
  }

  // Create new translation
  static async create(data) {
    const [id] = await knex(this.tableName).insert(data);
    return await this.findById(id);
  }

  // Find by ID
  static async findById(id) {
    return await knex(this.tableName).where('id', id).first();
  }

  // Update translation
  static async update(id, data) {
    await knex(this.tableName).where('id', id).update({
      ...data,
      updated_at: new Date()
    });
    return await this.findById(id);
  }

  // Delete translation
  static async delete(id) {
    return await knex(this.tableName).where('id', id).del();
  }

  // Bulk insert translations
  static async bulkInsert(translations) {
    return await knex(this.tableName).insert(translations);
  }

  // Get all categories
  static async getCategories() {
    const result = await knex(this.tableName).distinct('category').orderBy('category');
    return result.map(r => r.category);
  }
}

module.exports = Translation;