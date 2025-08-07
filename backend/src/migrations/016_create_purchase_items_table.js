exports.up = function(knex) {
  return knex.schema.createTable('purchase_items', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('purchase_id').notNullable().references('id').inTable('purchases').onDelete('CASCADE');
    table.uuid('product_id').notNullable().references('id').inTable('products').onDelete('RESTRICT');
    table.string('product_name').notNullable();
    table.string('product_sku');
    table.text('description');
    table.decimal('quantity', 10, 3).notNullable();
    table.decimal('unit_price', 10, 2).notNullable();
    table.decimal('discount_amount', 10, 2).notNullable().defaultTo(0);
    table.decimal('tax_amount', 10, 2).notNullable().defaultTo(0);
    table.decimal('line_total', 12, 2).notNullable();
    table.decimal('received_quantity', 10, 3).notNullable().defaultTo(0);
    table.timestamps(true, true);
    
    table.index(['purchase_id']);
    table.index(['product_id']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('purchase_items');
};