import { Knex } from 'knex';
import dotenv from 'dotenv';

dotenv.config();

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'postgresql',
    connection: {
      host: process.env.PURCHASE_DB_HOST || 'localhost',
      port: parseInt(process.env.PURCHASE_DB_PORT || '5432'),
      user: process.env.PURCHASE_DB_USER || 'postgres',
      password: process.env.PURCHASE_DB_PASSWORD || 'password',
      database: process.env.PURCHASE_DB_NAME || 'purchase_db',
    },
    migrations: {
      directory: './src/migrations',
      extension: 'ts',
    },
    seeds: {
      directory: './src/seeds',
    },
  },
  production: {
    client: 'postgresql',
    connection: {
      host: process.env.PURCHASE_DB_HOST,
      port: parseInt(process.env.PURCHASE_DB_PORT || '5432'),
      user: process.env.PURCHASE_DB_USER,
      password: process.env.PURCHASE_DB_PASSWORD,
      database: process.env.PURCHASE_DB_NAME,
    },
    migrations: {
      directory: './src/migrations',
      extension: 'ts',
    },
    pool: {
      min: 2,
      max: 10,
    },
  },
};

export default config;
