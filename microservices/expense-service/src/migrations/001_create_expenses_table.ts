import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('expenses', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('expense_number').unique().notNullable();
    table.date('expense_date').notNullable();
    table.string('title').notNullable();
    table.text('description');
    table.enum('category', [
      'office_supplies',
      'utilities',
      'rent',
      'marketing',
      'travel',
      'meals',
      'software',
      'equipment',
      'professional_services',
      'insurance',
      'taxes',
      'other'
    ]).notNullable();
    table.decimal('amount', 12, 2).notNullable();
    table.string('currency', 3).notNullable().defaultTo('SAR');
    table.enum('status', ['pending', 'approved', 'paid', 'cancelled']).notNullable().defaultTo('pending');
    table.enum('payment_method', ['cash', 'check', 'bank_transfer', 'credit_card', 'debit_card']).notNullable();
    table.string('vendor');
    table.string('receipt_url');
    table.boolean('receipt_attached').notNullable().defaultTo(false);
    table.text('notes');
    table.timestamps(true, true);
    
    table.index(['expense_date']);
    table.index(['category']);
    table.index(['status']);
    table.index(['vendor']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('expenses');
}
