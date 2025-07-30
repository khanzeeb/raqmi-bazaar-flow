exports.up = function(knex) {
  return knex.schema.createTable('payment_allocations', function(table) {
    table.increments('id').primary();
    table.integer('payment_id').unsigned().references('id').inTable('payments').onDelete('CASCADE');
    table.string('order_type').defaultTo('invoice'); // invoice, sales_order, quotation
    table.integer('order_id').unsigned().notNullable(); // References the specific order table
    table.string('order_number').notNullable();
    table.decimal('allocated_amount', 15, 2).notNullable();
    table.decimal('order_total', 15, 2).notNullable();
    table.decimal('previously_paid', 15, 2).defaultTo(0);
    table.decimal('remaining_after_payment', 15, 2).notNullable();
    table.timestamp('allocated_at').defaultTo(knex.fn.now());
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    table.index(['payment_id']);
    table.index(['order_id', 'order_type']);
    table.index(['order_number']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('payment_allocations');
};