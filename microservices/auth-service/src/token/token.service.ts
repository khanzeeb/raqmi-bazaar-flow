import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

export interface JwtPayload {
  sub: string; // user ID
  email: string;
  name?: string;
  avatar?: string;
  type: 'access' | 'refresh';
  iat: number;
  exp: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: Date;
  refreshTokenExpiresAt: Date;
}

@Injectable()
export class TokenService {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenTTL: number; // seconds
  private readonly refreshTokenTTL: number; // seconds

  constructor() {
    this.accessTokenSecret = process.env.JWT_ACCESS_SECRET || 'access-secret-change-in-production';
    this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET || 'refresh-secret-change-in-production';
    this.accessTokenTTL = parseInt(process.env.JWT_ACCESS_TTL || '3600', 10); // 1 hour
    this.refreshTokenTTL = parseInt(process.env.JWT_REFRESH_TTL || '604800', 10); // 7 days
  }

  /**
   * Generate access and refresh tokens for a user
   */
  generateTokenPair(user: { id: string; email: string; name?: string; avatar?: string }): TokenPair {
    const now = Math.floor(Date.now() / 1000);

    const accessPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      type: 'access',
      iat: now,
      exp: now + this.accessTokenTTL,
    };

    const refreshPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      type: 'refresh',
      iat: now,
      exp: now + this.refreshTokenTTL,
    };

    return {
      accessToken: this.signToken(accessPayload, this.accessTokenSecret),
      refreshToken: this.signToken(refreshPayload, this.refreshTokenSecret),
      accessTokenExpiresAt: new Date((now + this.accessTokenTTL) * 1000),
      refreshTokenExpiresAt: new Date((now + this.refreshTokenTTL) * 1000),
    };
  }

  /**
   * Verify an access token
   */
  verifyAccessToken(token: string): JwtPayload {
    return this.verifyToken(token, this.accessTokenSecret, 'access');
  }

  /**
   * Verify a refresh token
   */
  verifyRefreshToken(token: string): JwtPayload {
    return this.verifyToken(token, this.refreshTokenSecret, 'refresh');
  }

  /**
   * Decode token without verification (for debugging)
   */
  decodeToken(token: string): JwtPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      return JSON.parse(Buffer.from(this.base64UrlDecode(parts[1])).toString('utf-8'));
    } catch {
      return null;
    }
  }

  /**
   * Generate a random token for password reset, email verification, etc.
   */
  generateRandomToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Hash a token for storage
   */
  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private signToken(payload: JwtPayload, secret: string): string {
    const header = { alg: 'HS256', typ: 'JWT' };
    const headerB64 = this.base64UrlEncode(JSON.stringify(header));
    const payloadB64 = this.base64UrlEncode(JSON.stringify(payload));
    const signature = this.createSignature(headerB64, payloadB64, secret);
    const signatureB64 = this.base64UrlEncode(signature);
    return `${headerB64}.${payloadB64}.${signatureB64}`;
  }

  private verifyToken(token: string, secret: string, expectedType: 'access' | 'refresh'): JwtPayload {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }

    const [headerB64, payloadB64, signatureB64] = parts;

    // Verify signature
    const expectedSignature = this.createSignature(headerB64, payloadB64, secret);
    const actualSignature = this.base64UrlDecode(signatureB64);

    if (!crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(actualSignature))) {
      throw new Error('Invalid token signature');
    }

    // Decode payload
    const payload = JSON.parse(
      Buffer.from(this.base64UrlDecode(payloadB64)).toString('utf-8')
    ) as JwtPayload;

    // Verify type
    if (payload.type !== expectedType) {
      throw new Error(`Invalid token type. Expected ${expectedType}`);
    }

    // Verify expiration
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      throw new Error('Token has expired');
    }

    return payload;
  }

  private createSignature(headerB64: string, payloadB64: string, secret: string): string {
    const hmac = crypto.createHmac('sha256', secret);
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
