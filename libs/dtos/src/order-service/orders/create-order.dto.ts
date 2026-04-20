import { IsInt, Min } from 'class-validator';

export class CreateOrderDto {
  @IsInt()
  @Min(1)
  productId: number;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsInt()
  @Min(0)
  totalPrice: number;
}
