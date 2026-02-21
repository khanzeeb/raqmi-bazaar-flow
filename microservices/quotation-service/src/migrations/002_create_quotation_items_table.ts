import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('quotation_items', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('quotation_id').notNullable().references('id').inTable('quotations').onDelete('CASCADE');
    table.string('product_id').notNullable();
    table.string('product_name').notNullable();
    table.string('product_sku');
    table.text('description');
    table.integer('quantity').notNullable();
    table.decimal('unit_price', 15, 2).notNullable();
    table.decimal('discount_amount', 15, 2).defaultTo(0);
    table.decimal('tax_amount', 15, 2).defaultTo(0);
    table.decimal('line_total', 15, 2).notNullable();
    table.timestamps(true, true);

    table.index(['quotation_id']);
    table.index(['product_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('quotation_items');
}
