import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PRODUCT_PATTERNS } from '@app/patterns';
import { MICROSERVICE_NAMES } from '@app/providers';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @Inject(MICROSERVICE_NAMES.INVENTORY)
    private readonly inventoryClient: ClientProxy,
  ) {}

  create(dto: CreateProductDto) {
    return this.inventoryClient.send(PRODUCT_PATTERNS.CREATE, dto);
  }

  findAll() {
    return this.inventoryClient.send(PRODUCT_PATTERNS.FIND_ALL, {});
  }

  findOne(id: number) {
    return this.inventoryClient.send(PRODUCT_PATTERNS.FIND_ONE, id);
  }

  update(id: number, dto: UpdateProductDto) {
    return this.inventoryClient.send(PRODUCT_PATTERNS.UPDATE, { id, ...dto });
  }

  delete(id: number) {
    return this.inventoryClient.send(PRODUCT_PATTERNS.DELETE, id);
  }
}
