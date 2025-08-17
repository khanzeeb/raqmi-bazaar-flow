import knex from 'knex';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  client: 'pg',
  connection: {
    host: process.env.PRODUCT_DB_HOST || 'localhost',
    port: parseInt(process.env.PRODUCT_DB_PORT || '5432'),
    user: process.env.PRODUCT_DB_USER || 'postgres',
    password: process.env.PRODUCT_DB_PASSWORD || 'password',
    database: process.env.PRODUCT_DB_NAME || 'product_db'
  },
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    directory: './migrations',
    tableName: 'knex_migrations'
  },
  seeds: {
    directory: './seeds'
  }
};

const db = knex(config);

export default db;