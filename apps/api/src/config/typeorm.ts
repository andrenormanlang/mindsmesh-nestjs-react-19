import { registerAs } from '@nestjs/config';
import { config as dotenvConfig } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

dotenvConfig({ path: '.env' });

const config = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: ["dist/**/*.entity{.ts,.js}"], 
  migrations: ["dist/db/migrations/*{.ts,.js}"],
  autoLoadEntities: true,
  synchronize: false, 
  ssl: true,
  extra: {
    ssl: {
      rejectUnauthorized: false,
    },
    connectionTimeoutMillis: 30000, // timeout for database connections
    idleTimeoutMillis: 30000,       // timeout for idle connections
    max: 10,                        // maximum number of database connections
  },
} as DataSourceOptions;

export default registerAs('typeorm', () => config);
export const connectionSource = new DataSource(config);
