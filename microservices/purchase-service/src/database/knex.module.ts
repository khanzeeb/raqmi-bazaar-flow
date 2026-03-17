import { Module, Global } from '@nestjs/common';
import knex, { Knex } from 'knex';
import knexConfig from '../../knexfile';

const KNEX_TOKEN = 'KNEX_CONNECTION';

const knexProvider = {
  provide: KNEX_TOKEN,
  useFactory: (): Knex => {
    const env = process.env.NODE_ENV || 'development';
    return knex(knexConfig[env]);
  },
};

@Global()
@Module({
  providers: [knexProvider],
  exports: [KNEX_TOKEN],
})
export class KnexModule {}

export { KNEX_TOKEN };
