exports.up = function(knex) {
  return knex.schema.createTable('payments', function(table) {
    table.increments('id').primary();
    table.string('payment_number').unique().notNullable();
    table.integer('customer_id').unsigned().references('id').inTable('customers').onDelete('RESTRICT');
    table.decimal('amount', 15, 2).notNullable();
    table.string('payment_method_code').references('code').inTable('payment_methods');
    table.date('payment_date').notNullable();
    table.enum('status', ['pending', 'completed', 'failed', 'cancelled']).defaultTo('pending');
    table.string('reference'); // Check number, transaction reference, etc.
    table.text('notes');
    table.string('cheque_image_path'); // For bank cheques
    table.json('metadata'); // Additional payment information
    table.decimal('allocated_amount', 15, 2).defaultTo(0); // Amount allocated to orders
    table.decimal('unallocated_amount', 15, 2).defaultTo(0); // Remaining unallocated amount
    table.timestamp('approved_at');
    table.integer('approved_by').unsigned().references('id').inTable('users');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    table.index(['payment_number']);
    table.index(['customer_id']);
    table.index(['payment_method_code']);
    table.index(['status']);
    table.index(['payment_date']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('payments');
};