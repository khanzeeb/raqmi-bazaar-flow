import knex from 'knex';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  client: 'pg',
  connection: {
    host: process.env.ORDER_DB_HOST || 'localhost',
    port: parseInt(process.env.ORDER_DB_PORT || '5433'),
    user: process.env.ORDER_DB_USER || 'postgres',
    password: process.env.ORDER_DB_PASSWORD || 'password',
    database: process.env.ORDER_DB_NAME || 'order_db'
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