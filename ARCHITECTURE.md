# Microservices Architecture Rules

## Project Structure Overview

```
apps/
  gateway/              → HTTP entry point for all external clients
  users-service/        → TCP microservice
  product-service/      → TCP microservice
  inventory-service/    → TCP microservice
  order-service/        → TCP microservice
  payment-service/      → TCP microservice
  shipping-service/     → TCP microservice
  audit-service/        → TCP microservice
  notification-service/ → TCP microservice

libs/
  database/    → shared TypeORM connection module
  providers/   → TCP ClientProxy providers + MICROSERVICE_NAMES tokens
  patterns/    → message pattern constants per microservice/module
  dtos/        → shared DTOs used between microservices
```

---

## Rule 1 — Gateway Contracts Stay Inside Gateway

Any DTO, interface, type, or utility that defines the contract between an **external HTTP client and the gateway** must live inside `apps/gateway/src/`.

```
apps/gateway/src/auth/
  dto/
    register.dto.ts   ✅
    sign-in.dto.ts    ✅
  interfaces/
    auth-response.interface.ts  ✅
```

**Why:** The gateway is the public API surface. Its contracts belong to it and should not be shared or leaked into shared libs. If the gateway's API changes, only the gateway is affected.

**Never do this:**
```
libs/dtos/src/gateway/auth/register.dto.ts  ❌
```

---

## Rule 2 — Microservice Contracts Live in `libs/`

Any DTO, interface, or type that a **microservice exposes via a MessagePattern** must live in `libs/dtos/`, mirroring the microservice's folder structure. This makes them available to any other microservice or the gateway that needs to talk to it.

**Folder structure mirrors the microservice location:**
```
Microservice file:  apps/users-service/src/auth/auth.controller.ts
Shared DTO:         libs/dtos/src/users-service/auth/register.dto.ts  ✅
                    libs/dtos/src/users-service/auth/sign-in.dto.ts   ✅
```

**Why:** When microservice A needs to send a message to microservice B, it needs to know the shape of the payload. Shared libs are the only correct place for that shared knowledge.

---

## Rule 3 — Message Patterns Live in `libs/patterns/`

Every `@MessagePattern` string constant must be defined in `libs/patterns/`, organized by microservice and module.

```
libs/patterns/src/
  users-service/
    auth.patterns.ts   → AUTH_PATTERNS.REGISTER, AUTH_PATTERNS.SIGN_IN
  order-service/
    orders.patterns.ts → ORDER_PATTERNS.CREATE, ORDER_PATTERNS.FIND_ALL
```

**Why:** Both the microservice controller (`@MessagePattern`) and the gateway service (`clientProxy.send()`) must use the exact same string. A single source of truth in `libs/patterns/` prevents mismatches.

**Never hardcode pattern strings:**
```typescript
// ❌ Wrong — string hardcoded in two places
this.usersClient.send('auth.register', dto);

// ✅ Correct — imported from shared lib
this.usersClient.send(AUTH_PATTERNS.REGISTER, dto);
```

---

## Rule 4 — One Database Per Microservice

Each microservice connects **only to its own database**. No microservice may connect to another service's database directly.

```
users-service    → users_db    (port 3314)
product-service  → product_db  (port 3307)
inventory-service → inventory_db (port 3308)
order-service    → order_db    (port 3309)
payment-service  → payment_db  (port 3310)
shipping-service → shipping_db (port 3311)
audit-service    → audit_db    (port 3312)
notification-service → notification_db (port 3313)
```

The database connection is configured via `DatabaseModule.forService('PREFIX')` using the prefix that maps to the service's env vars (`PREFIX_DB_HOST`, `PREFIX_DB_PORT`, etc.).

---

## Rule 5 — TCP Providers Live in `libs/providers/`

Every `ClientProxy` provider that connects to a microservice must be defined in `libs/providers/`. The injection token must use `MICROSERVICE_NAMES` from the same lib.

```
libs/providers/src/
  constants/
    microservice-names.ts  → MICROSERVICE_NAMES.USERS, MICROSERVICE_NAMES.PRODUCT ...
  users.provider.ts
  product.provider.ts
  ...
```

**How to use in a module:**
```typescript
// ✅ Import the provider and inject by token
@Module({
  providers: [AuthService, UsersClientProvider],
})
export class AuthModule {}

@Injectable()
export class AuthService {
  constructor(
    @Inject(MICROSERVICE_NAMES.USERS)
    private readonly usersClient: ClientProxy,
  ) {}
}
```

---

## Rule 6 — Microservice Controllers Use `@MessagePattern`, Not `@Get/@Post`

Microservice controllers must never use HTTP decorators. They are TCP listeners.

```typescript
// ✅ Correct — microservice controller
@Controller()
export class AuthController {
  @MessagePattern(AUTH_PATTERNS.REGISTER)
  register(@Payload() dto: RegisterDto) {
    return this.authService.register(dto);
  }
}

// ❌ Wrong — HTTP decorator in a microservice
@Controller('auth')
export class AuthController {
  @Post('register')
  register(@Body() dto: RegisterDto) { ... }
}
```

---

## Rule 7 — Only the Gateway Exposes HTTP

The gateway is the **only** app that uses `NestFactory.create()` and HTTP decorators (`@Get`, `@Post`, etc.). All other services use `NestFactory.createMicroservice()` with TCP transport.

```typescript
// ✅ gateway/src/main.ts
const app = await NestFactory.create(GatewayModule);

// ✅ any-service/src/main.ts
const app = await NestFactory.createMicroservice<MicroserviceOptions>(
  AnyServiceModule,
  { transport: Transport.TCP, options: { host, port } },
);
```

---

## Rule 8 — Validation at Both Boundaries

- **Gateway** — validates incoming HTTP payloads using `ValidationPipe` on gateway DTOs
- **Microservice** — validates incoming TCP payloads using `ValidationPipe` on lib DTOs

Both `main.ts` files must declare:
```typescript
app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
```

`whitelist: true` strips properties not declared in the DTO, preventing unexpected data from passing through.

---

## Rule 9 — Environment Variables Follow a Naming Convention

| Category | Pattern | Example |
|---|---|---|
| Microservice TCP port | `{SERVICE}_SERVICE_PORT` | `USER_SERVICE_PORT=3008` |
| DB host | `{SERVICE}_DB_HOST` | `USERS_DB_HOST=localhost` |
| DB port | `{SERVICE}_DB_PORT` | `USERS_DB_PORT=3314` |
| DB name | `{SERVICE}_DB_NAME` | `USERS_DB_NAME=users_db` |
| DB user | `{SERVICE}_DB_USER` | `USERS_DB_USER=user` |
| DB password | `{SERVICE}_DB_PASSWORD` | `USERS_DB_PASSWORD=...` |
| Shared TCP host | `MICROSERVICE_HOST` | `MICROSERVICE_HOST=localhost` |

Always use `configService.getOrThrow<string>('VAR_NAME')` — never `process.env.VAR_NAME` directly — so the app fails fast at startup if a variable is missing.

---

## Rule 10 — New Module Checklist

When adding a new feature module to a microservice:

- [ ] Run `nest generate module <name> --project <service> --no-spec`
- [ ] Run `nest generate controller <name> --project <service> --no-spec`
- [ ] Run `nest generate service <name> --project <service> --no-spec`
- [ ] Create the entity in `apps/<service>/src/<module>/entities/`
- [ ] Add `TypeOrmModule.forFeature([Entity])` to the module imports
- [ ] Create shared DTOs in `libs/dtos/src/<service>/<module>/`
- [ ] Create pattern constants in `libs/patterns/src/<service>/<module>.patterns.ts`
- [ ] Export new DTOs and patterns from their respective `index.ts` barrel files
- [ ] Create the corresponding HTTP module in `apps/gateway/src/<module>/`
- [ ] Add the `<Service>ClientProvider` to the gateway module's providers
- [ ] Create gateway-local DTOs in `apps/gateway/src/<module>/dto/`
