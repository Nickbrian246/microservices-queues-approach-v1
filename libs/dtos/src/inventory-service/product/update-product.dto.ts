import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class UpdateProductDto {
  @IsInt()
  id: number;

  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;
}
