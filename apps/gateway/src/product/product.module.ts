import { Module } from '@nestjs/common';
import { InventoryClientProvider } from '@app/providers';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

@Module({
  controllers: [ProductController],
  providers: [ProductService, InventoryClientProvider],
})
export class ProductModule {}
