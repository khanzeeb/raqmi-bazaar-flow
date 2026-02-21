import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('quotations', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('quotation_number', 100).notNullable().unique();
    table.string('customer_id').notNullable();
    table.string('customer_name').notNullable();
    table.string('customer_email');
    table.string('customer_phone');
    table.string('customer_type').defaultTo('individual');
    table.date('quotation_date').notNullable();
    table.date('validity_date').notNullable();
    table.integer('validity_days').defaultTo(30);
    table.decimal('subtotal', 15, 2).defaultTo(0);
    table.decimal('tax_rate', 5, 2).defaultTo(0);
    table.decimal('tax_amount', 15, 2).defaultTo(0);
    table.decimal('discount_amount', 15, 2).defaultTo(0);
    table.decimal('total_amount', 15, 2).defaultTo(0);
    table.string('currency', 10).defaultTo('SAR');
    table.enum('status', ['draft', 'sent', 'accepted', 'declined', 'expired', 'converted']).defaultTo('draft');
    table.text('notes');
    table.text('terms_conditions');
    table.string('converted_to_sale_id');
    table.string('decline_reason');
    table.timestamps(true, true);

    table.index(['customer_id']);
    table.index(['quotation_date']);
    table.index(['status']);
    table.index(['quotation_number']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('quotations');
}
