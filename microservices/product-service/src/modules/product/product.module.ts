import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../../entities/product.entity';
import { ProductVariant } from '../../entities/product-variant.entity';
import { StockMovement } from '../../entities/stock-movement.entity';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ProductEventService } from './events/product-event.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ProductVariant, StockMovement])],
  controllers: [ProductController],
  providers: [ProductService, ProductEventService],
  exports: [ProductService],
})
export class ProductModule {}
