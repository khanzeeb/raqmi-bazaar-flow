import knex from 'knex';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  client: 'pg',
  connection: {
    host: process.env.CUSTOMER_DB_HOST || 'localhost',
    port: parseInt(process.env.CUSTOMER_DB_PORT || '5434'),
    user: process.env.CUSTOMER_DB_USER || 'postgres',
    password: process.env.CUSTOMER_DB_PASSWORD || 'password',
    database: process.env.CUSTOMER_DB_NAME || 'customer_db'
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