import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('quotation_history', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('quotation_id').notNullable().references('id').inTable('quotations').onDelete('CASCADE');
    table.enum('action', ['created', 'sent', 'accepted', 'declined', 'expired', 'converted_to_sale', 'updated']).notNullable();
    table.text('notes');
    table.string('performed_by');
    table.timestamp('timestamp').defaultTo(knex.fn.now());

    table.index(['quotation_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('quotation_history');
}
