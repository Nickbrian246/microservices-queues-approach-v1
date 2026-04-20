import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto, UpdateProductDto } from '@app/dtos';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(dto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(dto);
    return await this.productRepository.save(product);
  }

  async findAll(): Promise<Product[]> {
    return await this.productRepository.find();
  }

  async findOne(id: number): Promise<Product | null> {
    return await this.productRepository.findOne({ where: { id } });
  }

  async update(dto: UpdateProductDto): Promise<Product | null> {
    const { id, ...data } = dto;
    await this.productRepository.update(id, data);
    return await this.productRepository.findOne({ where: { id } });
  }

  async delete(id: number): Promise<void> {
    await this.productRepository.delete(id);
  }
}
