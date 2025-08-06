exports.up = function(knex) {
  return knex.schema.createTable('quotations', table => {
    table.increments('id').primary();
    table.string('quotation_number', 100).notNullable().unique();
    table.integer('customer_id').notNullable();
    table.foreign('customer_id').references('customers.id').onDelete('CASCADE');
    
    table.date('quotation_date').notNullable();
    table.date('validity_date').notNullable();
    
    table.decimal('subtotal', 12, 2).notNullable().defaultTo(0);
    table.decimal('tax_amount', 12, 2).defaultTo(0);
    table.decimal('discount_amount', 12, 2).defaultTo(0);
    table.decimal('total_amount', 12, 2).notNullable().defaultTo(0);
    table.string('currency', 3).defaultTo('USD');
    
    table.enum('status', ['draft', 'sent', 'accepted', 'declined', 'expired', 'converted']).defaultTo('draft');
    
    table.text('notes');
    table.text('terms_conditions');
    
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    table.index(['customer_id']);
    table.index(['quotation_date']);
    table.index(['status']);
    table.index(['quotation_number']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('quotations');
};