import { registerAs } from '@nestjs/config';
import { DataSourceOptions } from 'typeorm';

export const buildDataSourceOptions = (): DataSourceOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // Bulutli Postgres (masalan Neon) SSL ulanishni talab qiladi.
  ssl: process.env.DB_SSL === 'true',
  entities: [__dirname + '/../modules/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: false,
});

export default registerAs('database', buildDataSourceOptions);
