import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './config/data-source';
import { ProductModule } from './modules/product/product.module';
import { CategoryModule } from './modules/category/category.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),
    ProductModule,
    CategoryModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
