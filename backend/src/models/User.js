const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static get tableName() {
    return 'users';
  }

  static async findById(id) {
    return await db(this.tableName).where({ id }).first();
  }

  static async findByEmail(email) {
    return await db(this.tableName).where({ email }).first();
  }

  static async create(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    
    const [user] = await db(this.tableName)
      .insert({
        ...userData,
        password: hashedPassword,
        created_at: new Date(),
        updated_at: new Date()
      })
      .returning('*');
    
    return user;
  }

  static async update(id, userData) {
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 12);
    }
    
    const [user] = await db(this.tableName)
      .where({ id })
      .update({
        ...userData,
        updated_at: new Date()
      })
      .returning('*');
    
    return user;
  }

  static async delete(id) {
    return await db(this.tableName).where({ id }).del();
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async findAll(filters = {}) {
    let query = db(this.tableName).select('id', 'name', 'email', 'role', 'status', 'created_at');
    
    if (filters.role) {
      query = query.where('role', filters.role);
    }
    
    if (filters.status) {
      query = query.where('status', filters.status);
    }
    
    if (filters.search) {
      query = query.where(function() {
        this.where('name', 'ilike', `%${filters.search}%`)
            .orWhere('email', 'ilike', `%${filters.search}%`);
      });
    }
    
    return await query.orderBy('created_at', 'desc');
  }
}

module.exports = User;