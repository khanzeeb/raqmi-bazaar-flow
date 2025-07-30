exports.up = function(knex) {
  return knex.schema.createTable('sale_items', function(table) {
    table.increments('id').primary();
    table.integer('sale_id').unsigned().references('id').inTable('sales').onDelete('CASCADE');
    table.integer('product_id').unsigned().references('id').inTable('products').onDelete('RESTRICT');
    table.string('product_name').notNullable(); // Store product name at time of sale
    table.string('product_sku'); // Store SKU at time of sale
    table.decimal('quantity', 10, 2).notNullable();
    table.decimal('unit_price', 15, 2).notNullable();
    table.decimal('discount_amount', 15, 2).defaultTo(0);
    table.decimal('tax_amount', 15, 2).defaultTo(0);
    table.decimal('line_total', 15, 2).notNullable();
    table.text('description');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    table.index(['sale_id']);
    table.index(['product_id']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('sale_items');
};