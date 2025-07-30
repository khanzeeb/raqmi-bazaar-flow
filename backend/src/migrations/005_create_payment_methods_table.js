exports.up = function(knex) {
  return knex.schema.createTable('payment_methods', function(table) {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('code').unique().notNullable(); // cash, bank_transfer, credit, check
    table.text('description');
    table.boolean('is_active').defaultTo(true);
    table.boolean('requires_reference').defaultTo(false);
    table.boolean('requires_approval').defaultTo(false);
    table.json('validation_rules'); // JSON object for additional validation rules
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    table.index(['code']);
    table.index(['is_active']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('payment_methods');
};