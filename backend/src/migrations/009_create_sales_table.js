exports.up = function(knex) {
  return knex.schema.createTable('sales', function(table) {
    table.increments('id').primary();
    table.string('sale_number').unique().notNullable();
    table.integer('customer_id').unsigned().references('id').inTable('customers').onDelete('RESTRICT');
    table.date('sale_date').notNullable();
    table.date('due_date').notNullable();
    table.decimal('subtotal', 15, 2).notNullable();
    table.decimal('tax_amount', 15, 2).defaultTo(0);
    table.decimal('discount_amount', 15, 2).defaultTo(0);
    table.decimal('total_amount', 15, 2).notNullable();
    table.decimal('paid_amount', 15, 2).defaultTo(0);
    table.decimal('balance_amount', 15, 2).notNullable();
    table.enum('status', ['draft', 'pending', 'partially_paid', 'paid', 'overdue', 'cancelled']).defaultTo('draft');
    table.enum('payment_status', ['unpaid', 'partially_paid', 'paid', 'overpaid']).defaultTo('unpaid');
    table.string('currency', 3).defaultTo('USD');
    table.text('notes');
    table.text('terms_conditions');
    table.json('metadata'); // Additional sale information
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    table.index(['sale_number']);
    table.index(['customer_id']);
    table.index(['status']);
    table.index(['payment_status']);
    table.index(['sale_date']);
    table.index(['due_date']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('sales');
};