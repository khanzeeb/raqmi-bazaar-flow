exports.up = function(knex) {
  return knex.schema.createTable('return_items', function(table) {
    table.increments('id').primary();
    table.integer('return_id').unsigned().notNullable();
    table.integer('sale_item_id').unsigned().notNullable();
    table.integer('product_id').unsigned().notNullable();
    table.string('product_name').notNullable();
    table.string('product_sku');
    table.integer('quantity_returned').notNullable();
    table.integer('original_quantity').notNullable();
    table.decimal('unit_price', 10, 2).notNullable();
    table.decimal('line_total', 10, 2).notNullable();
    table.enum('condition', ['good', 'damaged', 'defective', 'unopened']).notNullable();
    table.text('notes');
    table.timestamps(true, true);
    
    table.foreign('return_id').references('id').inTable('returns').onDelete('cascade');
    table.foreign('sale_item_id').references('id').inTable('sale_items').onDelete('cascade');
    table.foreign('product_id').references('id').inTable('products').onDelete('cascade');
    
    table.index(['return_id']);
    table.index(['sale_item_id']);
    table.index(['product_id']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('return_items');
};