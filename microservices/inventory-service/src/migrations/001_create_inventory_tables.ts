import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Inventory items
  await knex.schema.createTable('inventory_items', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('product_id').notNullable().unique();
    t.string('product_name').notNullable();
    t.string('sku').notNullable().unique();
    t.string('category');
    t.integer('current_stock').notNullable().defaultTo(0);
    t.integer('minimum_stock').notNullable().defaultTo(0);
    t.integer('maximum_stock').notNullable().defaultTo(0);
    t.decimal('unit_cost', 12, 2).notNullable().defaultTo(0);
    t.decimal('unit_price', 12, 2).notNullable().defaultTo(0);
    t.string('location');
    t.string('supplier');
    t.string('status').notNullable().defaultTo('in_stock');
    t.text('notes');
    t.timestamps(true, true);

    t.index(['product_id']);
    t.index(['sku']);
    t.index(['status']);
    t.index(['category']);
  });

  // Stock movements
  await knex.schema.createTable('stock_movements', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('product_id').notNullable();
    t.string('type').notNullable(); // in, out, adjustment, transfer
    t.integer('quantity').notNullable();
    t.string('reason');
    t.string('reference');
    t.integer('stock_before');
    t.integer('stock_after');
    t.timestamps(true, true);

    t.index(['product_id']);
    t.index(['type']);
    t.index(['created_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('stock_movements');
  await knex.schema.dropTableIfExists('inventory_items');
}
