import { Knex } from 'knex';

/** Adds additional postgres indexes for query performance. */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(
    `CREATE INDEX IF NOT EXISTS idx_returns_status_date ON returns (status, return_date DESC)`,
  );
  await knex.raw(
    `CREATE INDEX IF NOT EXISTS idx_return_items_product ON return_items (product_id, return_id)`,
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`DROP INDEX IF EXISTS idx_returns_status_date`);
  await knex.raw(`DROP INDEX IF EXISTS idx_return_items_product`);
}
