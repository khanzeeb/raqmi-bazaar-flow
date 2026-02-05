/**
 * @deprecated This Express server has been replaced by NestJS.
 * Use src/main.ts as the new entry point.
 * 
 * Run: npx ts-node src/main.ts
 * Or with nest-cli: nest start
 */

// Re-export main for backward compatibility
console.warn('[product-service] server.ts is deprecated. Use main.ts (NestJS) instead.');
import './main';
