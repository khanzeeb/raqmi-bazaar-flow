import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('invoice_items', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('invoice_id').notNullable().references('id').inTable('invoices').onDelete('CASCADE');
    table.uuid('product_id');
    table.string('product_name').notNullable();
    table.text('description');
    table.decimal('quantity', 12, 2).notNullable();
    table.decimal('unit_price', 12, 2).notNullable();
    table.decimal('discount', 12, 2).notNullable().defaultTo(0);
    table.decimal('tax_rate', 5, 2).notNullable().defaultTo(0);
    table.decimal('total', 12, 2).notNullable();
    table.timestamps(true, true);
    
    table.index('invoice_id');
    table.index('product_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('invoice_items');
}
