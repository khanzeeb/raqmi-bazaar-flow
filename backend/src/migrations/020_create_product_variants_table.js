exports.up = function(knex) {
  return knex.schema.createTable('product_variants', function(table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('product_id').references('id').inTable('products').onDelete('CASCADE').notNullable();
    table.string('name').notNullable();
    table.string('sku').unique();
    table.string('barcode');
    table.decimal('price', 10, 2).notNullable();
    table.decimal('cost', 10, 2).notNullable();
    table.integer('stock').defaultTo(0);
    table.integer('min_stock').defaultTo(0);
    table.decimal('weight', 8, 2);
    table.json('dimensions');
    table.json('attributes'); // color, size, material, etc.
    table.string('image');
    table.json('images');
    table.enu('status', ['active', 'inactive']).defaultTo('active');
    table.integer('sort_order').defaultTo(0);
    table.timestamps(true, true);
    
    table.index(['product_id']);
    table.index(['status']);
    table.index(['sku']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('product_variants');
};