import { registerAs } from '@nestjs/config';
import { config as dotenvConfig } from 'dotenv';
import { Skill } from '../users/skill.entity';
import { User } from '../users/user.entity';
import { DataSource, DataSourceOptions } from 'typeorm';

dotenvConfig({ path: '.env' });

// Log environment variables to verify they are being loaded correctly
console.log('DATABASE_URL:', process.env.DATABASE_URL);

// console.log("DATABASE_URL:", process.env.DATABASE_URL); // If using DATABASE_URL

const config = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: ["dist/**/*.entity{.ts,.js}"], // where our entities reside
  migrations: ["dist/db/migrations/*{.ts,.js}"],
  autoLoadEntities: true,
  synchronize: true, // shouldn't really be used in production - may lose data
  ssl: true,
  extra: {
    ssl: {
      rejectUnauthorized: false,
    },
  },
} as DataSourceOptions;

export default registerAs('typeorm', () => config);
export const connectionSource = new DataSource(config);
