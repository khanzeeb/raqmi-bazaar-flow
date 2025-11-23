import type { Knex } from 'knex';
import dotenv from 'dotenv';

dotenv.config();

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'postgresql',
    connection: {
      host: process.env.SETTINGS_DB_HOST || 'localhost',
      port: parseInt(process.env.SETTINGS_DB_PORT || '5432'),
      database: process.env.SETTINGS_DB_NAME || 'settings_db',
      user: process.env.SETTINGS_DB_USER || 'postgres',
      password: process.env.SETTINGS_DB_PASSWORD || 'password',
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './src/migrations',
      extension: 'ts',
    },
  },
  production: {
    client: 'postgresql',
    connection: {
      host: process.env.SETTINGS_DB_HOST,
      port: parseInt(process.env.SETTINGS_DB_PORT || '5432'),
      database: process.env.SETTINGS_DB_NAME,
      user: process.env.SETTINGS_DB_USER,
      password: process.env.SETTINGS_DB_PASSWORD,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './src/migrations',
      extension: 'ts',
    },
  },
};

export default config;
