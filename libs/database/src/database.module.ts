import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({})
export class DatabaseModule {
  static forService(prefix: string): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) => ({
            type: 'mysql',
            host: configService.getOrThrow(`${prefix}_DB_HOST`),
            port: parseInt(configService.getOrThrow(`${prefix}_DB_PORT`)),
            username: configService.getOrThrow(`${prefix}_DB_USER`),
            password: configService.getOrThrow(`${prefix}_DB_PASSWORD`),
            database: configService.getOrThrow(`${prefix}_DB_NAME`),
            autoLoadEntities: true,
            synchronize: configService.getOrThrow('DB_SYNCHRONIZE') === 'true',
          }),
          inject: [ConfigService],
        }),
      ],
    };
  }
}
