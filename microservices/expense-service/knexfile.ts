import type { Knex } from 'knex';
import dotenv from 'dotenv';

dotenv.config();

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'postgresql',
    connection: {
      host: process.env.EXPENSE_DB_HOST || 'localhost',
      port: parseInt(process.env.EXPENSE_DB_PORT || '5432'),
      database: process.env.EXPENSE_DB_NAME || 'expense_db',
      user: process.env.EXPENSE_DB_USER || 'postgres',
      password: process.env.EXPENSE_DB_PASSWORD || 'password',
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
      host: process.env.EXPENSE_DB_HOST,
      port: parseInt(process.env.EXPENSE_DB_PORT || '5432'),
      database: process.env.EXPENSE_DB_NAME,
      user: process.env.EXPENSE_DB_USER,
      password: process.env.EXPENSE_DB_PASSWORD,
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
