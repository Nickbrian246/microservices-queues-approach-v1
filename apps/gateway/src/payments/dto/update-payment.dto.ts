import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdatePaymentDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  orderId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  amount?: number;

  @IsOptional()
  @IsString()
  status?: string;
}
