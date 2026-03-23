import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Suppliers table
  await knex.schema.createTable('suppliers', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.string('name').notNullable();
    t.string('contact_person');
    t.string('email').unique();
    t.string('phone');
    t.text('address');
    t.string('city');
    t.string('state');
    t.string('postal_code');
    t.string('country').notNullable().defaultTo('US');
    t.string('tax_id');
    t.string('status').notNullable().defaultTo('active');
    t.decimal('credit_limit', 12, 2).notNullable().defaultTo(0);
    t.string('payment_terms').defaultTo('net_30');
    t.string('currency').defaultTo('USD');
    t.string('website');
    t.text('notes');
    t.timestamps(true, true);

    t.index(['name']);
    t.index(['email']);
    t.index(['status']);
    t.index(['country']);
  });

  // Supplier contacts table (multiple contacts per supplier)
  await knex.schema.createTable('supplier_contacts', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('supplier_id').notNullable().references('id').inTable('suppliers').onDelete('CASCADE');
    t.string('name').notNullable();
    t.string('email');
    t.string('phone');
    t.string('role');
    t.boolean('is_primary').defaultTo(false);
    t.timestamps(true, true);

    t.index(['supplier_id']);
  });

  // Supplier performance / rating history
  await knex.schema.createTable('supplier_ratings', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    t.uuid('supplier_id').notNullable().references('id').inTable('suppliers').onDelete('CASCADE');
    t.integer('quality_score').notNullable().defaultTo(0);
    t.integer('delivery_score').notNullable().defaultTo(0);
    t.integer('pricing_score').notNullable().defaultTo(0);
    t.integer('overall_score').notNullable().defaultTo(0);
    t.text('comments');
    t.string('rated_by');
    t.timestamp('rated_at').defaultTo(knex.fn.now());
    t.timestamps(true, true);

    t.index(['supplier_id']);
    t.index(['rated_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('supplier_ratings');
  await knex.schema.dropTableIfExists('supplier_contacts');
  await knex.schema.dropTableIfExists('suppliers');
}
