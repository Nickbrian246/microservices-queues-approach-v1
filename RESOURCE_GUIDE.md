# How to Add a New Resource (Equivalent to `nest g resource`)

In a standard NestJS app, `nest g resource payments --no-spec` scaffolds everything in one command.
In this monorepo, the same result requires several manual steps spread across the microservice, shared libs, and the gateway. Follow this checklist every time.

---

## What `nest g resource` would generate (standard app)

```
src/payments/
  dto/
    create-payment.dto.ts
    update-payment.dto.ts
  entities/
    payment.entity.ts
  payments.controller.ts
  payments.module.ts
  payments.service.ts
```

## What the equivalent looks like here

```
apps/<service>/src/<resource>/
  entities/
    <resource>.entity.ts
  <resource>.controller.ts   ← @MessagePattern, NOT @Get/@Post
  <resource>.module.ts
  <resource>.service.ts

libs/dtos/src/<service>/<resource>/
  create-<resource>.dto.ts
  update-<resource>.dto.ts

libs/patterns/src/<service>/
  <resource>.patterns.ts

apps/gateway/src/<resource>/
  dto/
    create-<resource>.dto.ts
    update-<resource>.dto.ts
  <resource>.controller.ts   ← @Get/@Post HTTP decorators
  <resource>.module.ts
  <resource>.service.ts
```

---

## Step-by-step

### Step 1 — Create the entity

File: `apps/<service>/src/<resource>/entities/<resource>.entity.ts`

```typescript
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  // ... your fields
}
```

> Always use `!` on every property (definite assignment assertion). TypeORM populates
> them at runtime, not in the constructor.

---

### Step 2 — Create shared DTOs in `libs/dtos/`

File: `libs/dtos/src/<service>/<resource>/create-<resource>.dto.ts`

```typescript
import { IsInt, IsString, Min } from 'class-validator';

export class CreatePaymentDto {
  @IsInt()
  @Min(1)
  orderId: number;
}
```

File: `libs/dtos/src/<service>/<resource>/update-<resource>.dto.ts`

```typescript
import { IsInt, IsOptional, Min } from 'class-validator';

export class UpdatePaymentDto {
  @IsInt()
  id: number; // always include id — the microservice needs it to locate the record

  @IsOptional()
  @IsInt()
  @Min(1)
  orderId?: number;
}
```

Then export both from the barrel:

```typescript
// libs/dtos/src/index.ts  (append)
export * from './<service>/<resource>/create-<resource>.dto';
export * from './<service>/<resource>/update-<resource>.dto';
```

---

### Step 3 — Create message pattern constants in `libs/patterns/`

File: `libs/patterns/src/<service>/<resource>.patterns.ts`

```typescript
export const PAYMENT_PATTERNS = {
  CREATE:   'payment.create',
  FIND_ALL: 'payment.find_all',
  FIND_ONE: 'payment.find_one',
  UPDATE:   'payment.update',
  DELETE:   'payment.delete',
};
```

Then export from the barrel:

```typescript
// libs/patterns/src/index.ts  (append)
export * from './<service>/<resource>.patterns';
```

---

### Step 4 — Build the microservice module

**Controller** — uses `@MessagePattern`, never HTTP decorators:

```typescript
// apps/<service>/src/<resource>/<resource>.controller.ts
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PAYMENT_PATTERNS } from '@app/patterns';
import { CreatePaymentDto, UpdatePaymentDto } from '@app/dtos';
import { PaymentsService } from './payments.service';

@Controller()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @MessagePattern(PAYMENT_PATTERNS.CREATE)
  create(@Payload() dto: CreatePaymentDto) {
    return this.paymentsService.create(dto);
  }

  @MessagePattern(PAYMENT_PATTERNS.FIND_ALL)
  findAll() {
    return this.paymentsService.findAll();
  }

  @MessagePattern(PAYMENT_PATTERNS.FIND_ONE)
  findOne(@Payload() id: number) {
    return this.paymentsService.findOne(id);
  }

  @MessagePattern(PAYMENT_PATTERNS.UPDATE)
  update(@Payload() dto: UpdatePaymentDto) {
    return this.paymentsService.update(dto);
  }

  @MessagePattern(PAYMENT_PATTERNS.DELETE)
  delete(@Payload() id: number) {
    return this.paymentsService.delete(id);
  }
}
```

**Service** — plain TypeORM CRUD:

```typescript
// apps/<service>/src/<resource>/<resource>.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePaymentDto, UpdatePaymentDto } from '@app/dtos';
import { Payment } from './entities/payment.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  async create(dto: CreatePaymentDto): Promise<Payment> {
    const payment = this.paymentRepository.create(dto);
    return await this.paymentRepository.save(payment);
  }

  async findAll(): Promise<Payment[]> {
    return await this.paymentRepository.find();
  }

  async findOne(id: number): Promise<Payment | null> {
    return await this.paymentRepository.findOne({ where: { id } });
  }

  async update(dto: UpdatePaymentDto): Promise<Payment | null> {
    const { id, ...data } = dto;
    await this.paymentRepository.update(id, data);
    return await this.paymentRepository.findOne({ where: { id } });
  }

  async delete(id: number): Promise<void> {
    await this.paymentRepository.delete(id);
  }
}
```

**Module** — register the entity with TypeORM:

```typescript
// apps/<service>/src/<resource>/<resource>.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { Payment } from './entities/payment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payment])],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
```

**Register in the service root module:**

```typescript
// apps/<service>/src/<service>.module.ts
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule.forService('PAYMENT'),
    PaymentsModule,  // ← add this
  ],
})
export class PaymentServiceModule {}
```

---

### Step 5 — Build the gateway module

Gateway DTOs are **HTTP-layer only** — they do not include `id` (the id comes from the URL param):

```typescript
// apps/gateway/src/<resource>/dto/create-<resource>.dto.ts
export class CreatePaymentDto { /* same fields as lib DTO */ }

// apps/gateway/src/<resource>/dto/update-<resource>.dto.ts
export class UpdatePaymentDto { /* same fields as lib DTO but all optional, no id */ }
```

**Gateway service** — injects the `ClientProxy` and forwards calls:

```typescript
// apps/gateway/src/<resource>/<resource>.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PAYMENT_PATTERNS } from '@app/patterns';
import { MICROSERVICE_NAMES } from '@app/providers';

@Injectable()
export class PaymentsService {
  constructor(
    @Inject(MICROSERVICE_NAMES.PAYMENT)
    private readonly paymentClient: ClientProxy,
  ) {}

  create(dto: CreatePaymentDto) {
    return this.paymentClient.send(PAYMENT_PATTERNS.CREATE, dto);
  }

  findAll() {
    return this.paymentClient.send(PAYMENT_PATTERNS.FIND_ALL, {});
  }

  findOne(id: number) {
    return this.paymentClient.send(PAYMENT_PATTERNS.FIND_ONE, id);
  }

  update(id: number, dto: UpdatePaymentDto) {
    // merge id into the payload — the microservice UpdateDto requires it
    return this.paymentClient.send(PAYMENT_PATTERNS.UPDATE, { id, ...dto });
  }

  delete(id: number) {
    return this.paymentClient.send(PAYMENT_PATTERNS.DELETE, id);
  }
}
```

**Gateway controller** — uses HTTP decorators and `ParseIntPipe` for route params:

```typescript
// apps/gateway/src/<resource>/<resource>.controller.ts
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';

@Controller('<resource>')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  create(@Body() dto: CreatePaymentDto) {
    return this.paymentsService.create(dto);
  }

  @Get()
  findAll() {
    return this.paymentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.paymentsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePaymentDto) {
    return this.paymentsService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.paymentsService.delete(id);
  }
}
```

**Gateway module** — import the correct `ClientProvider` from `@app/providers`:

```typescript
// apps/gateway/src/<resource>/<resource>.module.ts
import { Module } from '@nestjs/common';
import { PaymentClientProvider } from '@app/providers';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentClientProvider],
})
export class PaymentsModule {}
```

**Register in GatewayModule:**

```typescript
// apps/gateway/src/gateway.module.ts
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [..., PaymentsModule],
})
export class GatewayModule {}
```

---

## Full checklist

- [ ] `apps/<service>/src/<resource>/entities/<resource>.entity.ts` — entity with `!` on every field
- [ ] `libs/dtos/src/<service>/<resource>/create-<resource>.dto.ts`
- [ ] `libs/dtos/src/<service>/<resource>/update-<resource>.dto.ts` — include `id` field
- [ ] `libs/dtos/src/index.ts` — export both DTOs
- [ ] `libs/patterns/src/<service>/<resource>.patterns.ts` — CREATE, FIND_ALL, FIND_ONE, UPDATE, DELETE
- [ ] `libs/patterns/src/index.ts` — export the patterns object
- [ ] `apps/<service>/src/<resource>/<resource>.controller.ts` — `@MessagePattern` handlers
- [ ] `apps/<service>/src/<resource>/<resource>.service.ts` — TypeORM CRUD
- [ ] `apps/<service>/src/<resource>/<resource>.module.ts` — `TypeOrmModule.forFeature([Entity])`
- [ ] `apps/<service>/src/<service>.module.ts` — import the new module
- [ ] `apps/gateway/src/<resource>/dto/create-<resource>.dto.ts`
- [ ] `apps/gateway/src/<resource>/dto/update-<resource>.dto.ts` — no `id` field
- [ ] `apps/gateway/src/<resource>/<resource>.service.ts` — `ClientProxy` + `send()`
- [ ] `apps/gateway/src/<resource>/<resource>.controller.ts` — HTTP decorators + `ParseIntPipe`
- [ ] `apps/gateway/src/<resource>/<resource>.module.ts` — `<Service>ClientProvider`
- [ ] `apps/gateway/src/gateway.module.ts` — import the new gateway module
