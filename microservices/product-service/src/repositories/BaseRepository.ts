// Base Repository - DRY: Common Prisma operations
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export abstract class BaseRepository {
  protected prisma = prisma;

  protected async withTransaction<R>(callback: (tx: any) => Promise<R>): Promise<R> {
    return this.prisma.$transaction(callback);
  }
}

export default BaseRepository;
