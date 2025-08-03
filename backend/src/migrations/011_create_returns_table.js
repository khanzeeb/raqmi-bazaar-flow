exports.up = function(knex) {
  return knex.schema.createTable('returns', function(table) {
    table.increments('id').primary();
    table.string('return_number').notNullable().unique();
    table.integer('sale_id').unsigned().notNullable();
    table.integer('customer_id').unsigned().notNullable();
    table.date('return_date').notNullable();
    table.enum('return_type', ['full', 'partial']).notNullable();
    table.enum('reason', ['defective', 'wrong_item', 'not_needed', 'damaged', 'other']).notNullable();
    table.text('notes');
    table.decimal('total_amount', 10, 2).notNullable().defaultTo(0);
    table.decimal('refund_amount', 10, 2).notNullable().defaultTo(0);
    table.enum('refund_status', ['pending', 'processed', 'cancelled']).notNullable().defaultTo('pending');
    table.enum('status', ['pending', 'approved', 'rejected', 'completed']).notNullable().defaultTo('pending');
    table.integer('processed_by').unsigned();
    table.timestamp('processed_at');
    table.timestamps(true, true);
    
    table.foreign('sale_id').references('id').inTable('sales').onDelete('cascade');
    table.foreign('customer_id').references('id').inTable('customers').onDelete('cascade');
    table.foreign('processed_by').references('id').inTable('users').onDelete('set null');
    
    table.index(['sale_id']);
    table.index(['customer_id']);
    table.index(['return_date']);
    table.index(['status']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('returns');
};