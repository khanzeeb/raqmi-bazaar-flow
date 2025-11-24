import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('invoices', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('invoice_number').notNullable().unique();
    table.uuid('customer_id').notNullable();
    table.string('customer_name').notNullable();
    table.string('customer_email').notNullable();
    table.string('customer_phone');
    table.text('customer_address');
    table.date('issue_date').notNullable();
    table.date('due_date').notNullable();
    table.enum('status', ['draft', 'sent', 'paid', 'overdue', 'cancelled']).defaultTo('draft');
    table.decimal('subtotal', 12, 2).notNullable().defaultTo(0);
    table.decimal('tax_amount', 12, 2).notNullable().defaultTo(0);
    table.decimal('tax_rate', 5, 2).notNullable().defaultTo(0);
    table.decimal('discount_amount', 12, 2).notNullable().defaultTo(0);
    table.enum('discount_type', ['percentage', 'fixed']).defaultTo('fixed');
    table.decimal('total_amount', 12, 2).notNullable().defaultTo(0);
    table.decimal('paid_amount', 12, 2).notNullable().defaultTo(0);
    table.decimal('balance', 12, 2).notNullable().defaultTo(0);
    table.text('notes');
    table.text('terms');
    table.string('payment_terms');
    table.timestamps(true, true);
    
    table.index('customer_id');
    table.index('status');
    table.index('issue_date');
    table.index('due_date');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('invoices');
}
