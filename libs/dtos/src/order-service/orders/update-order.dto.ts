import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateOrderDto {
  @IsInt()
  id: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  productId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  totalPrice?: number;

  @IsOptional()
  @IsString()
  status?: string;
}
