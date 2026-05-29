import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

  await knex.schema.createTable('payments', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('payment_number').notNullable().unique();
    t.uuid('customer_id').notNullable();
    t.string('customer_name').notNullable();
    t.decimal('amount', 15, 2).notNullable();
    t.decimal('allocated_amount', 15, 2).notNullable().defaultTo(0);
    t.decimal('unallocated_amount', 15, 2).notNullable().defaultTo(0);
    t.enum('payment_method', [
      'cash', 'credit_card', 'debit_card',
      'bank_transfer', 'cheque', 'mobile_payment', 'other',
    ]).notNullable();
    t.date('payment_date').notNullable();
    t.enum('status', ['pending', 'completed', 'failed', 'cancelled', 'refunded'])
      .notNullable()
      .defaultTo('pending');
    t.string('reference');
    t.text('notes');
    t.string('cheque_image_path');
    t.jsonb('metadata');
    t.timestamp('approved_at');
    t.uuid('approved_by');
    t.timestamps(true, true);

    t.index(['customer_id']);
    t.index(['status']);
    t.index(['payment_date']);
    t.index(['payment_method']);
  });

  await knex.schema.createTable('payment_allocations', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('payment_id').notNullable()
      .references('id').inTable('payments').onDelete('CASCADE');
    t.enum('target_type', ['invoice', 'order']).notNullable();
    t.uuid('target_id').notNullable();
    t.decimal('amount', 15, 2).notNullable();
    t.timestamp('allocated_at').notNullable().defaultTo(knex.fn.now());

    t.index(['payment_id']);
    t.index(['target_type', 'target_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('payment_allocations');
  await knex.schema.dropTableIfExists('payments');
}
