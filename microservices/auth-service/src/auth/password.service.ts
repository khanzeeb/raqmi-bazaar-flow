import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class PasswordService {
  private readonly saltRounds: number;
  private readonly pepperSecret: string;

  constructor() {
    this.saltRounds = parseInt(process.env.PASSWORD_SALT_ROUNDS || '12', 10);
    this.pepperSecret = process.env.PASSWORD_PEPPER || 'default-pepper-change-in-production';
  }

  /**
   * Hash a password with salt and pepper
   */
  async hashPassword(password: string): Promise<string> {
    const salt = crypto.randomBytes(16).toString('hex');
    const pepperedPassword = this.addPepper(password);
    const hash = await this.pbkdf2Hash(pepperedPassword, salt);
    return `${salt}:${hash}`;
  }

  /**
   * Verify a password against a hash
   */
  async verifyPassword(password: string, storedHash: string): Promise<boolean> {
    try {
      const [salt, hash] = storedHash.split(':');
      if (!salt || !hash) return false;
      
      const pepperedPassword = this.addPepper(password);
      const verifyHash = await this.pbkdf2Hash(pepperedPassword, salt);
      
      return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(verifyHash, 'hex'));
    } catch {
      return false;
    }
  }

  /**
   * Check if password meets strength requirements
   */
  validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (password.length > 128) {
      errors.push('Password must be less than 128 characters');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Check if password is in a list of common passwords
   */
  isCommonPassword(password: string): boolean {
    const commonPasswords = [
      'password', 'password123', '123456', '12345678', 'qwerty',
      'abc123', 'monkey', 'master', 'dragon', 'letmein',
      'iloveyou', 'admin', 'welcome', 'login', 'sunshine',
    ];
    return commonPasswords.includes(password.toLowerCase());
  }

  private addPepper(password: string): string {
    return crypto
      .createHmac('sha256', this.pepperSecret)
      .update(password)
      .digest('hex');
  }

  private pbkdf2Hash(password: string, salt: string): Promise<string> {
    return new Promise((resolve, reject) => {
      // 100,000 iterations, 64 bytes output, sha512
      crypto.pbkdf2(password, salt, 100000, 64, 'sha512', (err, derivedKey) => {
        if (err) reject(err);
        else resolve(derivedKey.toString('hex'));
      });
    });
  }
}
