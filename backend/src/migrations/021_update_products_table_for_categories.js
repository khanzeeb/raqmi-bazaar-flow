exports.up = function(knex) {
  return knex.schema.alterTable('products', function(table) {
    // Change category from string to foreign key
    table.uuid('category_id').references('id').inTable('product_categories').onDelete('SET NULL');
    table.index(['category_id']);
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('products', function(table) {
    table.dropColumn('category_id');
  });
};