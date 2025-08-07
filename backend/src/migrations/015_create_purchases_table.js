exports.up = function(knex) {
  return knex.schema.createTable('purchases', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('purchase_number').unique().notNullable();
    table.uuid('supplier_id').notNullable();
    table.date('purchase_date').notNullable();
    table.date('expected_delivery_date');
    table.date('received_date');
    table.decimal('subtotal', 12, 2).notNullable().defaultTo(0);
    table.decimal('tax_amount', 12, 2).notNullable().defaultTo(0);
    table.decimal('discount_amount', 12, 2).notNullable().defaultTo(0);
    table.decimal('total_amount', 12, 2).notNullable().defaultTo(0);
    table.decimal('paid_amount', 12, 2).notNullable().defaultTo(0);
    table.string('currency', 3).notNullable().defaultTo('USD');
    table.enum('status', ['pending', 'ordered', 'received', 'cancelled']).notNullable().defaultTo('pending');
    table.enum('payment_status', ['pending', 'partial', 'paid']).notNullable().defaultTo('pending');
    table.text('notes');
    table.text('terms_conditions');
    table.timestamps(true, true);
    
    table.index(['supplier_id']);
    table.index(['purchase_date']);
    table.index(['status']);
    table.index(['payment_status']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('purchases');
};