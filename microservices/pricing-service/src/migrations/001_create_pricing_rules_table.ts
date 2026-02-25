import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('pricing_rules', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('name').notNullable();
    t.text('description');
    t.string('type').notNullable(); // fixed, percentage, tiered, bundle
    t.decimal('value', 12, 4).notNullable();
    t.string('product_id');
    t.string('category_id');
    t.string('currency', 3).defaultTo('SAR');
    t.timestamp('start_date');
    t.timestamp('end_date');
    t.integer('min_quantity');
    t.integer('max_quantity');
    t.integer('priority').defaultTo(0);
    t.string('status').notNullable().defaultTo('active');
    t.timestamps(true, true);

    t.index(['product_id']);
    t.index(['category_id']);
    t.index(['status']);
    t.index(['type']);
    t.index(['priority']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('pricing_rules');
}
