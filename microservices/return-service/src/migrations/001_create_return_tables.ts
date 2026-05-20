import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('returns', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('return_number').notNullable().unique();
    t.uuid('sale_id').notNullable();
    t.uuid('customer_id').notNullable();
    t.date('return_date').notNullable();
    t.enum('return_type', ['full', 'partial']).notNullable();
    t.enum('reason', ['defective', 'wrong_item', 'not_needed', 'damaged', 'other']).notNullable();
    t.text('notes');
    t.decimal('total_amount', 12, 2).notNullable().defaultTo(0);
    t.decimal('refund_amount', 12, 2).notNullable().defaultTo(0);
    t.enum('refund_status', ['pending', 'processed', 'cancelled']).notNullable().defaultTo('pending');
    t.enum('status', ['pending', 'approved', 'rejected', 'completed']).notNullable().defaultTo('pending');
    t.uuid('processed_by');
    t.timestamp('processed_at');
    t.timestamps(true, true);

    t.index(['sale_id']);
    t.index(['customer_id']);
    t.index(['return_date']);
    t.index(['status']);
  });

  await knex.schema.createTable('return_items', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('return_id').notNullable().references('id').inTable('returns').onDelete('CASCADE');
    t.uuid('sale_item_id').notNullable();
    t.uuid('product_id').notNullable();
    t.string('product_name').notNullable();
    t.string('product_sku');
    t.integer('quantity_returned').notNullable();
    t.integer('original_quantity').notNullable();
    t.decimal('unit_price', 12, 2).notNullable();
    t.decimal('line_total', 12, 2).notNullable();
    t.enum('condition', ['good', 'damaged', 'defective', 'unopened']).notNullable().defaultTo('good');
    t.text('notes');
    t.timestamps(true, true);

    t.index(['return_id']);
    t.index(['sale_item_id']);
    t.index(['product_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('return_items');
  await knex.schema.dropTableIfExists('returns');
}
