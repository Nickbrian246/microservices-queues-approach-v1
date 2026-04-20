import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PRODUCT_PATTERNS } from '@app/patterns';
import { CreateProductDto, UpdateProductDto } from '@app/dtos';
import { ProductService } from './product.service';

@Controller()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @MessagePattern(PRODUCT_PATTERNS.CREATE)
  create(@Payload() dto: CreateProductDto) {
    return this.productService.create(dto);
  }

  @MessagePattern(PRODUCT_PATTERNS.FIND_ALL)
  findAll() {
    return this.productService.findAll();
  }

  @MessagePattern(PRODUCT_PATTERNS.FIND_ONE)
  findOne(@Payload() id: number) {
    return this.productService.findOne(id);
  }

  @MessagePattern(PRODUCT_PATTERNS.UPDATE)
  update(@Payload() dto: UpdateProductDto) {
    return this.productService.update(dto);
  }

  @MessagePattern(PRODUCT_PATTERNS.DELETE)
  delete(@Payload() id: number) {
    return this.productService.delete(id);
  }
}
