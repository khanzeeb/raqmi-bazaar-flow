import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('quotation_items', (table) => {
    table.increments('id').primary();
    table.integer('quotation_id').notNullable();
    table.foreign('quotation_id').references('quotations.id').onDelete('CASCADE');
    
    table.integer('product_id').notNullable();
    
    table.string('product_name', 255).notNullable();
    table.string('product_sku', 100);
    table.text('description');
    
    table.decimal('quantity', 10, 3).notNullable();
    table.decimal('unit_price', 12, 2).notNullable();
    table.decimal('discount_amount', 12, 2).defaultTo(0);
    table.decimal('tax_amount', 12, 2).defaultTo(0);
    table.decimal('line_total', 12, 2).notNullable();
    
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    table.index(['quotation_id']);
    table.index(['product_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('quotation_items');
}
