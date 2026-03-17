import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('purchases', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('purchase_number').unique().notNullable();
    t.uuid('supplier_id').notNullable();
    t.date('purchase_date').notNullable();
    t.date('expected_delivery_date');
    t.date('received_date');
    t.decimal('subtotal', 12, 2).notNullable().defaultTo(0);
    t.decimal('tax_amount', 12, 2).notNullable().defaultTo(0);
    t.decimal('discount_amount', 12, 2).notNullable().defaultTo(0);
    t.decimal('total_amount', 12, 2).notNullable().defaultTo(0);
    t.decimal('paid_amount', 12, 2).notNullable().defaultTo(0);
    t.string('currency', 3).notNullable().defaultTo('USD');
    t.string('status').notNullable().defaultTo('pending');
    t.string('payment_status').notNullable().defaultTo('pending');
    t.text('notes');
    t.text('terms_conditions');
    t.timestamps(true, true);

    t.index(['supplier_id']);
    t.index(['purchase_date']);
    t.index(['status']);
    t.index(['payment_status']);
  });

  await knex.schema.createTable('purchase_items', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('purchase_id').notNullable().references('id').inTable('purchases').onDelete('CASCADE');
    t.string('product_id').notNullable();
    t.string('product_name');
    t.string('product_sku');
    t.text('description');
    t.integer('quantity').notNullable();
    t.decimal('unit_price', 12, 2).notNullable();
    t.decimal('discount_amount', 12, 2).notNullable().defaultTo(0);
    t.decimal('tax_amount', 12, 2).notNullable().defaultTo(0);
    t.decimal('line_total', 12, 2).notNullable();
    t.integer('received_quantity').notNullable().defaultTo(0);
    t.timestamps(true, true);

    t.index(['purchase_id']);
    t.index(['product_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('purchase_items');
  await knex.schema.dropTableIfExists('purchases');
}
