exports.up = function(knex) {
  return knex.schema.createTable('customer_credit_history', function(table) {
    table.increments('id').primary();
    table.integer('customer_id').unsigned().references('id').inTable('customers').onDelete('CASCADE');
    table.decimal('amount', 15, 2).notNullable();
    table.enum('type', ['add', 'subtract', 'adjustment', 'payment', 'refund']).notNullable();
    table.decimal('previous_credit', 15, 2).notNullable();
    table.decimal('new_credit', 15, 2).notNullable();
    table.text('reason');
    table.integer('reference_id').unsigned(); // Payment ID, Invoice ID, etc.
    table.string('reference_type'); // payment, invoice, manual_adjustment
    table.integer('created_by').unsigned().references('id').inTable('users');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    table.index(['customer_id']);
    table.index(['type']);
    table.index(['reference_id', 'reference_type']);
    table.index(['created_at']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('customer_credit_history');
};