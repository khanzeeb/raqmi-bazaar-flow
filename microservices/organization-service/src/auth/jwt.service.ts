import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';

export interface JwtPayload {
  sub: string; // user ID
  email: string;
  name?: string;
  avatar?: string;
  iat: number;
  exp: number;
}

export interface DecodedToken {
  header: { alg: string; typ: string };
  payload: JwtPayload;
  signature: string;
}

@Injectable()
export class JwtService {
  private readonly secret: string;
  private readonly issuer: string;

  constructor() {
    this.secret = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';
    this.issuer = process.env.JWT_ISSUER || 'auth-service';
  }

  /**
   * Verify and decode a JWT token
   */
  async verifyToken(token: string): Promise<JwtPayload> {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new UnauthorizedException('Invalid token format');
      }

      const [headerB64, payloadB64, signatureB64] = parts;

      // Verify signature
      const expectedSignature = this.createSignature(headerB64, payloadB64);
      const actualSignature = this.base64UrlDecode(signatureB64);

      if (!crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(actualSignature))) {
        throw new UnauthorizedException('Invalid token signature');
      }

      // Decode payload
      const payload = JSON.parse(
        Buffer.from(this.base64UrlDecode(payloadB64)).toString('utf-8')
      ) as JwtPayload;

      // Verify expiration
      if (payload.exp && Date.now() >= payload.exp * 1000) {
        throw new UnauthorizedException('Token has expired');
      }

      return payload;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid token');
    }
  }

  /**
   * Decode token without verification (for debugging)
   */
  decodeToken(token: string): DecodedToken | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      return {
        header: JSON.parse(Buffer.from(this.base64UrlDecode(parts[0])).toString('utf-8')),
        payload: JSON.parse(Buffer.from(this.base64UrlDecode(parts[1])).toString('utf-8')),
        signature: parts[2],
      };
    } catch {
      return null;
    }
  }

  /**
   * Generate a JWT token (for testing purposes)
   */
  generateToken(payload: Omit<JwtPayload, 'iat' | 'exp'>, expiresIn: number = 3600): string {
    const header = { alg: 'HS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);

    const fullPayload: JwtPayload = {
      ...payload,
      iat: now,
      exp: now + expiresIn,
    };

    const headerB64 = this.base64UrlEncode(JSON.stringify(header));
    const payloadB64 = this.base64UrlEncode(JSON.stringify(fullPayload));
    const signature = this.createSignature(headerB64, payloadB64);
    const signatureB64 = this.base64UrlEncode(signature);

    return `${headerB64}.${payloadB64}.${signatureB64}`;
  }

  private createSignature(headerB64: string, payloadB64: string): string {
    const hmac = crypto.createHmac('sha256', this.secret);
    hmac.update(`${headerB64}.${payloadB64}`);
    return hmac.digest('base64');
  }

  private base64UrlEncode(str: string): string {
    return Buffer.from(str)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  private base64UrlDecode(str: string): string {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const padding = base64.length % 4;
    if (padding) {
      base64 += '='.repeat(4 - padding);
    }
    return Buffer.from(base64, 'base64').toString('binary');
  }
}
