import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('int', { unsigned: true })
  productId!: number;

  @Column('int', { unsigned: true })
  quantity!: number;

  @Column('int', { unsigned: true })
  totalPrice!: number;

  @Column({ default: 'pending' })
  status!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @DeleteDateColumn()
  deleted_at!: Date | null;
}
