import db from '../config/database';
import bcrypt from 'bcryptjs';

export interface UserData {
  id?: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'user';
  status: 'active' | 'inactive';
  last_login?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface UserFilters {
  role?: string;
  status?: string;
  search?: string;
}

class User {
  static get tableName(): string {
    return 'users';
  }

  static async findById(id: string): Promise<UserData | null> {
    const user = await db(this.tableName).where({ id }).first();
    return user || null;
  }

  static async findByEmail(email: string): Promise<UserData | null> {
    const user = await db(this.tableName).where({ email }).first();
    return user || null;
  }

  static async create(userData: Omit<UserData, 'id' | 'created_at' | 'updated_at'>): Promise<UserData> {
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

  static async update(id: string, userData: Partial<UserData>): Promise<UserData> {
    const updateData: any = { ...userData };
    
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 12);
    }
    
    const [user] = await db(this.tableName)
      .where({ id })
      .update({
        ...updateData,
        updated_at: new Date()
      })
      .returning('*');
    
    return user;
  }

  static async delete(id: string): Promise<number> {
    return await db(this.tableName).where({ id }).del();
  }

  static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async findAll(filters: UserFilters = {}): Promise<UserData[]> {
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

export default User;