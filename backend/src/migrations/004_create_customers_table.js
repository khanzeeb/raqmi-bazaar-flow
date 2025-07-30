exports.up = function(knex) {
  return knex.schema.createTable('customers', function(table) {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('email').unique();
    table.string('phone');
    table.string('company');
    table.text('address');
    table.string('tax_number');
    table.enum('type', ['individual', 'business']).defaultTo('individual');
    table.enum('status', ['active', 'inactive', 'blocked']).defaultTo('active');
    table.decimal('credit_limit', 15, 2).defaultTo(0);
    table.decimal('used_credit', 15, 2).defaultTo(0);
    table.decimal('available_credit', 15, 2).defaultTo(0);
    table.decimal('overdue_amount', 15, 2).defaultTo(0);
    table.decimal('total_outstanding', 15, 2).defaultTo(0);
    table.enum('credit_status', ['good', 'warning', 'blocked']).defaultTo('good');
    table.string('payment_terms').defaultTo('net_30');
    table.string('preferred_language', 2).defaultTo('en');
    table.timestamp('last_payment_date');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    table.index(['email']);
    table.index(['status']);
    table.index(['credit_status']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('customers');
};